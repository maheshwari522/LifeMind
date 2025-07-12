import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }),
  
  priorities: defineTable({
    userId: v.string(),
    text: v.string(),
    completed: v.boolean(),
    priority: v.string(), // "high", "medium", "low"
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }),
  
  reminders: defineTable({
    userId: v.string(),
    text: v.string(),
    date: v.string(), // ISO date string
    time: v.string(), // HH:MM format
    recurring: v.string(), // "none", "daily", "weekly", "monthly", "yearly"
    completed: v.boolean(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }),
  
  voiceRecordings: defineTable({
    userId: v.string(),
    audioUrl: v.string(),
    transcription: v.optional(v.string()),
    processed: v.boolean(), // whether AI has processed this recording
    reminderText: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
