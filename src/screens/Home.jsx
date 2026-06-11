import MagicBento from '../components/MagicBento/MagicBento.jsx';
import StaggeredMenu from '../components/StaggeredMenu/StaggeredMenu.jsx';
import { useFootballData } from '../hooks/useFootballData.js';
import { useAuth } from '../state/AuthProvider.jsx';

function MatchList({ items }) {
  if (!items.length) {
    return <p className="muted">No match data available yet. Check the API keys and quota.</p>;
  }

  return (
    <div className="match-list">
      {items.map((match) => (
        <div key={match.id} className="match-row mono">
          <strong className="match-teams">
            {match.home} vs {match.away}
          </strong>
          <span className="match-time">{new Date(match.startsAt).toLocaleString()}</span>
          <span className="match-venue">{match.venue}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { profile } = useAuth();
  const { loading, error, upcoming, finished } = useFootballData();
  const myTeamMatch = upcoming.find((match) => [match.home, match.away].includes(profile?.favorite_team));
  const majorTeams = ['Brazil', 'France', 'Germany', 'Argentina', 'England', 'Spain'];
  const majorFixtures = upcoming.filter((match) => majorTeams.includes(match.home) || majorTeams.includes(match.away));

  const cards = [
    {
      kicker: 'Next 3',
      title: 'Upcoming Matches',
      span: 'span-wide',
      children: <MatchList items={upcoming.slice(0, 3)} />,
    },
    {
      kicker: profile?.favorite_team,
      title: "My Team's Next Match",
      span: 'span-tall',
      children: <MatchList items={myTeamMatch ? [myTeamMatch] : []} />,
    },
    {
      kicker: 'Big beasts',
      title: 'Major Team Fixtures',
      span: 'span-hex',
      children: <MatchList items={majorFixtures.slice(0, 4)} />,
    },
    {
      kicker: 'Final whistles',
      title: 'Recent Scores',
      span: 'span-square',
      children: finished.length ? (
        finished.slice(0, 5).map((result) => (
          <p className="mono" key={result.id}>
            {result.home} {result.homeScore ?? '—'} — {result.awayScore ?? '—'} {result.away}
          </p>
        ))
      ) : (
        <p className="muted">No completed World Cup matches returned yet.</p>
      ),
    },
  ];

  return (
    <>
      <StaggeredMenu />
      <section className="section-title">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>Matchday chaos, neatly boxed</h2>
        </div>
        <div className="profile-mini">
          {profile?.avatar && <img className="avatar-chip" src={profile.avatar} alt="" />}
          <p className="mono">{loading ? 'Loading live fixtures…' : error || profile?.personal_tag}</p>
        </div>
      </section>
      <MagicBento cards={cards} />
    </>
  );
}
