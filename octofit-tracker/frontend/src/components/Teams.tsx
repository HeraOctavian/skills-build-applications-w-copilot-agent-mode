import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members: Array<string | { name: string }> };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  return <CapabilityCard<TeamResponse>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    emptyMessage="No teams yet."
    isEmpty={({ teams }) => teams.length === 0}
    renderData={({ teams }) => <ul>{teams.map((team) => <li key={team.name}>{team.name}{team.mascot ? ` (${team.mascot})` : ''} - {team.members.length} members</li>)}</ul>}
  />;
}
