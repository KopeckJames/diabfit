import { storeData, getData, removeData, STORAGE_KEYS } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

// User profile type
export interface User {
  id: string;
  email: string;
  name: string;
  diabetesType: string;
  diagnosisYear: number;
  age: number;
  weight: number;
  height: number;
  a1c?: number;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  createdAt: Date;
  updatedAt: Date;
}

export const signUp = async (
  email: string,
  password: string,
  userData: Partial<User>
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Check if user already exists
    const existingUsers = await getData<User[]>(STORAGE_KEYS.USER) || [];
    const userExists = existingUsers.some(user => user.email === email);

    if (userExists) {
      return { user: null, error: 'User with this email already exists' };
    }

    // Create new user profile
    const userId = uuidv4();
    const userProfile: User = {
      id: userId,
      email: email,
      name: userData.name || '',
      diabetesType: userData.diabetesType || 'Type 2',
      diagnosisYear: userData.diagnosisYear || new Date().getFullYear(),
      age: userData.age || 0,
      weight: userData.weight || 0,
      height: userData.height || 0,
      a1c: userData.a1c,
      targetGlucoseMin: userData.targetGlucoseMin || 80,
      targetGlucoseMax: userData.targetGlucoseMax || 140,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store user in local storage
    await storeData(STORAGE_KEYS.USER, [...existingUsers, userProfile]);

    // Store auth token (simple implementation - in a real app, use secure storage)
    await storeData(STORAGE_KEYS.AUTH_TOKEN, { userId, email });

    return { user: userProfile, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { user: null, error: error.message || 'Failed to sign up' };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Get current auth token
    const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

    // If we're already signed in and just need the user profile
    if (authToken && !password) {
      const users = await getData<User[]>(STORAGE_KEYS.USER) || [];
      const currentUser = users.find(user => user.id === authToken.userId);

      if (currentUser) {
        return { user: currentUser, error: null };
      } else {
        return { user: null, error: 'User profile not found' };
      }
    }

    // Otherwise, sign in with email and password
    const users = await getData<User[]>(STORAGE_KEYS.USER) || [];
    const user = users.find(user => user.email === email);

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    // In a real app, you would verify the password hash here
    // For this demo, we'll just accept any password

    // Store auth token
    await storeData(STORAGE_KEYS.AUTH_TOKEN, { userId: user.id, email });

    return { user, error: null };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { user: null, error: error.message || 'Failed to sign in' };
  }
};

export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    // Remove auth token
    await removeData(STORAGE_KEYS.AUTH_TOKEN);
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    // In a real app, you would send a password reset email
    console.log(`Password reset requested for ${email}`);
    return { error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { error: error.message || 'Failed to reset password' };
  }
};

export const updatePassword = async (password: string): Promise<{ error: string | null }> => {
  try {
    // Get current auth token
    const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

    if (!authToken) {
      return { error: 'No user is signed in' };
    }

    // In a real app, you would update the password hash
    console.log(`Password updated for user ${authToken.email}`);
    return { error: null };
  } catch (error: any) {
    console.error('Error updating password:', error);
    return { error: error.message || 'Failed to update password' };
  }
};

export const getCurrentSession = async () => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) {
    return null;
  }

  // Get user profile
  const users = await getData<User[]>(STORAGE_KEYS.USER) || [];
  return users.find(user => user.id === authToken.userId) || null;
};
