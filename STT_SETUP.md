# Speech-to-Text (STT) Setup Guide

This guide will help you set up speech-to-text functionality for your AI Memory Assistant app using multiple options.

## 🎯 Available STT Options

### 1. **Vosk (Local) - Recommended for Development**
- ✅ **Free and open-source**
- ✅ **Runs locally** (no internet required)
- ✅ **No API keys needed**
- ✅ **Good accuracy**
- ❌ Requires Docker

### 2. **OpenAI Whisper API**
- ✅ **Excellent accuracy**
- ✅ **Easy to set up**
- ❌ **Paid** (after free credits)
- ❌ Requires API key

### 3. **Deepgram**
- ✅ **Good accuracy**
- ✅ **Free tier available**
- ❌ Requires API key
- ❌ Requires account setup

### 4. **Web Speech API**
- ✅ **Built into browsers**
- ✅ **No setup required**
- ❌ **Limited accuracy**
- ❌ **Browser dependent**

---

## 🚀 Quick Start (Vosk - Recommended)

### Step 1: Install Docker
If you don't have Docker installed:
- **macOS**: Download from [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: Download from [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

### Step 2: Start Vosk Server
```bash
# Make the script executable (if not already)
chmod +x vosk-server-setup.sh

# Run the setup script
./vosk-server-setup.sh
```

### Step 3: Test the Setup
1. Open your app at `http://localhost:3000`
2. Click the settings icon (⚙️) on the voice recorder
3. Select "Vosk (Local)" as the STT provider
4. Click the microphone button and speak
5. Your speech should be transcribed!

---

## ☁️ Cloud API Setup

### OpenAI Whisper API

1. **Get an API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:
   ```bash
   # Add to your .env.local file
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Use in App**:
   - Select "OpenAI Whisper" in voice recorder settings
   - Start recording!

### Deepgram API

1. **Get an API Key**:
   - Go to [Deepgram Console](https://console.deepgram.com/)
   - Sign up and create a new project
   - Copy your API key

2. **Configure Environment**:
   ```bash
   # Add to your .env.local file
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

3. **Use in App**:
   - Select "Deepgram" in voice recorder settings
   - Start recording!

---

## 🔧 Manual Vosk Setup (Alternative)

If you prefer to set up Vosk manually:

### Using Docker
```bash
# Pull the Vosk image
docker pull alphacep/kaldi-en:latest

# Run the server
docker run -d \
  --name vosk-server \
  -p 2700:2700 \
  --restart unless-stopped \
  alphacep/kaldi-en:latest
```

### Using Python (Advanced)
```bash
# Install Python dependencies
pip install vosk flask

# Download a model
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip

# Run server
python3 -m vosk.server vosk-model-small-en-us-0.15 2700
```

---

## 🧪 Testing Your Setup

### Test Vosk Server
```bash
# Check if server is running
curl http://localhost:2700/health

# Should return: {"status": "ok"}
```

### Test API Endpoints
```bash
# Test OpenAI endpoint (requires API key)
curl -X POST http://localhost:3000/api/stt/openai \
  -F "audio=@test-audio.webm"

# Test Deepgram endpoint (requires API key)
curl -X POST http://localhost:3000/api/stt/deepgram \
  -F "audio=@test-audio.webm"
```

---

## 🎤 How to Use

1. **Open the App**: Navigate to your app
2. **Access Voice Recorder**: Find the microphone button
3. **Choose Provider**: Click settings (⚙️) and select your preferred STT provider
4. **Start Recording**: Click the microphone button
5. **Speak**: Say something like "Add a reminder to buy groceries tomorrow at 3 PM"
6. **Review**: Check the transcription and AI response
7. **Approve**: Confirm if the AI understood correctly

---

## 🔍 Troubleshooting

### Vosk Issues
```bash
# Check if Docker is running
docker ps

# Check Vosk container logs
docker logs vosk-server

# Restart Vosk server
docker restart vosk-server
```

### API Issues
- **OpenAI**: Check your API key and billing status
- **Deepgram**: Verify your API key and project settings
- **Web Speech**: Ensure you're using a supported browser (Chrome, Edge, Safari)

### General Issues
- **Microphone permissions**: Allow microphone access in your browser
- **Network issues**: Check if your firewall is blocking connections
- **Port conflicts**: Ensure port 2700 is available for Vosk

---

## 📊 Performance Comparison

| Provider | Accuracy | Speed | Cost | Setup Difficulty |
|----------|----------|-------|------|------------------|
| Vosk | Good | Fast | Free | Easy |
| OpenAI | Excellent | Fast | Paid | Easy |
| Deepgram | Good | Fast | Free tier | Medium |
| Web Speech | Fair | Fast | Free | Very Easy |

---

## 🎯 Recommended Setup

**For Development**: Use Vosk (local, free, good accuracy)
**For Production**: Use OpenAI Whisper (best accuracy, reliable)
**For Budget**: Use Deepgram (free tier, good accuracy)

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your environment variables
3. Check the browser console for errors
4. Ensure all services are running properly

Happy coding! 🚀 