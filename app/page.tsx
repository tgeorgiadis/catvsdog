"use client";

import { useCallback } from "react";
import { OptimisticLocalStore, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  const counts = useQuery(api.main.getVoteCounts);
  const optimisticCastVote = useOptimisticVoteMutation();

  const voteFor = useCallback(
    (choice: "cat" | "dog") => {
      void optimisticCastVote({ choice });
    },
    [optimisticCastVote],
  );

  const catCount = counts?.cat ?? 0;
  const dogCount = counts?.dog ?? 0;
  const totalVotes = catCount + dogCount;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Cat vs Dog</h1>
        <p className="text-muted-foreground">
          Cast your vote to decide which pet reigns supreme.
        </p>
      </header>
      <section className="flex flex-col gap-8 items-center">
        <div className="grid grid-cols-2 gap-6">
          <VoteCard
            label="Cats"
            count={catCount}
            onClick={() => voteFor("cat")}
            tone="cat"
            imageSrc="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80"
            imageAlt="Orange tabby cat looking at the camera"
          />
          <VoteCard
            label="Dogs"
            count={dogCount}
            onClick={() => voteFor("dog")}
            tone="dog"
            imageSrc="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80"
            imageAlt="Brown puppy sticking its tongue out"
          />
        </div>
        <div className="text-center text-sm text-muted-foreground">
          {counts === undefined ? "Loading live counts..." : `Total votes: ${totalVotes}`}
        </div>
      </section>
    </main>
  );
}

function useOptimisticVoteMutation() {
  const castVote = useMutation(api.main.castVote).withOptimisticUpdate(
    (localStore, args) => {
      updateVoteCountsOptimistically(localStore, args.choice);
    },
  );

  return castVote;
}

function updateVoteCountsOptimistically(
  localStore: OptimisticLocalStore,
  choice: "cat" | "dog",
) {
  const current = localStore.getQuery(api.main.getVoteCounts, {});
  if (current === undefined) {
    return;
  }

  const next = {
    ...current,
    cat: current.cat + (choice === "cat" ? 1 : 0),
    dog: current.dog + (choice === "dog" ? 1 : 0),
  };

  localStore.setQuery(api.main.getVoteCounts, {}, next);
}

function VoteCard({
  label,
  count,
  onClick,
  tone,
  imageSrc,
  imageAlt,
}: {
  label: string;
  count: number;
  onClick: () => void;
  tone: "cat" | "dog";
  imageSrc?: string;
  imageAlt?: string;
}) {
  const toneClass =
    tone === "cat"
      ? "bg-purple-100 text-purple-950 hover:bg-purple-200"
      : "bg-amber-100 text-amber-950 hover:bg-amber-200";

  return (
    <button
      className={`flex flex-col items-center justify-center rounded-2xl p-6 shadow transition ${toneClass}`}
      onClick={onClick}
    >
      {imageSrc ? (
        <span className="w-32 h-32 mb-4 overflow-hidden rounded-full border border-foreground/20">
          <img
            src={imageSrc}
            alt={imageAlt ?? label}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </span>
      ) : null}
      <span className="text-xl font-semibold">{label}</span>
      <span className="text-5xl font-black">{count}</span>
      <span className="text-sm mt-2">Click to vote</span>
    </button>
  );
}
