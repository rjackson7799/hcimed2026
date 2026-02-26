import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/portal/lib/supabase';
import type { Profile } from '@/portal/types';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/portal/utils/constants';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showTimeoutWarning: boolean;
  role: Profile['role'] | null;
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

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowTimeoutWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, SESSION_WARNING_MS);

    logoutTimerRef.current = setTimeout(async () => {
      const loginPath = profile?.role === 'broker' ? '/partner-login' : '/hci-login';
      await supabase.auth.signOut();
      window.location.href = loginPath;
    }, SESSION_TIMEOUT_MS);
  }, [profile?.role]);

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

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
    return data as Profile;
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const userProfile = await fetchProfile(initialSession.user.id);
        if (isMounted) setProfile(userProfile);
      }

      if (isMounted) setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
            setIsLoading(false);
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsLoading(false);
          setShowTimeoutWarning(false);
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Log failed login attempt for HIPAA audit trail
      try {
        await supabase.from('audit_log').insert({
          action: 'LOGIN_FAILED',
          table_name: 'auth',
          new_values: { email, reason: 'invalid_credentials' },
        });
      } catch {
        // Audit log failure should not block login flow
      }
      // Return generic message to prevent user enumeration
      return { error: 'Invalid email or password' };
    }

    // Log successful login
    try {
      await supabase.from('audit_log').insert({
        action: 'LOGIN_SUCCESS',
        table_name: 'auth',
        new_values: { email },
      });
    } catch {
      // Audit log failure should not block login flow
    }

    return { error: null };
  };

  const signOut = async () => {
    const loginPath = profile?.role === 'broker' ? '/partner-login' : '/hci-login';
    await supabase.auth.signOut();
    window.location.href = loginPath;
  };

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
