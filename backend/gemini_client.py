import os
import requests

def gemini_generate(api_key: str, prompt: str) -> str:
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key,  # header, not query param
    }
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    r = requests.post(url, headers=headers, json=payload, timeout=60)
    if r.status_code != 200:
        # return readable message for logs/UI instead of crashing
        try:
            err = r.json()
        except Exception:
            err = {"status_code": r.status_code, "text": r.text[:500]}
        return f"(Gemini error {r.status_code}) {err}"

    data = r.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return str(data)[:1000]