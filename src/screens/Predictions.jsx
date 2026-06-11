import { useEffect, useState } from 'react';
import teams from '../data/teams.json';
import { POINTS_CONFIG } from '../config/pointsConfig.js';
import { useFootballData } from '../hooks/useFootballData.js';
import { useAuth } from '../state/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

const roundOf16Slots = [
  ['r16-1', 'Winner A', 'Runner-up B'],
  ['r16-2', 'Winner C', 'Runner-up D'],
  ['r16-3', 'Winner E', 'Runner-up F'],
  ['r16-4', 'Winner G', 'Runner-up H'],
  ['r16-5', 'Winner B', 'Runner-up A'],
  ['r16-6', 'Winner D', 'Runner-up C'],
  ['r16-7', 'Winner F', 'Runner-up E'],
  ['r16-8', 'Winner H', 'Runner-up G'],
];

const knockoutRounds = [
  { label: 'Quarter Finals', slots: ['qf-1', 'qf-2', 'qf-3', 'qf-4'] },
  { label: 'Semi Finals', slots: ['sf-1', 'sf-2'] },
  { label: 'Final', slots: ['final'] },
  { label: 'Champion', slots: ['champion'] },
];

export default function Predictions() {
  const { user, profile } = useAuth();
  const { loading, error, upcoming } = useFootballData();
  const [activeTab, setActiveTab] = useState('matches');
  const [selection, setSelection] = useState('');
  const [savedSelection, setSavedSelection] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [bracket, setBracket] = useState(() => JSON.parse(localStorage.getItem('world-cha-cup-bracket') ?? '{}'));
  const nextMatch = upcoming[0];
  const locked = nextMatch ? new Date(nextMatch.startsAt) <= new Date() : true;
  const leaderboard = [
    ...(profile?.username
      ? [
          {
            username: profile.username,
            personalTag: profile.personal_tag,
            points: profile.points ?? 0,
            avatar: profile.avatar,
          },
        ]
      : []),
  ].sort((a, b) => b.points - a.points);

  useEffect(() => {
    if (!nextMatch) {
      return;
    }

    const storageKey = `world-cha-cup-prediction:${nextMatch.id}`;
    const localPrediction = localStorage.getItem(storageKey) ?? '';
    setSavedSelection(localPrediction);
    setSelection(localPrediction);
    setSaveMessage(localPrediction ? 'Prediction saved.' : '');

    async function loadSavedPrediction() {
      if (!supabase || !user) {
        return;
      }

      const { data } = await supabase
        .from('match_predictions')
        .select('prediction')
        .eq('user_id', user.id)
        .eq('match_id', nextMatch.id)
        .maybeSingle();

      if (data?.prediction) {
        setSavedSelection(data.prediction);
        setSelection(data.prediction);
        localStorage.setItem(storageKey, data.prediction);
        setSaveMessage('Prediction saved.');
      }
    }

    loadSavedPrediction();
  }, [nextMatch?.id, user]);

  async function savePrediction() {
    if (!nextMatch) {
      return;
    }

    if (!selection) {
      setSaveMessage('Pick an outcome first.');
      return;
    }

    if (supabase && user && !locked) {
      const { error: saveError } = await supabase.from('match_predictions').upsert(
        {
          user_id: user.id,
          match_id: nextMatch.id,
          prediction: selection,
          locked_at: locked ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,match_id' },
      );

      if (saveError) {
        setSaveMessage(saveError.message);
        return;
      }
    }

    localStorage.setItem(`world-cha-cup-prediction:${nextMatch.id}`, selection);
    setSavedSelection(selection);
    setSaveMessage('Prediction saved.');
  }

  function getTeam(teamName) {
    return teams.find((team) => team.name === teamName);
  }

  function dropTeam(slot, teamName) {
    const team = getTeam(teamName);
    const nextBracket = { ...bracket, [slot]: team ? { name: team.name, logo: team.logo } : { name: teamName } };
    setBracket(nextBracket);
    localStorage.setItem('world-cha-cup-bracket', JSON.stringify(nextBracket));
  }

  function renderBracketSlot(slot, fallback) {
    const selectedTeam = typeof bracket[slot] === 'string' ? { name: bracket[slot] } : bracket[slot];

    return (
      <div
        key={slot}
        className="bracket-slot"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => dropTeam(slot, event.dataTransfer.getData('team'))}
      >
        <span className="mono">{fallback}</span>
        {selectedTeam?.logo && <img className="team-logo bracket-logo" src={selectedTeam.logo} alt="" />}
        <strong>{selectedTeam?.name ?? 'Drop team'}</strong>
      </div>
    );
  }

  return (
    <section className="stack">
      <div className="section-title">
        <div>
          <span className="eyebrow">Predictions</span>
          <h2>Make your suspiciously confident call</h2>
        </div>
      </div>
      <div className="row">
        <button className="cursor-target" onClick={() => setActiveTab('matches')}>
          Match Predictions
        </button>
        <button className="cursor-target" onClick={() => setActiveTab('bracket')}>
          Round of 16 Bracket
        </button>
      </div>

      {activeTab === 'matches' ? (
        <div className="grid two-col">
          <article className="card stack prediction-card">
            {nextMatch ? (
              <>
                <span className="eyebrow">{nextMatch.stage}</span>
                <h3>
                  {nextMatch.home} vs {nextMatch.away}
                </h3>
                <p className="mono">
                  {new Date(nextMatch.startsAt).toLocaleString()} · {nextMatch.venue}
                </p>
                <div className="row">
                  {[
                    ['home', `${nextMatch.home} Wins`],
                    ['draw', 'Draw'],
                    ['away', `${nextMatch.away} Wins`],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={`${selection === value ? 'selected-button' : ''} ${
                        savedSelection === value ? 'saved-prediction' : ''
                      }`}
                      disabled={locked}
                      onClick={() => {
                        setSelection(value);
                        setSaveMessage(savedSelection === value ? 'Prediction saved.' : 'Unsaved pick.');
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="row">
                  <button disabled={locked || !selection} onClick={savePrediction}>
                    Save Prediction
                  </button>
                  {saveMessage && <span className="mono prediction-save-message">{saveMessage}</span>}
                </div>
                <p className="muted">
                  Correct group-stage prediction: {POINTS_CONFIG.correctPrediction.groupStage} points.
                  {locked ? ' This match is locked.' : ' Picks lock at kickoff.'}
                </p>
              </>
            ) : (
              <p className="muted">{loading ? 'Loading match data…' : error || 'No upcoming World Cup fixtures returned.'}</p>
            )}
          </article>
          <table className="scoreboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Avatar</th>
                <th>Username</th>
                <th>Tag</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, index) => (
                <tr key={`${row.username}-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    {row.avatar ? <img className="avatar-chip" src={row.avatar} alt="" /> : <span className="avatar-chip avatar-fallback">?</span>}
                  </td>
                  <td>{row.username}</td>
                  <td>{row.personalTag ?? row.personal_tag}</td>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bracket-layout">
          <article className="card stack bracket-card">
            <span className="eyebrow">Locked preview</span>
            <h3>Round of 16 Predictor</h3>
            <p className="muted">Official Round of 16 matchups are not set yet. Use this sandbox to test drag/drop.</p>
            <div className="knockout-bracket">
              <div className="bracket-round r16-round">
                <h4>Round of 16</h4>
                {roundOf16Slots.map(([slot, homeSeed, awaySeed]) => (
                  <div className="bracket-match" key={slot}>
                    {renderBracketSlot(`${slot}-home`, homeSeed)}
                    {renderBracketSlot(`${slot}-away`, awaySeed)}
                  </div>
                ))}
              </div>
              {knockoutRounds.map((round) => (
                <div className="bracket-round" key={round.label}>
                  <h4>{round.label}</h4>
                  {round.slots.map((slot) => renderBracketSlot(slot, round.label))}
                </div>
              ))}
            </div>
          </article>
          <div className="team-grid bracket-team-bank">
            {teams.map((team) => (
              <div
                key={team.name}
                className="team-tile cursor-target"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('team', team.name)}
              >
                <img className="team-logo" src={team.logo} alt="" />
                <strong>{team.name}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
