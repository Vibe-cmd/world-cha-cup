import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teams from '../data/teams.json';
import { TEAM_PALETTES } from '../config/teamPalettes.js';
import { useAuth } from '../state/AuthProvider.jsx';
import { clearLocalProfile, getSettings, saveSettings } from '../utils/storage.js';

const fonts = [
  "'Space Grotesk', system-ui, sans-serif",
  "'IBM Plex Mono', monospace",
  "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  "Verdana, Geneva, sans-serif",
];

export default function Settings() {
  const { profile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [form, setForm] = useState({
    username: profile?.username ?? '',
    personal_tag: profile?.personal_tag ?? '',
    favorite_team: profile?.favorite_team ?? 'Brazil',
  });

  const persistSettings = (nextSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
    document.documentElement.dataset.theme = nextSettings.darkMode ? 'dark' : 'light';
    document.documentElement.style.setProperty('--font-ui', nextSettings.font);
  };

  async function saveAccount(event) {
    event.preventDefault();
    await saveProfile({ ...form, palette: TEAM_PALETTES[form.favorite_team] });
  }

  return (
    <section className="grid two-col">
      <div className="stack">
        <span className="eyebrow">Settings</span>
        <h2>Tune the matchday booth</h2>
        <label className="field">
          Font selector
          <select
            value={settings.font ?? fonts[0]}
            onChange={(event) => persistSettings({ ...settings, font: event.target.value })}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font.split(',')[0].replaceAll("'", '')}
              </option>
            ))}
          </select>
        </label>
        <button
          className="cursor-target"
          onClick={() => persistSettings({ ...settings, darkMode: !settings.darkMode })}
        >
          {settings.darkMode ? 'Disable' : 'Enable'} dark mode
        </button>
        <button
          className="cursor-target"
          onClick={() => {
            clearLocalProfile();
            navigate('/onboarding');
          }}
        >
          Reset onboarding
        </button>
      </div>
      <form className="stack" onSubmit={saveAccount}>
        <span className="eyebrow">Account</span>
        <label className="field">
          Username
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </label>
        <label className="field">
          Personal Tag
          <input
            value={form.personal_tag}
            onChange={(event) => setForm({ ...form, personal_tag: event.target.value })}
          />
        </label>
        <label className="field">
          Favourite Team
          <select
            value={form.favorite_team}
            onChange={(event) => setForm({ ...form, favorite_team: event.target.value })}
          >
            {teams.map((team) => (
              <option key={team.name}>{team.name}</option>
            ))}
          </select>
        </label>
        <button className="cursor-target" type="submit">
          Save Account
        </button>
      </form>
    </section>
  );
}
