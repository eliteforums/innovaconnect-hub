import React, { createContext, useContext, useEffect, useState } from "react";
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
  signIn: (email: string) => Promise<{ error: string | null }>;
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

  const loadProfile = async (authUser: User) => {
    const { role, profileData } = await resolveUserRole(authUser.email ?? "");
    setUser({
      id: authUser.id,
      email: authUser.email ?? "",
      role,
      profileData,
    });
  };

  useEffect(() => {
    // Get initial session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (magic link callback, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
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

  const signIn = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Only allow sign-in for existing users (those who registered / applied)
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user);
  };

  return (
    <PortalAuthContext.Provider
      value={{ user, session, loading, signIn, signOut, refreshProfile }}
    >
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
