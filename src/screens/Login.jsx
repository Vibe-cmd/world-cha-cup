import { isSupabaseConfigured } from '../lib/supabase.js';
import { useAuth } from '../state/AuthProvider.jsx';

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="login-screen">
      <div className="hero-panel">
        <span className="eyebrow">Google OAuth + Supabase</span>
        <h1>World Cha Cup</h1>
        <p>
          Gather your group, pick your country, call the match outcomes, and climb a tiny chaotic football
          leaderboard.
        </p>
        {!isSupabaseConfigured && (
          <p className="muted">
            Supabase env vars are missing from this build. Add `VITE_SUPABASE_URL` and
            `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel, then redeploy.
          </p>
        )}
        <button className="cursor-target" onClick={signInWithGoogle} disabled={!isSupabaseConfigured}>
          Sign in with Google
        </button>
      </div>
    </section>
  );
}
