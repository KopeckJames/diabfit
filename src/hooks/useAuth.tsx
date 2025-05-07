import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@DiabFit:user');
        const storedToken = await AsyncStorage.getItem('@DiabFit:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error loading storage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Extract a name from the email (for demo purposes)
      const nameFromEmail = email.split('@')[0];
      const formattedName = nameFromEmail
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      // In a real app, you would make an API call to authenticate the user
      // For now, we'll simulate a successful login with mock data
      const mockUser = {
        id: '1',
        name: formattedName, // Use the name derived from email
        email: email
      };

      // Store user data and token in AsyncStorage
      await AsyncStorage.setItem('@DiabFit:user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('@DiabFit:token', 'mock-token');

      setUser(mockUser);
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      // In a real app, you would make an API call to register the user
      // For now, we'll simulate a successful registration with mock data
      const mockUser = {
        id: '1',
        name: name,
        email: email
      };

      // Store user data and token in AsyncStorage
      await AsyncStorage.setItem('@DiabFit:user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('@DiabFit:token', 'mock-token');

      setUser(mockUser);
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Remove user data and token from AsyncStorage
      await AsyncStorage.removeItem('@DiabFit:user');
      await AsyncStorage.removeItem('@DiabFit:token');

      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
