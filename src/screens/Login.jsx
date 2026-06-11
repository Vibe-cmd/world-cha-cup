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
            Supabase env vars are missing, so the app is running in local demo mode. Add `.env` values to enable Google
            login.
          </p>
        )}
        <button className="cursor-target" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </div>
    </section>
  );
}
