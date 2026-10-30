import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userValidator = v.union(v.literal("akash"), v.literal("achini"));

export const dayValidator = v.union(
  v.literal("monday"),
  v.literal("tuesday"),
  v.literal("wednesday"),
  v.literal("thursday"),
  v.literal("friday"),
  v.literal("saturday"),
);

export default defineSchema({
  workouts: defineTable({
    user: userValidator,
    day: dayValidator,
    name: v.string(),
    notes: v.string(),
    order: v.number(),
  })
    .index("by_user", ["user"])
    .index("by_user_and_day_and_order", ["user", "day", "order"]),
});
