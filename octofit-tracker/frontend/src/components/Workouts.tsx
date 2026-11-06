import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  return <CapabilityCard<WorkoutResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    emptyMessage="No workout suggestions yet."
    isEmpty={({ suggestions }) => suggestions.length === 0}
    renderData={({ suggestions }) => <ul>{suggestions.map((workout) => <li key={workout.title}><strong>{workout.title}</strong>{workout.focus ? ` - ${workout.focus}` : ''}{workout.minutes ? `, ${workout.minutes} minutes` : ''}{workout.difficulty ? `, ${workout.difficulty}` : ''}{workout.reason ? <p>{workout.reason}</p> : null}</li>)}</ul>}
  />;
}
