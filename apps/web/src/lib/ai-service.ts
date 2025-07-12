// AI Service using open-source models
export interface AIResponse {
  text: string;
  confidence?: number;
  intent?: string;
}

export interface ReminderInfo {
  text: string;
  date: string;
  time: string;
  recurring: string;
}

export interface PriorityInfo {
  text: string;
  priority: string;
}

class AIService {
  private baseUrl: string;
  private model: string;

  constructor() {
    // Use Ollama local server if available, otherwise fallback to cloud
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3.2:3b';
  }

  async generateResponse(userInput: string): Promise<AIResponse> {
    try {
      // Try Ollama first (local)
      if (await this.isOllamaAvailable()) {
        return await this.generateWithOllama(userInput);
      }
      
      // Fallback to cloud-based open-source model
      return await this.generateWithCloudModel(userInput);
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        text: "I'm having trouble processing your request right now. Please try again.",
        confidence: 0.5
      };
    }
  }

  private async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async generateWithOllama(userInput: string): Promise<AIResponse> {
    const prompt = this.buildPrompt(userInput);
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.response.trim(),
      confidence: 0.8
    };
  }

  private async generateWithCloudModel(userInput: string): Promise<AIResponse> {
    // Fallback to a cloud-based open-source model
    // You can use Hugging Face Inference API or other services
    const prompt = this.buildPrompt(userInput);
    
    // For now, we'll use a simple rule-based approach as fallback
    return this.generateRuleBasedResponse(userInput);
  }

  private buildPrompt(userInput: string): string {
    return `You are an AI assistant for a productivity app called LifeMind. Your job is to help users manage reminders, priorities, and tasks.

User input: "${userInput}"

Please respond naturally and helpfully. If the user is asking to add a reminder or priority, extract the relevant information and provide a helpful response.

Guidelines:
- Be conversational and friendly
- If they want to add a reminder, help them understand what you heard
- If they want to add a priority, confirm the task and priority level
- If they're just chatting, be helpful and engaging
- Keep responses concise but informative

Response:`;
  }

  private generateRuleBasedResponse(userInput: string): AIResponse {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return {
        text: "Hello! I'm your AI assistant. I can help you add reminders, set priorities, and manage your tasks. Just speak naturally and I'll understand what you need!",
        confidence: 0.9
      };
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return {
        text: "I can help you with:\n• Adding reminders (e.g., 'remind me to call mom tomorrow')\n• Setting priorities (e.g., 'add priority to complete project with high priority')\n• Managing your tasks and schedule\n\nJust speak naturally and I'll understand!",
        confidence: 0.9
      };
    }
    
    if (lowerInput.includes('remind') || lowerInput.includes('reminder') || lowerInput.includes('call') || lowerInput.includes('meeting')) {
      return {
        text: "I heard you want to set a reminder. Let me help you with that!",
        confidence: 0.8
      };
    }
    
    if (lowerInput.includes('priority') || lowerInput.includes('task') || lowerInput.includes('urgent')) {
      return {
        text: "I understand you want to set a priority. Let me help you with that!",
        confidence: 0.8
      };
    }
    
    return {
      text: "I heard: \"" + userInput + "\". I can help you add reminders, set priorities, or manage your tasks. Try saying something like 'remind me to call mom tomorrow' or 'add priority to complete project'.",
      confidence: 0.6
    };
  }

  async extractReminderInfo(text: string): Promise<ReminderInfo | null> {
    try {
      const prompt = `Extract reminder information from this text: "${text}"

Please return a JSON object with the following structure:
{
  "text": "the reminder text",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format",
  "recurring": "none|daily|weekly|monthly"
}

If you can't extract the information, return null.`;

      const response = await this.generateResponse(prompt);
      
      // Try to parse JSON from response
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.text && parsed.date) {
            return parsed;
          }
        }
      } catch {
        // Fallback to rule-based extraction
        return this.extractReminderRuleBased(text);
      }
    } catch (error) {
      console.error('Error extracting reminder info:', error);
    }
    
    return this.extractReminderRuleBased(text);
  }

  async extractPriorityInfo(text: string): Promise<PriorityInfo | null> {
    try {
      const prompt = `Extract priority information from this text: "${text}"

Please return a JSON object with the following structure:
{
  "text": "the task text",
  "priority": "high|medium|low"
}

If you can't extract the information, return null.`;

      const response = await this.generateResponse(prompt);
      
      // Try to parse JSON from response
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.text && parsed.priority) {
            return parsed;
          }
        }
      } catch {
        // Fallback to rule-based extraction
        return this.extractPriorityRuleBased(text);
      }
    } catch (error) {
      console.error('Error extracting priority info:', error);
    }
    
    return this.extractPriorityRuleBased(text);
  }

  private extractReminderRuleBased(text: string): ReminderInfo | null {
    const patterns = [
      {
        regex: /remind me to (.+?) (tomorrow|today|next week|next month|\d+ days? from now)/i,
        extract: (matches: RegExpMatchArray) => ({
          text: matches[1].trim(),
          date: this.getDateFromText(matches[2]),
          time: this.extractTimeFromText(text) || "09:00",
          recurring: "none"
        })
      },
      {
        regex: /call (.+?) (tomorrow|today|next week|next month)/i,
        extract: (matches: RegExpMatchArray) => ({
          text: `Call ${matches[1].trim()}`,
          date: this.getDateFromText(matches[2]),
          time: this.extractTimeFromText(text) || "15:00",
          recurring: "none"
        })
      }
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern.regex);
      if (matches) {
        return pattern.extract(matches);
      }
    }

    return null;
  }

  private extractPriorityRuleBased(text: string): PriorityInfo | null {
    let priority = "medium";
    if (text.includes("high priority") || text.includes("urgent") || text.includes("critical")) {
      priority = "high";
    } else if (text.includes("low priority")) {
      priority = "low";
    }

    const taskMatch = text.match(/(?:add priority|set priority|priority|urgent task)\s+(?:to\s+)?(.+?)(?:\s+with\s+\w+\s+priority|\s+urgent|\s+critical|$)/i);
    if (taskMatch) {
      return {
        text: taskMatch[1].trim(),
        priority
      };
    }

    return null;
  }

  private extractTimeFromText(text: string): string | null {
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /at\s+(\d{1,2}):(\d{2})/i,
      /at\s+(\d{1,2})\s*(am|pm)/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase();

        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return null;
  }

  private getDateFromText(dateText: string): string {
    const today = new Date();
    
    switch (dateText.toLowerCase()) {
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case "today":
        return today.toISOString().split('T')[0];
      case "next week":
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      case "next month":
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0];
      default:
        const daysMatch = dateText.match(/(\d+)\s*days?\s*from\s*now/i);
        if (daysMatch) {
          const days = parseInt(daysMatch[1]);
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + days);
          return futureDate.toISOString().split('T')[0];
        }
        return today.toISOString().split('T')[0];
    }
  }
}

export const aiService = new AIService(); 