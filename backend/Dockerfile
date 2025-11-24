FROM python:3.11-slim
WORKDIR /app

# context is ./backend
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm -rf /root/.cache/pip

COPY . /app/backend
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
