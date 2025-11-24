from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from repo root explicitly
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

class Settings:
    AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
    S3_BUCKET  = os.getenv("S3_BUCKET")
    DDB_TABLE  = os.getenv("DDB_TABLE")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    # App tuning
    MAX_CONTEXT_CHARS = 18_000  # keep prompts manageable
    ALLOWED_ORIGINS = "*"
