import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/common/button";
import VoiceRecorder from "./VoiceRecorder";
import { aiService, type AIResponse } from "@/lib/ai-service";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: (reminder: { text: string; date: string; time: string; recurring: string }) => void;
  onAddPriority: (priority: { text: string; priority: string }) => void;
}

interface ConversationContext {
  awaitingApproval?: boolean;
  pendingAction?: {
    type: string;
    data: any;
    missingFields?: string[];
  };
  conversationHistory?: string[];
}

const Chatbot = ({ isOpen, onClose, onAddReminder, onAddPriority }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant powered by open-source models. I can help you add reminders, set priorities, and manage your tasks. Just speak naturally and I'll understand what you need!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    data: any;
    missingFields?: string[];
  } | null>(null);
  const [backendAwaitingApproval, setBackendAwaitingApproval] = useState(false);
  const [backendAIResponse, setBackendAIResponse] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAwaitingVoiceApproval, setIsAwaitingVoiceApproval] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update voice approval state based on backend state
  useEffect(() => {
    setIsAwaitingVoiceApproval(backendAwaitingApproval);
  }, [backendAwaitingApproval]);

  const addMessage = (text: string, sender: "user" | "bot") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Enhanced AI response handler with context awareness
  const handleAIResponse = async (
    aiResponse: string,
    transcription: string,
    aiMeta?: { 
      awaitingApproval?: boolean; 
      actionType?: string; 
      actionData?: any;
      missingFields?: string[];
    }
  ): Promise<void> => {
    addMessage(transcription, "user");
    addMessage(aiResponse, "bot");
    
    setBackendAIResponse(aiResponse);
    setBackendAwaitingApproval(!!(aiMeta && aiMeta.awaitingApproval));
    setIsAwaitingVoiceApproval(!!(aiMeta && aiMeta.awaitingApproval));
    
    // Update conversation context
    const newContext: ConversationContext = {
      awaitingApproval: aiMeta?.awaitingApproval || false,
      pendingAction: aiMeta?.actionType && aiMeta?.actionData ? {
        type: aiMeta.actionType,
        data: aiMeta.actionData,
        missingFields: aiMeta.missingFields
      } : undefined,
      conversationHistory: [
        ...(conversationContext.conversationHistory || []),
        `User: ${transcription}`,
        `Assistant: ${aiResponse}`
      ].slice(-10) // Keep last 10 exchanges
    };
    
    setConversationContext(newContext);
    
    if (aiMeta && aiMeta.awaitingApproval && aiMeta.actionType && aiMeta.actionData) {
      setPendingAction({ 
        type: aiMeta.actionType, 
        data: aiMeta.actionData,
        missingFields: aiMeta.missingFields
      });
    } else {
      setPendingAction(null);
    }
  };

  // Handle approval request from VoiceRecorder
  const handleApprovalRequest = async (aiResponse: string, transcription: string) => {
    // This will be handled by handleAIResponse above
  };

  // Enhanced follow-up input handler
  const handleFollowUpInput = async (transcription: string) => {
    if (!pendingAction) return;

    addMessage(transcription, "user");
    setIsProcessing(true);

    try {
      // Send the follow-up input to the AI with current context
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

      if (response.ok) {
        const data = await response.json();
        await handleAIResponse(data.response, transcription, {
          awaitingApproval: data.awaitingApproval,
          actionType: data.actionType,
          actionData: data.actionData,
          missingFields: data.missingFields
        });
      } else {
        addMessage("I'm having trouble processing that. Please try again.", "bot");
      }
    } catch (error) {
      console.error("Error processing follow-up input:", error);
      addMessage("I'm having trouble understanding. Please try again.", "bot");
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced confirmation handler
  const confirmAction = () => {
    if (!pendingAction) return;
    
    try {
      if (pendingAction.type === "reminder" || pendingAction.type === "meeting") {
        const reminderData = {
          text: pendingAction.data.text,
          date: pendingAction.data.date || "today",
          time: pendingAction.data.time || "09:00",
          recurring: "none"
        };
        onAddReminder(reminderData);
        addMessage(`✅ ${pendingAction.type.charAt(0).toUpperCase() + pendingAction.type.slice(1)} added successfully!`, "bot");
      } else if (pendingAction.type === "priority") {
        const priorityData = {
          text: pendingAction.data.text,
          priority: pendingAction.data.priority || "medium"
        };
        onAddPriority(priorityData);
        addMessage("✅ Priority added successfully!", "bot");
      } else if (pendingAction.type === "task") {
        // Add your task handler here if needed
        addMessage("✅ Task added successfully!", "bot");
      } else if (pendingAction.type === "meeting") {
        // Add your meeting handler here if needed
        addMessage("✅ Meeting added successfully!", "bot");
      } else {
        addMessage("✅ Action confirmed!", "bot");
      }
      
      // Reset state
      setPendingAction(null);
      setBackendAwaitingApproval(false);
      setIsAwaitingVoiceApproval(false);
      setConversationContext({
        awaitingApproval: false,
        conversationHistory: conversationContext.conversationHistory
      });
      
    } catch (error) {
      console.error("Error confirming action:", error);
      addMessage("❌ Sorry, there was an error. Please try again.", "bot");
    }
  };

  const cancelAction = () => {
    addMessage("❌ Action cancelled.", "bot");
    setPendingAction(null);
    setBackendAwaitingApproval(false);
    setIsAwaitingVoiceApproval(false);
    setConversationContext({
      awaitingApproval: false,
      conversationHistory: conversationContext.conversationHistory
    });
  };

  // Enhanced voice approval handler with natural language understanding
  const handleVoiceApproval = (transcription: string) => {
    const lower = transcription.trim().toLowerCase();
    
    if (!isAwaitingVoiceApproval) return false;
    
    // Check for affirmative responses
    const affirmativeResponses = [
      'yes', 'yeah', 'yup', 'yep', 'sure', 'okay', 'ok', 'please do', 'go ahead', 
      'add it', 'set it', 'create it', 'do it', 'absolutely', 'definitely', 
      'that\'s right', 'correct', 'right', 'true', 'indeed', 'certainly'
    ];
    
    // Check for negative responses
    const negativeResponses = [
      'no', 'nope', 'nah', 'not', 'don\'t', 'do not', 'cancel', 'stop', 
      'never mind', 'forget it', 'ignore', 'skip', 'pass'
    ];
    
    if (affirmativeResponses.some(response => lower.includes(response) || lower === response)) {
      confirmAction();
      return true;
    }
    
    if (negativeResponses.some(response => lower.includes(response) || lower === response)) {
      cancelAction();
      return true;
    }
    
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Recorder */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-center mb-4">
            <VoiceRecorder
              onAIResponse={(aiResponse: string, transcription: string, aiMeta?: { awaitingApproval?: boolean; actionType?: string; actionData?: any; missingFields?: string[] }) => { 
                handleAIResponse(aiResponse, transcription, aiMeta); 
              }}
              onApprovalRequest={handleApprovalRequest}
              onTranscription={(transcription) => {
                if (isAwaitingVoiceApproval && handleVoiceApproval(transcription)) {
                  // Handled by voice approval
                  return;
                }
                if (backendAwaitingApproval && pendingAction) {
                  // If waiting for follow-up info, process as follow-up
                  handleFollowUpInput(transcription);
                }
              }}
              onRecordingStopped={() => {}}
              size="lg"
              conversationContext={conversationContext}
            />
          </div>

          {/* Confirmation Buttons */}
          {backendAwaitingApproval && (
            <>
              <div className="flex justify-center space-x-4">
                <Button onClick={confirmAction} className="bg-green-500 hover:bg-green-600 text-white">
                  ✅ Yes, add it
                </Button>
                <Button onClick={cancelAction} className="bg-red-500 hover:bg-red-600 text-white">
                  ❌ No, cancel
                </Button>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                You can also say "yes" or "no" instead of clicking.
              </div>
            </>
          )}

          {/* Status */}
          {isProcessing && (
            <div className="text-center text-sm text-gray-600 mt-2">
              🔄 Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 