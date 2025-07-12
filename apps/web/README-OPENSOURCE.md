# Open Source AI Setup Guide

This app now uses open-source models for both Speech-to-Text (STT) and AI responses.

## 🎤 Speech-to-Text (Whisper)

The app uses **Whisper** from OpenAI, running locally via Transformers.js:

- **Model**: `Xenova/whisper-tiny.en` (optimized for English)
- **Features**: 
  - Runs entirely in the browser
  - No internet required after initial model download
  - High accuracy transcription
  - Supports various audio formats

### Setup
1. The model will automatically download on first use (~39MB)
2. No additional configuration needed
3. Works offline after initial download

## 🤖 AI Responses (Ollama)

The app uses **Ollama** for intelligent AI responses:

### Option 1: Local Ollama (Recommended)

1. **Install Ollama**:
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Pull a model**:
   ```bash
   # Fast model (3B parameters)
   ollama pull llama3.2:3b
   
   # Better quality (7B parameters)
   ollama pull mistral:7b
   
   # Best quality (8B parameters)
   ollama pull llama3.1:8b
   ```

3. **Start Ollama**:
   ```bash
   ollama serve
   ```

4. **Configure the app**:
   Create a `.env.local` file in the `apps/web` directory:
   ```env
   NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
   NEXT_PUBLIC_OLLAMA_MODEL=llama3.2:3b
   ```

### Option 2: Cloud-based Open Source Models

If you don't want to run Ollama locally, the app will fall back to rule-based responses.

## 🚀 Available Models

### Speech-to-Text Models
- `Xenova/whisper-tiny.en` (default) - Fast, English-only
- `Xenova/whisper-base.en` - Better accuracy, English-only
- `Xenova/whisper-small.en` - High accuracy, English-only

### AI Response Models
- `llama3.2:3b` - Fast, good for basic tasks
- `mistral:7b` - Balanced performance and quality
- `llama3.1:8b` - High quality, slower
- `codellama:7b` - Good for technical tasks

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in `apps/web/`:

```env
# Ollama Configuration
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
NEXT_PUBLIC_OLLAMA_MODEL=llama3.2:3b

# Alternative configurations:
# NEXT_PUBLIC_OLLAMA_MODEL=mistral:7b
# NEXT_PUBLIC_OLLAMA_MODEL=llama3.1:8b
```

### Model Switching
To use a different model:

1. Pull the new model: `ollama pull model-name`
2. Update `.env.local`: `NEXT_PUBLIC_OLLAMA_MODEL=model-name`
3. Restart the app

## 🎯 Features

### Voice Commands
- **"Remind me to call mom tomorrow"** - Creates a reminder
- **"Call John next week"** - Schedules a call
- **"Add priority to complete project with high priority"** - Sets a priority
- **"Urgent task to finish report"** - Creates urgent priority

### AI Capabilities
- Natural language understanding
- Intelligent response generation
- Context-aware conversations
- Task extraction and confirmation

## 🔍 Troubleshooting

### Whisper Issues
- **Model not loading**: Check internet connection for initial download
- **Poor transcription**: Try a larger model (base or small)
- **Browser compatibility**: Ensure WebAssembly is supported

### Ollama Issues
- **Connection refused**: Make sure Ollama is running (`ollama serve`)
- **Model not found**: Pull the model first (`ollama pull model-name`)
- **Slow responses**: Try a smaller model or increase system resources

### Performance Tips
- Use `whisper-tiny.en` for faster STT
- Use `llama3.2:3b` for faster AI responses
- Close other applications to free up memory
- Use SSD storage for better model loading

## 🌟 Benefits of Open Source

1. **Privacy**: All processing happens locally
2. **Cost**: No API fees or usage limits
3. **Customization**: Use any model you prefer
4. **Offline**: Works without internet connection
5. **Transparency**: Full control over the AI models

## 📊 Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| whisper-tiny.en | 39MB | Fast | Good | General use |
| whisper-base.en | 74MB | Medium | Better | Better accuracy |
| llama3.2:3b | 1.8GB | Fast | Good | Basic tasks |
| mistral:7b | 4.1GB | Medium | Better | Balanced |
| llama3.1:8b | 4.7GB | Slow | Best | High quality |

## 🔄 Updates

To update models:
```bash
# Update Ollama
ollama update

# Pull latest model versions
ollama pull llama3.2:3b
ollama pull mistral:7b
```

The app will automatically use the latest versions when available. 