import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/utils/constants';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showTimeoutWarning: boolean;
  role: Profile['role'] | null;
  canViewRevenue: boolean;
  canWriteAwv: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const getLoginPath = useCallback((roleValue?: Profile['role'] | null) => {
    if (roleValue === 'broker' || window.location.pathname.startsWith('/broker')) {
      return '/partner-login';
    }
    return '/login';
  }, []);

  const logAuditEvent = useCallback((
    action: 'LOGIN_FAILED' | 'LOGIN_SUCCESS',
    email: string,
    accessToken?: string
  ) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

    fetch('/api/audit-log', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ action, email }),
    })
      .catch(() => {
        // Audit log failure should not block login flow
      })
      .finally(() => clearTimeout(timeoutId));
  }, []);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowTimeoutWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, SESSION_WARNING_MS);

    logoutTimerRef.current = setTimeout(async () => {
      const loginPath = getLoginPath(profileRef.current?.role);
      await supabase.auth.signOut();
      window.location.href = loginPath;
    }, SESSION_TIMEOUT_MS);
  }, [getLoginPath]);

  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Track user activity for session timeout
  useEffect(() => {
    if (!session) return;

    const handleActivity = () => {
      // Only reset if we haven't shown warning yet
      if (!showTimeoutWarning) {
        resetTimers();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [session, showTimeoutWarning, resetTimers]);

  // Fetch profile from Supabase with retry for transient failures
  const fetchProfile = useCallback(async (userId: string, retries = 2): Promise<Profile | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) return data as Profile;

      console.error(`Failed to fetch profile (attempt ${attempt + 1}/${retries + 1}):`, error);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    return null;
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    // Safety timeout: if loading takes more than 10s, force it off
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 10_000);

    // Get initial session
    (async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user.id);
          if (isMounted) setProfile(userProfile);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        // If session is null outside of deliberate sign-out or initial unauthenticated load,
        // the refresh token was invalidated. Force logout.
        if (!newSession && event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
          const loginPath = getLoginPath(profileRef.current?.role);
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          setShowTimeoutWarning(false);
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
          window.location.href = loginPath;
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newSession?.user) {
          try {
            const userProfile = await fetchProfile(newSession.user.id);
            if (isMounted) {
              setProfile(userProfile);
              setIsLoading(false);
            }
          } catch {
            if (isMounted) setIsLoading(false);
          }
        }

        if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          try {
            if (!profileRef.current) {
              const userProfile = await fetchProfile(newSession.user.id);
              if (isMounted) setProfile(userProfile);
            }
          } catch {
            // Profile fetch failed on refresh — non-critical if profile already exists
          } finally {
            if (isMounted) setIsLoading(false);
          }
        }

        if (event === 'SIGNED_OUT') {
          const loginPath = getLoginPath(profileRef.current?.role);
          setProfile(null);
          setIsLoading(false);
          setShowTimeoutWarning(false);
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
          // Safety net: redirect to login if signOut() didn't already navigate
          window.location.href = loginPath;
          return;
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, getLoginPath]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logAuditEvent('LOGIN_FAILED', email);
      // Return generic message to prevent user enumeration
      return { error: 'Invalid email or password' };
    }

    logAuditEvent('LOGIN_SUCCESS', email, data.session?.access_token);

    return { error: null };
  };

  const signOut = async () => {
    const loginPath = getLoginPath(profile?.role);
    await supabase.auth.signOut();
    window.location.href = loginPath;
  };

  const canViewRevenue =
    profile?.role === 'admin' ||
    (profile?.role === 'provider' &&
      !!profile?.title?.toLowerCase().includes('medical director'));
  const canWriteAwv =
    profile?.role === 'admin' || profile?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!session && !!profile,
        showTimeoutWarning,
        role: profile?.role ?? null,
        canViewRevenue,
        canWriteAwv,
        signIn,
        signOut,
        extendSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
