# 🎤 Deepgram STT Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Deepgram API Key
1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up for a free account
3. Create a new project
4. Copy your API key

### 2. Add API Key to Your App
Add this line to `apps/web/.env.local`:
```bash
DEEPGRAM_API_KEY=your-deepgram-api-key-here
```

### 3. Restart Your App
```bash
# Stop the current dev server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Test It!
1. Go to `http://localhost:3000`
2. Click the microphone button
3. Deepgram is now the default STT provider
4. Start recording!

## 💰 Pricing
- **Free Tier**: 200 hours per month
- **Paid**: $0.0044 per minute after free tier
- **No credit card required** for free tier

## 🎯 Why Deepgram?
- ✅ **High accuracy** (Nova-2 model)
- ✅ **Fast processing** (< 1 second)
- ✅ **Smart formatting** (punctuation, numbers)
- ✅ **Multiple languages** supported
- ✅ **Real-time streaming** available

## 🔧 Troubleshooting

### "API key not configured" error
Make sure you added the API key to `apps/web/.env.local` and restarted the server.

### "Content-Type" error
This usually means the audio format isn't supported. Deepgram supports:
- WAV, MP3, M4A, FLAC, OGG
- WebM (from browser recording)

### Still having issues?
Run the test script:
```bash
node test-deepgram.js
```

## 🌟 Advanced Features
Once basic setup works, you can enable:
- **Speaker diarization** (who said what)
- **Language detection**
- **Custom models**
- **Real-time streaming**

Need help? Check [Deepgram Docs](https://developers.deepgram.com/) 