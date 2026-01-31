# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Node.js and PostgreSQL client
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    postgresql-client \
    curl \
    netcat-traditional \
    procps \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify Node.js installation
RUN node --version && npm --version

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Copy .env file if it exists
COPY .env* ./

# Create a non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Set environment variables for MCP servers and Python path
ENV PYTHONPATH=/app
ENV PATH=/usr/local/bin:/usr/bin:/bin
ENV MCP_CONFIG_FILE=/app/config.json

USER appuser

# Expose the port
EXPOSE 6500

# Make start.sh executable
RUN chmod +x start.sh

# Run the start script
CMD ["./start.sh"]