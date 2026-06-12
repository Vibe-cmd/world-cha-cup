import { cachedRequest } from './cacheStore.js';

const API_BASE = '/api/api-football';
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;
const STATIC_TTL = 1000 * 60 * 60 * 24 * 30;
const FIXTURES_TTL = 1000 * 60 * 60 * 12;
const STANDINGS_TTL = 1000 * 60 * 60 * 6;

function normalizeStatus(statusShort) {
  return ['FT', 'AET', 'PEN'].includes(statusShort) ? 'finished' : 'upcoming';
}

function normalizeMatch(item) {
  return {
    id: String(item.fixture.id),
    stage: item.league.round ?? 'World Cup',
    group: item.league.round?.includes('Group') ? item.league.round : null,
    home: item.teams.home?.name ?? 'TBD',
    away: item.teams.away?.name ?? 'TBD',
    homeLogo: item.teams.home?.logo,
    awayLogo: item.teams.away?.logo,
    startsAt: item.fixture.date,
    venue: item.fixture.venue?.name ?? 'Venue TBA',
    status: normalizeStatus(item.fixture.status?.short),
    homeScore: item.goals?.home,
    awayScore: item.goals?.away,
  };
}

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`api-football request failed: ${response.status}${detail ? ` - ${detail}` : ''}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`api-football error: ${JSON.stringify(data.errors)}`);
  }

  return data.response ?? [];
}

export async function getApiFootballMatches() {
  const response = await cachedRequest('api-football:wc-2026:fixtures', FIXTURES_TTL, () =>
    request(`/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`),
  );
  return response.map(normalizeMatch);
}

export async function getApiFootballTeams() {
  const response = await cachedRequest('api-football:wc-2026:teams', STATIC_TTL, () =>
    request(`/teams?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`),
  );
  return response.map((item) => ({
    id: String(item.team.id),
    name: item.team.name,
    shortName: item.team.name,
    crest: item.team.logo,
    tla: item.team.code,
  }));
}

export async function getApiFootballStandings() {
  const response = await cachedRequest('api-football:wc-2026:standings', STANDINGS_TTL, () =>
    request(`/standings?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`),
  );

  return response.flatMap((leagueItem) =>
    (leagueItem.league?.standings ?? []).flatMap((groupRows) =>
      groupRows.map((row) => ({
        group: row.group,
        team: row.team.name,
        crest: row.team.logo,
        played: row.all?.played ?? 0,
        points: row.points ?? 0,
        goalDifference: row.goalsDiff ?? 0,
        position: row.rank,
      })),
    ),
  );
}
