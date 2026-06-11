import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../state/AuthProvider.jsx';

const adminPin = import.meta.env.VITE_ADMIN_PIN ?? '2026';

export default function Admin() {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    match_label: '',
    youtube_id: '',
    description: '',
    highlight_date: new Date().toISOString().slice(0, 10),
  });

  async function submitHighlight(event) {
    event.preventDefault();

    if (supabase && user) {
      const { error } = await supabase.from('highlights').insert({ ...form, created_by: user.id });
      setMessage(error ? error.message : 'Highlight saved to Supabase.');
      return;
    }

    setMessage('Demo mode: connect Supabase to save highlights centrally.');
  }

  if (!unlocked) {
    return (
      <section className="hero-panel">
        <span className="eyebrow">Admin</span>
        <h2>Protected clips booth</h2>
        <label className="field">
          PIN
          <input value={pin} onChange={(event) => setPin(event.target.value)} type="password" />
        </label>
        <button className="cursor-target" onClick={() => setUnlocked(pin === adminPin)}>
          Unlock
        </button>
      </section>
    );
  }

  return (
    <section className="grid two-col">
      <form className="stack" onSubmit={submitHighlight}>
        <span className="eyebrow">Add highlight</span>
        <label className="field">
          Match label
          <input
            value={form.match_label}
            onChange={(event) => setForm({ ...form, match_label: event.target.value })}
            required
          />
        </label>
        <label className="field">
          YouTube video ID
          <input
            value={form.youtube_id}
            onChange={(event) => setForm({ ...form, youtube_id: event.target.value })}
            required
          />
        </label>
        <label className="field">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <label className="field">
          Date
          <input
            type="date"
            value={form.highlight_date}
            onChange={(event) => setForm({ ...form, highlight_date: event.target.value })}
          />
        </label>
        <button className="cursor-target" type="submit">
          Add Highlight
        </button>
      </form>
      <article className="card">
        <h3>Admin security note</h3>
        <p>
          The PIN protects the UI only. Production writes are guarded by the Supabase `admins` table and RLS policy in
          `supabase/schema.sql`.
        </p>
        {message && <p className="mono">{message}</p>}
      </article>
    </section>
  );
}
