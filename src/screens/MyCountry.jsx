import teams from '../data/teams.json';
import MagicBento from '../components/MagicBento/MagicBento.jsx';
import { useFootballData } from '../hooks/useFootballData.js';
import { useAuth } from '../state/AuthProvider.jsx';

export default function MyCountry() {
  const { profile } = useAuth();
  const { error, upcoming, finished, standings } = useFootballData();
  const teamName = profile?.favorite_team ?? 'Brazil';
  const team = teams.find((item) => item.name === teamName);
  const teamResults = finished.filter((result) => [result.home, result.away].includes(teamName));
  const teamMatches = upcoming.filter((match) => [match.home, match.away].includes(teamName));
  const groupRows = standings
    .filter((row) => row.group === team?.group || row.team === teamName)
    .sort((a, b) => a.position - b.position);
  const standing = groupRows.find((row) => row.team === teamName);

  const cards = [
    {
      kicker: 'Status',
      title: `${teamName}`,
      span: 'span-wide',
      children: (
        <div className="country-status">
          {team?.logo && <img className="team-logo" src={team.logo} alt="" />}
          <p className="mono">
            {error ||
              `Group ${standing?.group ?? team?.group ?? '—'} · Position ${standing?.position ?? '—'} · ${
                standing?.points ?? 0
              } pts · GD ${standing?.goalDifference ?? 0}`}
          </p>
        </div>
      ),
    },
    {
      kicker: 'Recent',
      title: 'Recent Results',
      span: 'span-square',
      children: teamResults.length ? (
        teamResults.map((result) => (
          <p className="mono" key={result.id}>
            {result.home} {result.homeScore ?? '—'} — {result.awayScore ?? '—'} {result.away}
          </p>
        ))
      ) : (
        <p>No finished matches yet.</p>
      ),
    },
    {
      kicker: 'Next',
      title: 'Upcoming Fixtures',
      span: 'span-square',
      children: teamMatches.length ? (
        teamMatches.map((match) => (
          <p className="mono" key={match.id}>
            {match.home} vs {match.away} · {new Date(match.startsAt).toLocaleDateString()}
          </p>
        ))
      ) : (
        <p className="muted">No upcoming fixtures returned for this team.</p>
      ),
    },
    {
      kicker: 'Squad',
      title: 'Squad Summary',
      span: 'span-hex',
      children: <p>Coach, key players, and tournament notes can be swapped in from static team data.</p>,
    },
  ];

  return (
    <section className="stack">
      <div className="section-title">
        <div>
          <span className="eyebrow">My Country</span>
          <h2>{teamName} command center</h2>
        </div>
      </div>
      <MagicBento cards={cards} />
      <div className="table-shell">
        <table className="scoreboard">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>Played</th>
              <th>Points</th>
              <th>GD</th>
            </tr>
          </thead>
          <tbody>
            {groupRows.map((row) => (
              <tr key={row.team}>
                <td>{row.position}</td>
                <td>{row.team}</td>
                <td>{row.played}</td>
                <td>{row.points}</td>
                <td>{row.goalDifference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
