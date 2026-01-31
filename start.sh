#!/bin/bash

# Start script for langchain_chatbot

echo "Starting langchain_chatbot..."

# Detect if running in Docker
if [ -f "/.dockerenv" ]; then
    echo "Running in Docker environment"
    DOCKER_ENV=true
else
    echo "Running in native environment"
    DOCKER_ENV=false
fi

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "No .env file found. Using environment variables from Docker."
fi

# Check if required environment variables are set
if [ -z "$DB_URI" ]; then
    echo "Warning: DB_URI environment variable is not set. Database persistence will be disabled."
else
    echo "Database URI configured for connection"
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo "Warning: GOOGLE_API_KEY environment variable is not set. The chatbot may not function properly."
else
    echo "Google API key configured"
fi

# Check if config.json exists
if [ ! -f "config.json" ]; then
    echo "Error: config.json not found in the current directory."
    exit 1
fi

# Wait for network connectivity in Docker
if [ "$DOCKER_ENV" = true ] && [ -n "$DB_URI" ]; then
    echo "Waiting for database connectivity..."
    # Extract host from DB_URI for connectivity check
    DB_HOST=$(echo $DB_URI | sed -n 's/.*@\([^:]*\).*/\1/p')
    if [ -n "$DB_HOST" ]; then
        for i in {1..10}; do
            if nc -z "$DB_HOST" 5432 2>/dev/null; then
                echo "Database host is reachable"
                break
            else
                echo "Waiting for database host... ($i/10)"
                sleep 2
            fi
        done
    fi
fi

# Start the langchain chatbot
echo "Starting FastAPI server on port 6500..."
python langchain_chatbot/api.py