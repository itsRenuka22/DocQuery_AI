FROM python:3.11-slim
WORKDIR /app

# context is ./frontend
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm -rf /root/.cache/pip

# copy the app code (app.py lives in the context root)
COPY . /app

ENV STREAMLIT_SERVER_PORT=8501
# use python -m streamlit to avoid PATH issues
CMD ["python", "-m", "streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"]
