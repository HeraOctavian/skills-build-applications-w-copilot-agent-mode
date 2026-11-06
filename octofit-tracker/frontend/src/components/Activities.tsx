import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  return <CapabilityCard<ActivityResponse>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    emptyMessage="No activities yet."
    isEmpty={({ activities }) => activities.length === 0}
    renderData={({ activities }) => <ul>{activities.map((activity, index) => <li key={`${activity.type}-${activity.occurredAt ?? index}`}>{activity.type}: {activity.minutes} minutes, {activity.points} points</li>)}</ul>}
  />;
}
