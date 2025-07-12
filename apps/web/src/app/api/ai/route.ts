import { NextRequest, NextResponse } from 'next/server';

// Common affirmative responses
const AFFIRMATIVE_RESPONSES = [
  'yes', 'yeah', 'yup', 'yep', 'sure', 'okay', 'ok', 'please do', 'go ahead', 
  'add it', 'set it', 'create it', 'do it', 'absolutely', 'definitely', 
  'that\'s right', 'correct', 'right', 'true', 'indeed', 'certainly'
];

// Common negative responses
const NEGATIVE_RESPONSES = [
  'no', 'nope', 'nah', 'not', 'don\'t', 'do not', 'cancel', 'stop', 
  'never mind', 'forget it', 'ignore', 'skip', 'pass'
];

interface ConversationContext {
  awaitingApproval?: boolean;
  pendingAction?: {
    type: string;
    data: any;
    missingFields?: string[];
  };
  conversationHistory?: string[];
}

function isAffirmativeResponse(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  return AFFIRMATIVE_RESPONSES.some(affirmative => 
    lowerMessage.includes(affirmative) || lowerMessage === affirmative
  );
}

function isNegativeResponse(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  return NEGATIVE_RESPONSES.some(negative => 
    lowerMessage.includes(negative) || lowerMessage === negative
  );
}

function extractTimeFromText(text: string): string | null {
  // Match various time formats
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
    /(\d{1,2})\s*(am|pm)/i,
    /(\d{1,2})\s*(\d{2})\s*(am|pm)?/i,
    /(\d{1,2})\.(\d{2})\s*(am|pm)?/i
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      let minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3]?.toLowerCase();

      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  return null;
}

function extractDateFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Common date patterns
  if (lowerText.includes('tomorrow')) return 'tomorrow';
  if (lowerText.includes('next week')) return 'next week';
  if (lowerText.includes('next month')) return 'next month';
  if (lowerText.includes('today')) return 'today';
  if (lowerText.includes('tonight')) return 'tonight';
  
  // Month patterns
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'];
  
  for (const month of months) {
    if (lowerText.includes(month)) {
      const monthMatch = text.match(new RegExp(`${month}\\s*(\\d{1,2})?`, 'i'));
      if (monthMatch) {
        return monthMatch[0];
      }
    }
  }
  
  return null;
}

function extractPriorityFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('high') || lowerText.includes('urgent') || lowerText.includes('critical')) {
    return 'high';
  }
  if (lowerText.includes('low') || lowerText.includes('not urgent')) {
    return 'low';
  }
  if (lowerText.includes('medium') || lowerText.includes('normal')) {
    return 'medium';
  }
  return null;
}

function parseUserIntent(message: string): {
  intent: string;
  data: any;
  missingFields: string[];
} {
  const lowerMessage = message.toLowerCase();
  let intent = 'general';
  // Always extract concise text
  let text = extractConciseReminder(message);
  // Always extract date and time
  let { date, time } = parseDateTime(message);
  // Fallbacks if parsing fails
  if (!date) {
    const today = new Date();
    date = today.toISOString().split('T')[0];
  }
  if (!time) {
    time = '09:00';
  }
  let data: any = { text, date, time };
  let missingFields: string[] = [];

  // Check for reminder intent
  if (lowerMessage.includes('remind') || lowerMessage.includes('reminder') || 
      lowerMessage.includes('schedule') || lowerMessage.includes('set')) {
    intent = 'reminder';
    
    // Extract time
    const time = extractTimeFromText(message);
    if (time) {
      data.time = time;
    } else {
      missingFields.push('time');
    }
    
    // Extract date
    const date = extractDateFromText(message);
    if (date) {
      data.date = date;
    } else {
      missingFields.push('date');
    }
  }
  
  // Check for priority intent
  if (lowerMessage.includes('priority') || lowerMessage.includes('important') || 
      lowerMessage.includes('urgent') || lowerMessage.includes('critical')) {
    intent = 'priority';
    
    // Extract priority level
    const priority = extractPriorityFromText(message);
    if (priority) {
      data.priority = priority;
    } else {
      missingFields.push('priority');
    }
  }
  
  // Check for task intent
  if (lowerMessage.includes('task') || lowerMessage.includes('todo') || 
      lowerMessage.includes('do') || lowerMessage.includes('complete')) {
    intent = 'task';
  }
  
  // Check for meeting intent
  if (lowerMessage.includes('meeting') || lowerMessage.includes('appointment') || 
      lowerMessage.includes('call') || lowerMessage.includes('conference')) {
    intent = 'meeting';
    
    // Extract time and date for meetings
    const time = extractTimeFromText(message);
    if (time) {
      data.time = time;
    } else {
      missingFields.push('time');
    }
    
    const date = extractDateFromText(message);
    if (date) {
      data.date = date;
    } else {
      missingFields.push('date');
    }
  }

  return { intent, data, missingFields };
}

function generateConversationalResponse(
  intent: string, 
  data: any, 
  missingFields: string[], 
  context?: ConversationContext
): { response: string; awaitingApproval: boolean; actionType?: string; actionData?: any } {
  
  // If we're awaiting approval and user gives affirmative response
  if (context?.awaitingApproval && isAffirmativeResponse(data.text)) {
    return {
      response: "Great! I'll add that for you right away. Is there anything else you need help with?",
      awaitingApproval: false,
      actionType: context.pendingAction?.type,
      actionData: context.pendingAction?.data
    };
  }
  
  // If we're awaiting approval and user gives negative response
  if (context?.awaitingApproval && isNegativeResponse(data.text)) {
    return {
      response: "No problem! I've cancelled that. What else can I help you with?",
      awaitingApproval: false
    };
  }
  
  // If we're awaiting more details and user provides them
  if (context?.pendingAction?.missingFields && missingFields.length === 0) {
    const action = context.pendingAction;
    let response = `Perfect! I have: "${action.data.text}"`;
    
    if (action.data.date) {
      response += ` on ${action.data.date}`;
    }
    if (action.data.time) {
      response += ` at ${action.data.time}`;
    }
    if (action.data.priority) {
      response += ` with ${action.data.priority} priority`;
    }
    
    response += `\n\nShould I add this ${action.type}?`;
    
    return {
      response,
      awaitingApproval: true,
      actionType: action.type,
      actionData: action.data
    };
  }
  
  // Handle new intent
  switch (intent) {
    case 'reminder':
      if (missingFields.length > 0) {
        let response = `I understand you want to set a reminder: "${data.text}"`;
        response += `\n\nI need a few more details:`;
        if (missingFields.includes('time')) {
          response += `\n• What time? (e.g., "3 PM", "15:00")`;
        }
        if (missingFields.includes('date')) {
          response += `\n• When? (e.g., "tomorrow", "next week", "January 15th")`;
        }
        return {
          response,
          awaitingApproval: false,
          actionType: 'reminder',
          actionData: data
        };
      } else {
        let response = `I'll set a reminder: "${data.text}"`;
        if (data.date) response += ` on ${data.date}`;
        if (data.time) response += ` at ${data.time}`;
        response += `\n\nShould I add this reminder?`;
        return {
          response,
          awaitingApproval: true,
          actionType: 'reminder',
          actionData: data
        };
      }
      
    case 'priority':
      if (missingFields.includes('priority')) {
        return {
          response: `I understand you want to add a priority: "${data.text}"\n\nWhat priority level? (high, medium, or low)`,
          awaitingApproval: false,
          actionType: 'priority',
          actionData: data
        };
      } else {
        return {
          response: `I'll add a priority: "${data.text}" with ${data.priority} priority\n\nShould I add this priority?`,
          awaitingApproval: true,
          actionType: 'priority',
          actionData: data
        };
      }
      
    case 'task':
      return {
        response: `I understand you want to add a task: "${data.text}"\n\nShould I add this task?`,
        awaitingApproval: true,
        actionType: 'task',
        actionData: data
      };
      
    case 'meeting':
      if (missingFields.length > 0) {
        let response = `I understand you want to schedule: "${data.text}"`;
        response += `\n\nI need a few more details:`;
        if (missingFields.includes('time')) {
          response += `\n• What time?`;
        }
        if (missingFields.includes('date')) {
          response += `\n• When?`;
        }
        return {
          response,
          awaitingApproval: false,
          actionType: 'meeting',
          actionData: data
        };
      } else {
        let response = `I'll schedule: "${data.text}"`;
        if (data.date) response += ` on ${data.date}`;
        if (data.time) response += ` at ${data.time}`;
        response += `\n\nShould I add this meeting?`;
        return {
          response,
          awaitingApproval: true,
          actionType: 'meeting',
          actionData: data
        };
      }
      
    default:
      return {
        response: `I heard you say: "${data.text}". I can help you set reminders, add priorities, create tasks, or schedule meetings. What would you like me to do?`,
        awaitingApproval: false
      };
  }
}

// Helper: Extract concise action/intent from a sentence
function extractConciseReminder(text: string): string {
  // Remove leading phrases for reminders/alarms
  let cleaned = text.replace(
    /^(set (the )?(a )?(reminder|alarm)( to| for)?|set (the )?(a )?reminder( to)?|set (the )?(a )?alarm( for)?|remind(er)?( me)?( to)?|send (a )?reminder( to)?|schedule (a )?reminder( to)?|create (a )?reminder( to)?|add (a )?reminder( to)?|please |remind me to |remind to )/i,
    ""
  );
  // Remove trailing time/repeat phrases
  cleaned = cleaned.replace(
    /( in the morning| in the evening| in the afternoon| every day| daily| weekly| monthly| tomorrow| today| next week| this week| tonight|\s*\d{1,2}(:\d{2})?(am|pm)?| on [^.,]+| at [^.,]+)/gi,
    ""
  );
  // Remove extra punctuation and whitespace
  cleaned = cleaned.replace(/[.,!?]+$/, "").trim();
  return cleaned;
}

// Helper: Extract concise action/intent for priorities
function extractConcisePriority(text: string): string {
  // Remove leading phrases for priorities
  let cleaned = text.replace(/^(set (a )?priority( to)?|add (a )?priority( to)?|create (a )?priority( to)?|please |set priority to |add priority to )/i, "");
  // Remove extra punctuation and whitespace
  cleaned = cleaned.replace(/[.,!?]+$/, "").trim();
  return cleaned.length > 0 ? cleaned : text;
}

// Helper: Parse date and time from a sentence (very basic)
function parseDateTime(text: string): { date: string, time: string } {
  // Use regex to find 'tomorrow', 'today', or explicit date/time
  let date = "";
  let time = "";
  const lower = text.toLowerCase();
  const now = new Date();
  if (lower.includes("tomorrow")) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    date = tomorrow.toISOString().split('T')[0];
  } else if (lower.includes("today")) {
    date = now.toISOString().split('T')[0];
  }
  // Time: look for e.g. 'at 10am', 'at 3:30pm', '10am', '3:30pm'
  const timeMatch = text.match(/(at )?(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[2], 10);
    let minute = timeMatch[4] ? parseInt(timeMatch[4], 10) : 0;
    let ampm = timeMatch[5] ? timeMatch[5].toLowerCase() : "";
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else {
    time = "09:00"; // default
  }
  if (!date) date = now.toISOString().split('T')[0];
  return { date, time };
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        response: "I couldn't hear what you said. Could you please try again?",
        source: 'fallback',
        awaitingApproval: false
      }, { status: 200 });
    }

    // Try to use Ollama first for more intelligent responses
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `You are a helpful AI assistant that helps users manage reminders, priorities, tasks, and meetings. 
          
Current conversation context: ${JSON.stringify(context || {})}

User message: ${message}

Respond in a natural, conversational way. If the user wants to set a reminder, add a priority, create a task, or schedule a meeting, ask for any missing details and then ask for confirmation. If they're confirming or providing more details, respond appropriately.

Assistant:`,
          stream: false,
        }),
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        // For now, we'll use our rule-based system for structured responses
        // but Ollama can be used for more natural conversation
        console.log('Ollama response:', data.response);
      }
    } catch (error) {
      console.log('Ollama not available, using rule-based system');
    }

    // Parse user intent and extract information
    const { intent, data, missingFields } = parseUserIntent(message);
    
    // Generate conversational response
    const response = generateConversationalResponse(intent, data, missingFields, context);
    
    return NextResponse.json({
      response: response.response,
      source: 'rule-based',
      awaitingApproval: response.awaitingApproval,
      actionType: response.actionType,
      actionData: response.actionData,
      missingFields: missingFields.length > 0 ? missingFields : undefined
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 