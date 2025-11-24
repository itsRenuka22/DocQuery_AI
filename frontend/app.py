import os
import uuid 
import requests 
import streamlit as st

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

st.set_page_config(page_title="DocQuery AI", page_icon="📄")
st.title("📄 DocQuery AI — Chat with your PDFs")

if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

with st.sidebar:
    st.text_input("Session ID", key="session_id")
    st.caption("Use a stable session id to reuse uploaded PDFs.")

# Upload & ingest
pdfs = st.file_uploader("Upload PDF(s)", type=["pdf"], accept_multiple_files=True)
if st.button("Ingest PDFs") and pdfs:
    files = [("files", (f.name, f.getvalue(), "application/pdf")) for f in pdfs]
    data = {"session_id": st.session_state.session_id}
    r = requests.post(f"{BACKEND_URL}/ingest", files=files, data=data, timeout=120)
    st.success(r.json())

# Ask
q = st.chat_input("Ask about your documents…")
if q:
    payload = {"session_id": st.session_state.session_id, "question": q}
    r = requests.post(f"{BACKEND_URL}/ask", json=payload, timeout=120)
    out = r.json()
    with st.chat_message("user"): st.write(q)
    with st.chat_message("assistant"):
        st.write(out.get("answer", "(no answer)"))
        st.caption(f"Source: {out.get('source','-')} | Context chars: {out.get('contextChars',0)}")
