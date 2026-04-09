import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { resolveUserRole } from "@/lib/portalAuth";
import type { PortalUser } from "@/lib/portalAuth";

// ─────────────────────────────────────────────
// Context value type
// ─────────────────────────────────────────────

type PortalAuthContextValue = {
  user: PortalUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export const PortalAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    const { role, profileData } = await resolveUserRole(authUser.email ?? "");
    setUser({
      id: authUser.id,
      email: authUser.email ?? "",
      role,
      profileData,
    });
  }, []);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount with the current session
    // so we don't need a separate getSession() call — that causes double loadProfile
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      if (sess?.user) {
        await loadProfile(sess.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: error.message };
      if (data.session?.user) {
        await loadProfile(data.session.user);
      }
      return { error: null };
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user);
  }, [session, loadProfile]);

  const contextValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, session, loading, signIn, signOut, refreshProfile],
  );

  return (
    <PortalAuthContext.Provider value={contextValue}>
      {children}
    </PortalAuthContext.Provider>
  );
};

export const usePortalAuth = () => {
  const ctx = useContext(PortalAuthContext);
  if (!ctx)
    throw new Error("usePortalAuth must be used inside <PortalAuthProvider>");
  return ctx;
};
