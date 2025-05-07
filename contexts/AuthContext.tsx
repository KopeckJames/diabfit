import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, signIn, signOut, signUp, getCurrentSession } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: 'AuthContext not initialized' }),
  signUp: async () => ({ error: 'AuthContext not initialized' }),
  signOut: async () => ({ error: 'AuthContext not initialized' }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        // Check if user is already signed in
        const currentUser = await getCurrentSession();

        if (currentUser) {
          // User is signed in
          setUser(currentUser);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, error } = await signIn(email, password);
      if (error) return { error };
      setUser(user);
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const { user, error } = await signUp(email, password, userData);
      if (error) return { error };
      setUser(user);
      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) return { error };
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
