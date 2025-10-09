FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PRODUCTION true

WORKDIR /app

# Install system dependencies required by some Python packages (cairosvg, lxml, etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gcc \
       libxml2-dev \
       libxslt1-dev \
       libffi-dev \
       libssl-dev \
       libcairo2 \
       libcairo2-dev \
       libpango1.0-0 \
       libpango1.0-dev \
       libjpeg-dev \
       zlib1g-dev \
       git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app/

# Create a non-root user
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

RUN mkdir -p /app/staticfiles /app/media

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "IAFASTTRACKMODEL.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
