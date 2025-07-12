import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Settings } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (transcription: string) => void;
  onRecordingStopped: () => void;
  onAIResponse: (aiResponse: string, transcription: string, aiMeta?: { awaitingApproval?: boolean; actionType?: string; actionData?: any; missingFields?: string[] }) => void;
  onApprovalRequest: (aiResponse: string, transcription: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  conversationContext?: {
    awaitingApproval?: boolean;
    pendingAction?: {
      type: string;
      data: any;
      missingFields?: string[];
    };
    conversationHistory?: string[];
  };
}

type STTProvider = 'web-speech' | 'openai' | 'deepgram' | 'assemblyai' | 'vosk';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  onRecordingStopped,
  onAIResponse,
  onApprovalRequest,
  size = 'md',
  className = '',
  conversationContext = {}
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [sttProvider, setSttProvider] = useState<STTProvider>('deepgram');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // STT Configuration
  const sttConfig = {
    'web-speech': {
      url: null,
      name: 'Web Speech API'
    },
    openai: {
      url: '/api/stt/openai',
      name: 'OpenAI Whisper'
    },
    deepgram: {
      url: '/api/stt/deepgram',
      name: 'Deepgram'
    },
    assemblyai: {
      url: '/api/stt/assemblyai',
      name: 'AssemblyAI'
    },
    vosk: {
      url: 'http://localhost:2700/asr',
      name: 'Vosk (Local)'
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  // Initialize Web Speech API as fallback
  useEffect(() => {
    if (sttProvider === 'web-speech' && typeof window !== 'undefined') {
      // Web Speech API is available in most modern browsers
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Web Speech API not supported in this browser');
      }
    }
  }, [sttProvider]);

  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        await processAudio();
        setIsProcessing(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      let transcription = '';

      switch (sttProvider) {
        case 'vosk':
          transcription = await transcribeWithVosk(audioBlob);
          break;
        case 'openai':
          transcription = await transcribeWithOpenAI(audioBlob);
          break;
        case 'deepgram':
          transcription = await transcribeWithDeepgram(audioBlob);
          break;
        case 'assemblyai':
          transcription = await transcribeWithAssemblyAI(audioBlob);
          break;
        case 'web-speech':
          transcription = await transcribeWithWebSpeech();
          break;
        default:
          throw new Error('Unknown STT provider');
      }

      if (transcription) {
        setTranscription(transcription);
        onTranscription(transcription);
        
        // Get AI response with conversation context
        const aiResult = await getAIResponse(transcription);
        setAiResponse(aiResult.response);
        onAIResponse(aiResult.response, transcription, {
          awaitingApproval: aiResult.awaitingApproval,
          actionType: aiResult.actionType,
          actionData: aiResult.actionData,
          missingFields: aiResult.missingFields
        });
        
        // Request approval
        onApprovalRequest(aiResult.response, transcription);
      }
    } catch (err) {
      setError(`Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const transcribeWithVosk = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch(sttConfig.vosk.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Vosk server error: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  };

  const transcribeWithOpenAI = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(sttConfig.openai.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  };

  const transcribeWithDeepgram = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(sttConfig.deepgram.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.includes('API key not configured')) {
        throw new Error('Deepgram API key not configured. Please add DEEPGRAM_API_KEY to your .env.local file');
      }
      throw new Error(`Deepgram API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.text || '';
  };

  const transcribeWithAssemblyAI = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(sttConfig.assemblyai.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AssemblyAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  };

  const transcribeWithWebSpeech = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      recognition.start();
    });
  };

  const getAIResponse = async (transcription: string): Promise<{
    response: string;
    awaitingApproval?: boolean;
    actionType?: string;
    actionData?: any;
    missingFields?: string[];
  }> => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcription,
          context: conversationContext
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = await response.json();
      return {
        response: result.response || 'I understand your request. Would you like me to add this to your reminders?',
        awaitingApproval: result.awaitingApproval,
        actionType: result.actionType,
        actionData: result.actionData,
        missingFields: result.missingFields
      };
    } catch (err) {
      return {
        response: 'I understand your request. Would you like me to add this to your reminders?',
        awaitingApproval: false
      };
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Settings size={16} />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <h3 className="text-sm font-medium mb-2">Speech-to-Text Provider</h3>
          <div className="space-y-2">
            {Object.entries(sttConfig).map(([key, config]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sttProvider"
                  value={key}
                  checked={sttProvider === key}
                  onChange={(e) => setSttProvider(e.target.value as STTProvider)}
                  className="text-blue-600"
                />
                <span className="text-sm">{config.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Record Button */}
      <button
        onClick={handleRecordClick}
        disabled={isProcessing}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isRecording
            ? 'bg-red-500 animate-pulse hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isProcessing ? (
          <Loader2 className="text-white animate-spin" size={24} />
        ) : isRecording ? (
          <Square className="text-white" size={24} />
        ) : (
          <Mic className="text-white" size={24} />
        )}
      </button>

      {/* Status Text */}
      <div className="text-center">
        {isRecording && <p className="text-sm text-red-600">Recording...</p>}
        {isProcessing && <p className="text-sm text-blue-600">Processing...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {transcription && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Transcription: {transcription}</p>
            {aiResponse && (
              <p className="text-sm text-gray-800 mt-1">AI: {aiResponse}</p>
            )}
          </div>
        )}
      </div>

      {/* Provider Info */}
      <p className="text-xs text-gray-500">
        Using: {sttConfig[sttProvider].name}
      </p>
    </div>
  );
};

export default VoiceRecorder; 