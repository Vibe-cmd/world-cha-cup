import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TargetCursor from '../components/TargetCursor/TargetCursor.jsx';
import teams from '../data/teams.json';
import { AVATAR_OPTIONS } from '../data/avatars.js';
import { DEFAULT_PALETTE, TEAM_PALETTES } from '../config/teamPalettes.js';
import { useAuth } from '../state/AuthProvider.jsx';

export default function Onboarding() {
  const { profile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    personal_tag: '',
    favorite_team: profile?.favorite_team ?? teams[0]?.name ?? 'Brazil',
    avatar: profile?.avatar ?? AVATAR_OPTIONS[0]?.src ?? '',
  });
  const selectedPalette = TEAM_PALETTES[form.favorite_team] ?? DEFAULT_PALETTE;

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await saveProfile({
        ...form,
        palette: selectedPalette,
      });
      navigate('/');
    } catch (saveError) {
      setError(saveError.message ?? 'Could not save onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="onboarding-screen stack"
      style={{
        '--color-primary': selectedPalette.primary,
        '--color-secondary': selectedPalette.secondary,
      }}
    >
      <TargetCursor />
      <div className="onboarding-steps">
        {[1, 2, 3].map((item) => (
          <span key={item} className={step === item ? 'active-step' : ''}>
            {item}
          </span>
        ))}
      </div>

      <form className="onboarding-card stack" onSubmit={submit}>
        {step === 1 && (
          <>
            <div>
              <span className="eyebrow">Step 1</span>
              <h2>Set your matchday identity</h2>
            </div>
            <label className="field">
              Full Name
              <input name="full_name" value={form.full_name} onChange={update} required />
            </label>
            <label className="field">
              Username
              <input name="username" value={form.username} onChange={update} required />
            </label>
            <label className="field">
              Personal Tag
              <input name="personal_tag" value={form.personal_tag} onChange={update} required />
            </label>
            <button className="cursor-target" type="button" onClick={() => setStep(2)}>
              Next: Pick Country
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <span className="eyebrow">Step 2</span>
              <h2>Select your country</h2>
              <p className="muted">The app palette changes the moment you pick a nation.</p>
            </div>
            <div className="team-grid onboarding-grid">
              {teams.map((team) => (
                <button
                  className={`team-tile cursor-target ${form.favorite_team === team.name ? 'selected' : ''}`}
                  key={team.name}
                  type="button"
                  onClick={() => setForm({ ...form, favorite_team: team.name })}
                >
                  <img className="team-logo" src={team.logo} alt="" />
                  <strong>{team.name}</strong>
                </button>
              ))}
            </div>
            <div className="row">
              <button className="cursor-target" type="button" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="cursor-target" type="button" onClick={() => setStep(3)}>
                Next: Avatar
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <span className="eyebrow">Step 3</span>
              <h2>Choose your avatar</h2>
              <p className="muted">Drop custom player sprites into `public/avatars/` and add them in `src/data/avatars.js`.</p>
            </div>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  className={`avatar-tile cursor-target ${form.avatar === avatar.src ? 'selected' : ''}`}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: avatar.src })}
                >
                  <img className="avatar-image" src={avatar.src} alt="" />
                  <strong>{avatar.label}</strong>
                </button>
              ))}
            </div>
            <div className="row">
              <button className="cursor-target" type="button" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="cursor-target" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Enter App'}
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
          </>
        )}
      </form>
    </section>
  );
}
