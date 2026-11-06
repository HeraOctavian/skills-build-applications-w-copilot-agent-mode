import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: Entry[] };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardResponse>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    emptyMessage="No rankings yet."
    isEmpty={({ leaderboard }) => leaderboard.length === 0}
    renderData={({ leaderboard }) => <ol>{leaderboard.map((entry) => <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>}
  />;
}
