# 🎤 API-Based Speech-to-Text Setup Guide

This guide shows you how to set up various Speech-to-Text APIs for your voice assistant app.

## 🚀 **Quick Start (Recommended)**

### **Option 1: Web Speech API (Free, No Setup)**
- ✅ **No API keys needed**
- ✅ **Works immediately**
- ✅ **High accuracy**
- ✅ **Real-time transcription**

**Just select "Web Speech API" in the dropdown and start recording!**

### **Option 2: OpenAI Whisper API (Recommended Paid Option)**
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Select "OpenAI Whisper" in the app

## 📋 **Available STT APIs**

### **1. Web Speech API** ⭐ **RECOMMENDED**
- **Cost**: Free
- **Setup**: None required
- **Accuracy**: High
- **Speed**: Real-time
- **Limits**: None

### **2. OpenAI Whisper API** ⭐ **BEST PAID OPTION**
- **Cost**: $0.006 per minute
- **Setup**: API key required
- **Accuracy**: Very high
- **Speed**: Fast
- **Limits**: Rate limits apply

### **3. Deepgram API**
- **Cost**: $0.0044 per minute
- **Setup**: API key required
- **Accuracy**: High
- **Speed**: Very fast
- **Limits**: Rate limits apply

### **4. AssemblyAI API**
- **Cost**: $0.00025 per second
- **Setup**: API key required
- **Accuracy**: Very high
- **Speed**: Fast
- **Features**: Speaker diarization

### **5. Vosk (Local)** ⚠️ **COMPLEX SETUP**
- **Cost**: Free
- **Setup**: Docker required
- **Accuracy**: Good
- **Speed**: Slow startup
- **Limits**: 2GB+ RAM usage

## 🔧 **Setup Instructions**

### **OpenAI Whisper API**

1. **Get API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Test**:
   - Restart your dev server
   - Select "OpenAI Whisper" in the app
   - Start recording

### **Deepgram API**

1. **Get API Key**:
   - Go to [Deepgram Console](https://console.deepgram.com/)
   - Create a new project
   - Copy the API key

2. **Configure Environment**:
   ```bash
   # Add to .env.local
   DEEPGRAM_API_KEY=your-deepgram-api-key
   ```

3. **Test**:
   - Restart your dev server
   - Select "Deepgram" in the app
   - Start recording

### **AssemblyAI API**

1. **Get API Key**:
   - Go to [AssemblyAI](https://www.assemblyai.com/)
   - Sign up for free credits
   - Copy the API key

2. **Configure Environment**:
   ```bash
   # Add to .env.local
   ASSEMBLYAI_API_KEY=your-assemblyai-api-key
   ```

3. **Test**:
   - Restart your dev server
   - Select "AssemblyAI" in the app
   - Start recording

## 💰 **Cost Comparison**

| Provider | Cost per Minute | Free Tier | Best For |
|----------|----------------|-----------|----------|
| Web Speech API | Free | Unlimited | Personal use |
| OpenAI Whisper | $0.006 | $5/month | High accuracy |
| Deepgram | $0.0044 | 200 hours | Fast processing |
| AssemblyAI | $0.015 | 3 hours | Speaker diarization |

## 🎯 **Recommendations**

### **For Personal Use**:
- **Web Speech API** - Free, works great

### **For Production Apps**:
- **OpenAI Whisper** - Best balance of cost/accuracy
- **Deepgram** - Fastest processing

### **For Advanced Features**:
- **AssemblyAI** - Speaker diarization, sentiment analysis

## 🚨 **Troubleshooting**

### **API Key Issues**:
```bash
# Check if environment variables are loaded
echo $OPENAI_API_KEY
```

### **CORS Issues**:
- All APIs are called from your Next.js backend
- No CORS issues should occur

### **Rate Limits**:
- Web Speech API: No limits
- OpenAI: 3 requests per minute (free tier)
- Deepgram: 1000 requests per hour (free tier)

## 🔄 **Switching Between APIs**

1. **Open the app** at `http://localhost:3000`
2. **Click the settings icon** (⚙️) next to the microphone
3. **Select your preferred API** from the dropdown
4. **Start recording** - the app will use your selected API

## 📱 **Mobile Support**

- **Web Speech API**: Works on mobile browsers
- **All API options**: Work on mobile through your web app
- **Native app**: Uses the same APIs through your backend

## 🎉 **You're Ready!**

Your voice assistant now supports multiple STT APIs. Start with **Web Speech API** for immediate use, then add paid APIs for better accuracy and features. 