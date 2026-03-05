import requests
import os

def ollama_generate(prompt: str, model: str = "mistral") -> str:
    """
    Generate text using Ollama (local AI model)
    - Completely free
    - Runs locally on your machine
    - No API key needed
    - No quota limits

    Setup:
    1. Download Ollama from https://ollama.ai/
    2. Run: ollama pull mistral (or llama2)
    3. Ollama runs on localhost:11434
    """

    url = "http://localhost:11434/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }

    try:
        r = requests.post(url, json=payload, timeout=120)

        if r.status_code != 200:
            return f"(Ollama error {r.status_code}) Make sure Ollama is running: ollama serve"

        data = r.json()
        response = data.get("response", "").strip()

        if not response:
            return "(Ollama) No response generated"

        return response

    except requests.exceptions.ConnectionError:
        return "(Ollama error) Could not connect to Ollama. Make sure it's running on localhost:11434. Download from https://ollama.ai/ and run: ollama serve"
    except Exception as e:
        return f"(Ollama error) {str(e)}"


def groq_generate(api_key: str, messages: list[dict], model: str = None) -> str:
    """
    Generate text using Groq API (free tier: 8,000 requests/day)
    - Free API key at https://console.groq.com
    - No credit card needed
    - Very fast inference
    - messages: list of {"role": "system/user/assistant", "content": "..."} dicts
    """
    # Try models in order of preference (currently available in 2026)
    if model is None:
        available_models = [
            "llama-3.3-70b-versatile",       # Latest available Groq model
            "llama-3.1-8b-instant",          # Smaller fallback
        ]
        # For now, use the first one
        model = available_models[0]

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=60)

        if r.status_code != 200:
            try:
                err = r.json()
            except:
                err = {"status_code": r.status_code}
            return f"(Groq error {r.status_code}) {err}"

        data = r.json()
        response = data["choices"][0]["message"]["content"].strip()

        return response

    except requests.exceptions.ConnectionError:
        return "(Groq error) Could not connect to Groq API"
    except Exception as e:
        return f"(Groq error) {str(e)}"
