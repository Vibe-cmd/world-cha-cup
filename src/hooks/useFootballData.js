import { useEffect, useState } from 'react';
import { getApiFootballMatches, getApiFootballStandings, getApiFootballTeams } from '../services/apiFootball.js';
import { getWorldCupMatches, getWorldCupStandings, getWorldCupTeams, splitMatches } from '../services/footballData.js';

export function useFootballData() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    matches: [],
    teams: [],
    standings: [],
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      const primaryResults = await Promise.allSettled([
        getApiFootballMatches(),
        getApiFootballTeams(),
        getApiFootballStandings(),
      ]);

      const primaryMatches = primaryResults[0].status === 'fulfilled' ? primaryResults[0].value : [];
      const shouldUseBackup = primaryMatches.length === 0;
      const results = shouldUseBackup
        ? await Promise.allSettled([getWorldCupMatches(), getWorldCupTeams(), getWorldCupStandings()])
        : primaryResults;

      const [matchesResult, teamsResult, standingsResult] = results;
      const matches = matchesResult.status === 'fulfilled' ? matchesResult.value : [];
      const teams = teamsResult.status === 'fulfilled' ? teamsResult.value : [];
      const standings = standingsResult.status === 'fulfilled' ? standingsResult.value : [];
      const errors = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message)
        .filter(Boolean);

      if (active) {
        setState({
          loading: false,
          error: matches.length ? '' : errors[0] ?? '',
          matches,
          teams,
          standings,
        });
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    ...splitMatches(state.matches),
  };
}
