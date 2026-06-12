import { cachedRequest } from './cacheStore.js';

const API_BASE = '/api/football-data';
const WORLD_CUP_CODE = 'WC';
const STATIC_TTL = 1000 * 60 * 60 * 24 * 30;
const FIXTURES_TTL = 1000 * 60 * 60 * 12;
const STANDINGS_TTL = 1000 * 60 * 60 * 6;

function normalizeMatch(match) {
  const home = match.homeTeam?.shortName ?? match.homeTeam?.name ?? 'TBD';
  const away = match.awayTeam?.shortName ?? match.awayTeam?.name ?? 'TBD';
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  return {
    id: String(match.id),
    stage: match.stage ?? 'WORLD_CUP',
    home,
    away,
    startsAt: match.utcDate,
    venue: match.venue ?? 'Venue TBA',
    group: match.group,
    status: match.status === 'FINISHED' ? 'finished' : 'upcoming',
    homeScore,
    awayScore,
  };
}

async function request(path) {
  const response = await fetch(`${API_BASE}?path=${encodeURIComponent(path)}`, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`football-data.org request failed: ${response.status}${detail ? ` - ${detail}` : ''}`);
  }

  return response.json();
}

export async function getWorldCupMatches() {
  const data = await cachedRequest('football-data:wc-2026:matches', FIXTURES_TTL, () =>
    request(`/competitions/${WORLD_CUP_CODE}/matches?season=2026`),
  );
  return (data?.matches ?? []).map(normalizeMatch);
}

export async function getWorldCupTeams() {
  const data = await cachedRequest('football-data:wc-2026:teams', STATIC_TTL, () =>
    request(`/competitions/${WORLD_CUP_CODE}/teams?season=2026`),
  );
  return (data?.teams ?? []).map((team) => ({
    id: String(team.id),
    name: team.name,
    shortName: team.shortName,
    crest: team.crest,
    tla: team.tla,
  }));
}

export async function getWorldCupStandings() {
  const data = await cachedRequest('football-data:wc-2026:standings', STANDINGS_TTL, () =>
    request(`/competitions/${WORLD_CUP_CODE}/standings?season=2026`),
  );

  return (data?.standings ?? []).flatMap((standing) =>
    standing.table.map((row) => ({
      group: standing.group ?? standing.stage,
      team: row.team.name,
      crest: row.team.crest,
      played: row.playedGames,
      points: row.points,
      goalDifference: row.goalDifference,
      position: row.position,
    })),
  );
}

export function splitMatches(matches) {
  const sorted = [...matches].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  return {
    upcoming: sorted.filter((match) => match.status !== 'finished'),
    finished: sorted.filter((match) => match.status === 'finished').reverse(),
  };
}
