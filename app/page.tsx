import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { api } from "../convex/_generated/api";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const preloaded = await preloadQuery(api.main.getVoteCounts, {});
  const counts = preloadedQueryResult(preloaded);

  return <HomeClient initialCounts={counts} preloadedQuery={preloaded} />;
}
