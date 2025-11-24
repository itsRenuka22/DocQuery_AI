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
from backend.gemini_client import gemini_generate

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
    rdr = PdfReader(io.BytesIO(pdf_bytes))
    buf = []
    for p in rdr.pages:
        buf.append(p.extract_text() or "")
    text = "\n".join(buf)
    # cap context length to keep prompt small
    return text[:S.MAX_CONTEXT_CHARS]

@app.post("/ask")
async def ask(req: ChatReq):
    """
    For MVP: fetch first uploaded PDF (if any), extract text, ask Gemini with Q + context.
    Later you’ll add retrieval + multiple docs.
    """
    context = ""
    src = "inline"
    if _s3 and S.S3_BUCKET:
        # naïve: try first file under session_id/pdfs/
        resp = _s3.list_objects_v2(Bucket=S.S3_BUCKET, Prefix=f"{req.session_id}/pdfs/")
        logging.info(f"Asked: {req.question} (session={req.session_id})")
        items = [o["Key"] for o in resp.get("Contents", []) if o["Key"].lower().endswith(".pdf")]
        if items:
            # download first PDF and extract text
            obj = _s3.get_object(Bucket=S.S3_BUCKET, Key=items[0])
            pdf_bytes = obj["Body"].read()
            context = _pdf_text_from_bytes(pdf_bytes)
            src = items[0]
        
        if not items:
             return {"answer": "Please upload a PDF first.", "source": "none", "contextChars": 0}

    prompt = (
        "You are a helpful assistant. Use the provided document text to answer the question. "
        "If the answer is not in the text, say you’re unsure.\n\n"
        f"Question: {req.question}\n\n"
        f"Document text (may be truncated):\n{context}\n\nAnswer:"
    )

    answer = gemini_generate(S.GEMINI_API_KEY, prompt) if S.GEMINI_API_KEY else "(No GEMINI_API_KEY set)"
    # write to DynamoDB if configured
    if _ddb:
        _ddb.put_item(Item={
            "session_id": req.session_id,
            "ts": int(time.time()*1000),
            "question": req.question,
            "answer": answer,
            "source": src
        })
    return {"answer": answer, "source": src, "contextChars": len(context)}
