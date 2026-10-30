import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema, { dayValidator, userValidator } from "./schema";

export const listByUser = query({
  args: {
    user: userValidator,
  },
  returns: v.array(schema.doc("workouts")),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("user", args.user))
      .take(200);

    return items.sort((a, b) => {
      if (a.day !== b.day) {
        return a.day.localeCompare(b.day);
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a._creationTime - b._creationTime;
    });
  },
});

export const upsertWorkoutSlot = mutation({
  args: {
    user: userValidator,
    day: dayValidator,
    slot: v.number(),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingInSlot = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_day_and_order", (q) =>
        q.eq("user", args.user).eq("day", args.day).eq("order", args.slot),
      )
      .take(10);

    const trimmed = args.name.trim();

    if (!trimmed) {
      for (const doc of existingInSlot) {
        await ctx.db.delete("workouts", doc._id);
      }
      return null;
    }

    if (existingInSlot.length > 0) {
      const [primary, ...duplicates] = existingInSlot;
      await ctx.db.patch("workouts", primary._id, { name: trimmed });
      for (const dup of duplicates) {
        await ctx.db.delete("workouts", dup._id);
      }
    } else {
      await ctx.db.insert("workouts", {
        user: args.user,
        day: args.day,
        name: trimmed,
        notes: "",
        order: args.slot,
      });
    }

    return null;
  },
});

export const updateNotes = mutation({
  args: {
    id: v.id("workouts"),
    notes: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      return null;
    }
    await ctx.db.patch("workouts", args.id, {
      notes: args.notes,
    });
    return null;
  },
});
