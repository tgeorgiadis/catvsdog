"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import { OptimisticLocalStore } from "convex/browser";
import { api } from "../convex/_generated/api";

type VoteCounts = {
  cat: number;
  dog: number;
  goldfish: number;
};

type Animal = "cat" | "dog" | "goldfish";

export default function HomeClient({
  initialCounts,
  preloadedQuery,
}: {
  initialCounts: VoteCounts;
  preloadedQuery: Preloaded<typeof api.main.getVoteCounts>;
}) {
  const queryCounts = usePreloadedQuery(preloadedQuery);
  const counts = queryCounts ?? initialCounts;
  const optimisticCastVote = useOptimisticVoteMutation();
  const [showGoldfish, setShowGoldfish] = useState(false);

  const voteFor = useCallback(
    (choice: "cat" | "dog" | "goldfish") => {
      void optimisticCastVote({ choice });
    },
    [optimisticCastVote],
  );

  const catCount = counts.cat;
  const dogCount = counts.dog;
  const goldfishCount = counts.goldfish ?? 0;
  const totalVotes = catCount + dogCount + (showGoldfish ? goldfishCount : 0);

  const voteCards = useMemo(() => {
    const cards = [
      {
        label: "Cats",
        count: catCount,
        tone: "cat" as Animal,
        imageSrc:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80",
        imageAlt: "Orange tabby cat looking at the camera",
        onClick: () => voteFor("cat"),
      },
      {
        label: "Dogs",
        count: dogCount,
        tone: "dog" as Animal,
        imageSrc:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80",
        imageAlt: "Brown puppy sticking its tongue out",
        onClick: () => voteFor("dog"),
      },
    ];

    if (showGoldfish) {
      cards.push({
        label: "Goldfish",
        count: goldfishCount,
        tone: "goldfish" as Animal,
        imageSrc:
          "https://images.unsplash.com/photo-1579161256825-57ba3094f057?auto=format&fit=crop&w=400&q=80",
        imageAlt: "Goldfish swimming in clear water",
        onClick: () => voteFor("goldfish"),
      });
    }

    return cards;
  }, [catCount, dogCount, goldfishCount, showGoldfish, voteFor]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-12 p-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Cat vs Dog</h1>
        <p className="text-muted-foreground">
          Cast your vote to decide which pet reigns supreme.
        </p>
      </header>
      <section className="flex flex-col gap-8 items-center">
        <div className="w-full max-w-4xl px-2 md:px-0">
          <div className="flex w-full gap-4 items-stretch">
            {voteCards.map((card) => (
              <VoteCard key={card.label} {...card} />
            ))}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          {queryCounts === undefined
            ? `Total votes: ${totalVotes}`
            : `Total votes: ${totalVotes}`}
        </div>
      </section>
      <GoldfishEasterEgg onReveal={() => setShowGoldfish(true)} />
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
  choice: "cat" | "dog" | "goldfish",
) {
  const current = localStore.getQuery(api.main.getVoteCounts, {});
  if (current === undefined) {
    return;
  }

  const next = {
    ...current,
    cat: current.cat + (choice === "cat" ? 1 : 0),
    dog: current.dog + (choice === "dog" ? 1 : 0),
    goldfish: (current.goldfish ?? 0) + (choice === "goldfish" ? 1 : 0),
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
  tone: Animal;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const toneClass =
    tone === "cat"
      ? "bg-purple-100 text-purple-950 hover:bg-purple-200"
      : tone === "dog"
        ? "bg-amber-100 text-amber-950 hover:bg-amber-200"
        : "bg-sky-100 text-sky-950 hover:bg-sky-200";

  return (
    <button
      className={`flex basis-0 flex-1 min-w-0 max-w-[12rem] flex-col items-center justify-center rounded-2xl p-5 shadow transition ${toneClass}`}
      id={`vote-${label.toLowerCase()}-button`}
      onClick={onClick}
    >
      {imageSrc ? (
        <span className="w-full aspect-square mb-4 overflow-hidden rounded-full border border-foreground/20">
          <img
            src={imageSrc}
            alt={imageAlt ?? label}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        </span>
      ) : null}
      <span className="text-xl font-semibold">{label}</span>
      <span className="text-4xl font-black sm:text-5xl">{count}</span>
      <span className="text-sm mt-2">Click to vote</span>
    </button>
  );
}

function GoldfishEasterEgg({ onReveal }: { onReveal: () => void }) {
  return (
    <button
      className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 shadow-lg transition hover:scale-105 hover:bg-orange-300"
      onClick={onReveal}
      aria-label="Reveal goldfish voting"
      id="goldfish-easter-egg-button"
    >
      <span className="text-2xl">🐠</span>
    </button>
  );
}

