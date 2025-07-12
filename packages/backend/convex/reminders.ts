import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    text: v.string(),
    date: v.string(),
    time: v.string(),
    recurring: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const reminderId = await ctx.db.insert("reminders", {
      text: args.text,
      date: args.date,
      time: args.time,
      recurring: args.recurring,
      userId: args.userId,
      completed: false,
      createdAt: Date.now(),
    });
    return reminderId;
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const listUpcoming = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("reminders")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gte(q.field("date"), today)
        )
      )
      .order("asc")
      .collect();
  },
});

export const toggle = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.id);
    if (!reminder) throw new Error("Reminder not found");
    
    await ctx.db.patch(args.id, {
      completed: !reminder.completed,
      completedAt: !reminder.completed ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("reminders"),
    text: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    recurring: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 