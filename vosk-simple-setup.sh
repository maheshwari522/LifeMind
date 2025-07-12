#!/bin/bash

echo "🚀 Setting up Simple Vosk STT Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is available"

# Stop any existing Vosk containers
echo "🛑 Stopping any existing Vosk containers..."
docker stop vosk-simple 2>/dev/null || true
docker rm vosk-simple 2>/dev/null || true

# Use a simpler Vosk server image
echo "📥 Pulling simple Vosk server image..."
docker pull alphacep/vosk-server:latest

echo "🚀 Starting simple Vosk server on port 2700..."
docker run -d \
    --name vosk-simple \
    -p 2700:2700 \
    --platform linux/amd64 \
    alphacep/vosk-server:latest

echo "⏳ Waiting for server to start..."
sleep 10

echo "🧪 Testing Vosk server..."
if curl -s http://localhost:2700/status > /dev/null; then
    echo "✅ Vosk server is running successfully!"
    echo "🌐 Server URL: http://localhost:2700"
    echo "📖 API Documentation: https://github.com/alphacep/vosk-server"
else
    echo "❌ Vosk server failed to start properly"
    echo "📋 Checking container logs..."
    docker logs vosk-simple --tail 10
fi 