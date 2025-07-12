import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const processVoiceRecording = mutation({
  args: {
    audioUrl: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement actual speech-to-text and AI processing
    // For now, we'll simulate the process
    
    // 1. Convert audio to text (would use OpenAI Whisper or similar)
    const mockTranscription = "Remind me to call mom tomorrow at 3 PM";
    
    // 2. Use AI to extract reminder information
    const reminderInfo = await extractReminderInfo(mockTranscription);
    
    // 3. Save the voice recording record
    const recordingId = await ctx.db.insert("voiceRecordings", {
      userId: args.userId,
      audioUrl: args.audioUrl,
      transcription: mockTranscription,
      processed: true,
      reminderText: reminderInfo.text,
      createdAt: Date.now(),
    });
    
    // 4. If reminder info was extracted, create a reminder
    if (reminderInfo.text && reminderInfo.date) {
      await ctx.db.insert("reminders", {
        userId: args.userId,
        text: reminderInfo.text,
        date: reminderInfo.date,
        time: reminderInfo.time || "09:00",
        recurring: reminderInfo.recurring || "none",
        completed: false,
        createdAt: Date.now(),
      });
    }
    
    return { recordingId, transcription: mockTranscription, reminderInfo };
  },
});

async function extractReminderInfo(text: string) {
  // TODO: Use OpenAI GPT to extract structured reminder information
  // This is a mock implementation
  
  const lowerText = text.toLowerCase();
  
  // Simple pattern matching for demo purposes
  const patterns = [
    {
      regex: /remind me to (.+?) (tomorrow|today|next week|next month)/i,
      extract: (matches: RegExpMatchArray) => ({
        text: matches[1],
        date: getDateFromText(matches[2]),
        time: "09:00",
        recurring: "none"
      })
    },
    {
      regex: /call (.+?) (tomorrow|today|next week)/i,
      extract: (matches: RegExpMatchArray) => ({
        text: `Call ${matches[1]}`,
        date: getDateFromText(matches[2]),
        time: "15:00",
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
  
  // Default fallback
  return {
    text: text,
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    recurring: "none"
  };
}

function getDateFromText(dateText: string): string {
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
      return today.toISOString().split('T')[0];
  }
} 