#!/bin/bash

# Vosk Server Setup Script
# This script sets up a local Vosk STT server using Docker

echo "🚀 Setting up Vosk STT Server..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is available"

# Stop any existing Vosk container
echo "🛑 Stopping any existing Vosk containers..."
docker stop vosk-server 2>/dev/null || true
docker rm vosk-server 2>/dev/null || true

# Pull and run Vosk server
echo "📥 Pulling Vosk server image..."
docker pull alphacep/kaldi-en:latest

echo "🚀 Starting Vosk server on port 2700..."
docker run -d \
  --name vosk-server \
  -p 2700:2700 \
  --restart unless-stopped \
  alphacep/kaldi-en:latest

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test the server
echo "🧪 Testing Vosk server..."
if curl -s http://localhost:2700/health > /dev/null; then
    echo "✅ Vosk server is running successfully!"
    echo "🌐 Server URL: http://localhost:2700"
    echo "📝 API endpoint: http://localhost:2700/asr"
    echo ""
    echo "💡 To use Vosk in your app:"
    echo "   1. Set STT provider to 'Vosk (Local)' in the voice recorder settings"
    echo "   2. The server will automatically transcribe your audio"
    echo ""
    echo "🛑 To stop the server: docker stop vosk-server"
    echo "🔄 To restart the server: docker start vosk-server"
else
    echo "❌ Vosk server failed to start properly"
    echo "📋 Checking container logs..."
    docker logs vosk-server
    exit 1
fi 