from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from typing import Optional
from pypdf import PdfReader
import io
import time 
import json

from backend.settings import Settings
from backend.aws_utils import s3_client, ddb_table
from backend.ollama_client import groq_generate

import logging
logging.basicConfig(level=logging.INFO)


S = Settings()
app = FastAPI(title="DocQuery AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[S.ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_s3 = s3_client(S.AWS_REGION) if S.S3_BUCKET else None
_ddb = ddb_table(S.AWS_REGION, S.DDB_TABLE) if S.DDB_TABLE else None

class ChatReq(BaseModel):
    session_id: str
    question: str
    history: list[dict] = []

@app.get("/health")
def health():
    return {"ok": True, "bucket": S.S3_BUCKET, "table": S.DDB_TABLE}

@app.post("/ingest")
async def ingest(session_id: str = Form(...), files: List[UploadFile] = File(...)):
    """
    Upload PDFs to S3 under {session_id}/pdfs/ and return S3 keys.
    """
    keys = []
    for f in files:
        data = await f.read()
        key = f"{session_id}/pdfs/{f.filename}"
        if _s3:
            _s3.put_object(Bucket=S.S3_BUCKET, Key=key, Body=data, ContentType="application/pdf")
            logging.info(f"Ingested: {key}")
        keys.append(key)
    return {"session_id": session_id, "files": keys}

def _pdf_text_from_bytes(pdf_bytes: bytes) -> str:
    try:
        logging.info(f"PDF bytes received: {len(pdf_bytes)} bytes")
        rdr = PdfReader(io.BytesIO(pdf_bytes))
        logging.info(f"PDF pages found: {len(rdr.pages)}")

        if len(rdr.pages) == 0:
            logging.warning("PDF has no pages")
            return ""

        buf = []
        for i, p in enumerate(rdr.pages):
            try:
                extracted = p.extract_text() or ""
                logging.debug(f"Page {i}: extracted {len(extracted)} chars")
                buf.append(extracted)
            except Exception as e:
                logging.warning(f"Failed to extract text from page {i}: {str(e)}")
                buf.append("")

        text = "\n".join(buf)
        logging.info(f"Total text extracted: {len(text)} chars")

        # cap context length to keep prompt small
        return text[:S.MAX_CONTEXT_CHARS]
    except Exception as e:
        logging.error(f"PDF extraction error: {str(e)}", exc_info=True)
        return ""

@app.post("/ask")
async def ask(req: ChatReq):
    """
    For MVP: fetch first uploaded PDF (if any), extract text, ask Groq with Q + context.
    Later you'll add retrieval + multiple docs.
    """
    context = ""
    src = "inline"
    if _s3 and S.S3_BUCKET:
        # List all PDFs in this session
        resp = _s3.list_objects_v2(Bucket=S.S3_BUCKET, Prefix=f"{req.session_id}/pdfs/")
        logging.info(f"Asked: {req.question} (session={req.session_id})")

        # Filter PDF files and sort by last modified (most recent first)
        items = [o for o in resp.get("Contents", []) if o["Key"].lower().endswith(".pdf")]
        if items:
            # Sort by LastModified descending to get the most recently uploaded PDF
            items.sort(key=lambda x: x.get("LastModified", 0), reverse=True)
            pdf_key = items[0]["Key"]
            pdf_size = items[0].get("Size", 0)

            logging.info(f"Using PDF: {pdf_key} (size: {pdf_size} bytes)")

            try:
                # Download and extract text from the most recent PDF
                obj = _s3.get_object(Bucket=S.S3_BUCKET, Key=pdf_key)
                pdf_bytes = obj["Body"].read()
                logging.info(f"Downloaded PDF: {len(pdf_bytes)} bytes from S3")

                context = _pdf_text_from_bytes(pdf_bytes)
                src = pdf_key

                if not context or len(context.strip()) == 0:
                    logging.warning(f"PDF extracted but text is empty. File size was {len(pdf_bytes)} bytes")
                    return {
                        "answer": f"The PDF '{pdf_key.split('/')[-1]}' was uploaded but contains no readable text. This might be a scanned image PDF, a corrupted file, or an encrypted document. Please verify the PDF is readable.",
                        "source": pdf_key,
                        "contextChars": 0
                    }

            except Exception as e:
                logging.error(f"Error reading PDF from S3: {str(e)}", exc_info=True)
                return {
                    "answer": f"Error reading the PDF file: {str(e)}",
                    "source": "error",
                    "contextChars": 0
                }

        if not items:
             return {"answer": "Please upload a PDF first.", "source": "none", "contextChars": 0}

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. Answer questions based on the document below. "
                "If the answer is not in the text, say you're unsure.\n\n"
                f"Document text (may be truncated):\n{context}"
            )
        },
        *req.history,
        {"role": "user", "content": req.question}
    ]

    answer = groq_generate(S.GROQ_API_KEY, messages) if S.GROQ_API_KEY else "(No GROQ_API_KEY set)"
    # write to DynamoDB if configured
    if _ddb:
        # Per-turn Q&A log (unchanged from original)
        _ddb.put_item(Item={
            "session_id": req.session_id,
            "ts": int(time.time()*1000),
            "question": req.question,
            "answer": answer,
            "source": src
        })
        # Full conversation history (for multi-turn support)
        updated_history = [
            *req.history,
            {"role": "user", "content": req.question},
            {"role": "assistant", "content": answer}
        ]
        _ddb.put_item(Item={
            "session_id": f"history:{req.session_id}",
            "ts": 0,
            "history": updated_history
        })
    return {"answer": answer, "source": src, "contextChars": len(context)}

@app.get("/history/{session_id}")
async def get_history(session_id: str):
    """
    Retrieve full conversation history for a session.
    Returns empty history if session not found or DynamoDB not configured.
    """
    if not _ddb:
        return {"history": []}
    try:
        resp = _ddb.get_item(Key={"session_id": f"history:{session_id}", "ts": 0})
        item = resp.get("Item", {})
        return {"history": item.get("history", [])}
    except Exception as e:
        logging.error(f"Error fetching history for {session_id}: {str(e)}")
        return {"history": []}
