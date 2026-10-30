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

export const addWorkout = mutation({
  args: {
    user: userValidator,
    day: dayValidator,
    name: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("workouts"),
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Workout name cannot be empty");
    }

    const lastInDay = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_day_and_order", (q) =>
        q.eq("user", args.user).eq("day", args.day),
      )
      .order("desc")
      .take(1);

    const nextOrder = lastInDay.length > 0 ? lastInDay[0].order + 1 : 0;

    return await ctx.db.insert("workouts", {
      user: args.user,
      day: args.day,
      name: trimmedName,
      notes: args.notes?.trim() ?? "",
      order: nextOrder,
    });
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

export const updateWorkout = mutation({
  args: {
    id: v.id("workouts"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Workout name cannot be empty");
    }
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      return null;
    }
    await ctx.db.patch("workouts", args.id, {
      name: trimmedName,
    });
    return null;
  },
});

export const deleteWorkout = mutation({
  args: {
    id: v.id("workouts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      return null;
    }
    await ctx.db.delete("workouts", args.id);
    return null;
  },
});

export const moveWorkout = mutation({
  args: {
    id: v.id("workouts"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.id);
    if (!target) {
      return null;
    }

    const dayWorkouts = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_day_and_order", (q) =>
        q.eq("user", target.user).eq("day", target.day),
      )
      .take(100);

    const sorted = dayWorkouts.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a._creationTime - b._creationTime;
    });

    const currentIndex = sorted.findIndex((w) => w._id === args.id);
    if (currentIndex === -1) {
      return null;
    }

    const swapIndex =
      args.direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) {
      return null;
    }

    // Normalize orders across the day and swap the two adjacent items
    const reordered = [...sorted];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[swapIndex];
    reordered[swapIndex] = temp;

    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) {
        await ctx.db.patch("workouts", reordered[i]._id, { order: i });
      }
    }

    return null;
  },
});
