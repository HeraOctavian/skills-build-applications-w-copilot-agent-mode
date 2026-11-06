import { Activity, Team, User, Workout } from '../models/index.js';

type ServiceError = Error & { status: number };

function serviceError(message: string, status: number): ServiceError {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw serviceError('Activity details are required', 400);
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || typeof teamId !== 'string' || typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw serviceError('Valid user, team, activity type, and positive minutes are required', 400);
  }
  if (!/^[\da-f]{24}$/i.test(userId) || !/^[\da-f]{24}$/i.test(teamId)) {
    throw serviceError('User and team IDs must be valid', 400);
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw serviceError('User or team was not found', 404);
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim()) {
    throw serviceError('A team name is required', 400);
  }
  if (typeof input.mascot !== 'string' || !input.mascot.trim()) {
    throw serviceError('A team mascot is required', 400);
  }
  const members = input.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !/^[\da-f]{24}$/i.test(member))) {
    throw serviceError('Team members must be valid user IDs', 400);
  }
  const users = members.length ? await User.find({ _id: { $in: members } }).select('_id').lean() : [];
  if (users.length !== new Set(members).size) throw serviceError('One or more team members were not found', 404);
  return Team.create({ name: input.name.trim(), mascot: input.mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw serviceError('User was not found', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const goal = user.fitnessGoal.trim().toLowerCase();
  const activityFocus = recentActivity
    ? ({ run: 'endurance', cycle: 'endurance', walk: 'endurance', swim: 'endurance', strength: 'strength', yoga: 'mobility' } as Record<string, string>)[recentActivity.type.toLowerCase()]
    : undefined;
  const focus = goal || activityFocus;
  const workouts = await Workout.find().lean();
  return workouts
    .map((workout) => {
      const matchesGoal = workout.focus.toLowerCase() === focus;
      const activityReason = recentActivity && activityFocus === workout.focus.toLowerCase()
        ? `Recommended based on your recent ${recentActivity.type} activity.`
        : undefined;
      const reason = matchesGoal
        ? `Matches your ${goal} fitness goal${activityReason ? ` and recent ${recentActivity?.type} activity` : ''}.`
        : activityReason ?? `A ${workout.focus} workout to support your ${goal} goal.`;
      return { ...workout, reason, matchesFocus: matchesGoal || workout.focus.toLowerCase() === activityFocus };
    })
    .sort((left, right) => Number(right.matchesFocus) - Number(left.matchesFocus) || left.title.localeCompare(right.title))
    .map(({ matchesFocus: _matchesFocus, ...workout }) => workout);
}

export { User };
