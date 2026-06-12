import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { clearLocalProfile, getLocalProfile, saveLocalProfile } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !session?.user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        saveLocalProfile(data, session.user.id);
        return;
      }

      const cachedProfile = getLocalProfile(session.user.id);
      if (cachedProfile?.id === session.user.id) {
        setProfile(cachedProfile);
      } else {
        setProfile(null);
      }
    }

    loadProfile();
  }, [session]);

  const value = useMemo(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      isLoggedIn: Boolean(session),
      isSupabaseConfigured,
      isOnboarded: Boolean(profile?.username && profile?.favorite_team && profile?.avatar),
      async signInWithGoogle() {
        if (!supabase) {
          return;
        }

        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
      },
      async signOut() {
        const userId = session?.user?.id;
        if (supabase) {
          await supabase.auth.signOut();
        }
        setSession(null);
        setProfile(null);
        clearLocalProfile(userId);
      },
      async saveProfile(nextProfile) {
        if (!supabase || !session?.user) {
          throw new Error('You must be signed in before saving onboarding.');
        }

        const mergedProfile = {
          id: session.user.id,
          full_name: nextProfile.full_name?.trim() ?? '',
          username: nextProfile.username?.trim() ?? '',
          personal_tag: nextProfile.personal_tag?.trim() ?? '',
          favorite_team: nextProfile.favorite_team,
          avatar: nextProfile.avatar,
          palette: nextProfile.palette,
          points: profile?.points ?? 0,
          updated_at: new Date().toISOString(),
        };

        if (!mergedProfile.full_name || !mergedProfile.username || !mergedProfile.personal_tag) {
          throw new Error('Please complete all identity fields.');
        }

        const { data, error } = await supabase
          .from('profiles')
          .upsert(mergedProfile, { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
        saveLocalProfile(data, session.user.id);
        return data;
      },
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
