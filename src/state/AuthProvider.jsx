import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { getLocalProfile, saveLocalProfile } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(getLocalProfile());
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
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        saveLocalProfile(data);
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
        if (supabase) {
          await supabase.auth.signOut();
        }
        setSession(null);
      },
      async saveProfile(nextProfile) {
        const mergedProfile = {
          ...profile,
          ...nextProfile,
          id: session?.user?.id ?? profile?.id ?? 'local-user',
          updated_at: new Date().toISOString(),
        };

        if (supabase && session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .upsert(mergedProfile, { onConflict: 'id' })
            .select()
            .single();

          if (error) {
            throw error;
          }

          setProfile(data);
          saveLocalProfile(data);
          return data;
        }

        setProfile(mergedProfile);
        saveLocalProfile(mergedProfile);
        return mergedProfile;
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
