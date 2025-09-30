import { ShardedCounter } from "@convex-dev/sharded-counter";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";

const votesCounter = new ShardedCounter(components.shardedCounter, {
  defaultShards: 8,
});

const catVotes = votesCounter.for("cats");
const dogVotes = votesCounter.for("dogs");

export const castVote = mutation({
  args: {
    choice: v.union(v.literal("cat"), v.literal("dog")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.choice === "cat") {
      await catVotes.inc(ctx);
    } else {
      await dogVotes.inc(ctx);
    }
    return null;
  },
});

export const getVoteCounts = query({
  args: {},
  returns: v.object({
    cat: v.number(),
    dog: v.number(),
  }),
  handler: async (ctx) => {
    const [catCount, dogCount] = await Promise.all([
      catVotes.count(ctx),
      dogVotes.count(ctx),
    ]);

    return {
      cat: Math.round(catCount),
      dog: Math.round(dogCount),
    };
  },
});