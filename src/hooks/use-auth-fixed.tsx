'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client'; // CORREÇÃO: Importar a instância pronta
import { isMockMode, mockUser as mockUserData } from '@/lib/auth';
import { Database } from '@/types/database.types';

type AppUser = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  session: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const isUsingMock = isMockMode();

  useEffect(() => {
    if (isUsingMock) {
      setUser(mockUserData as AppUser);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(userProfile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial load
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', initialSession.user.id)
          .single();
        setUser(userProfile);
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [isUsingMock]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 