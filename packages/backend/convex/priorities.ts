import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    text: v.string(),
    priority: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const priorityId = await ctx.db.insert("priorities", {
      text: args.text,
      priority: args.priority,
      userId: args.userId,
      completed: false,
      createdAt: Date.now(),
    });
    return priorityId;
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("priorities")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const toggle = mutation({
  args: { id: v.id("priorities") },
  handler: async (ctx, args) => {
    const priority = await ctx.db.get(args.id);
    if (!priority) throw new Error("Priority not found");
    
    await ctx.db.patch(args.id, {
      completed: !priority.completed,
      completedAt: !priority.completed ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("priorities"),
    text: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("priorities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 