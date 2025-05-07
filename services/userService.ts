import { supabase } from '../lib/supabase';
import { User, EmergencyContact, UserSettings, Medication } from '../types/database.types';

// User functions
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data as User;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user:', error);
    return null;
  }
  
  return data as User;
};

// Emergency Contact functions
export const getEmergencyContact = async (): Promise<EmergencyContact | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching emergency contact:', error);
    return null;
  }
  
  return data as EmergencyContact;
};

export const updateEmergencyContact = async (contactData: Partial<EmergencyContact>): Promise<EmergencyContact | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Check if contact exists
  const { data: existingContact } = await supabase
    .from('emergency_contacts')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  let result;
  
  if (existingContact) {
    // Update existing contact
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(contactData)
      .eq('id', existingContact.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating emergency contact:', error);
      return null;
    }
    
    result = data;
  } else {
    // Create new contact
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({ ...contactData, user_id: user.id })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating emergency contact:', error);
      return null;
    }
    
    result = data;
  }
  
  return result as EmergencyContact;
};

// User Settings functions
export const getUserSettings = async (): Promise<UserSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
    return null;
  }
  
  return data as UserSettings;
};

export const updateUserSettings = async (settingsData: Partial<UserSettings>): Promise<UserSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Check if settings exist
  const { data: existingSettings } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  let result;
  
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('user_settings')
      .update(settingsData)
      .eq('id', existingSettings.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
    
    result = data;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ ...settingsData, user_id: user.id })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user settings:', error);
      return null;
    }
    
    result = data;
  }
  
  return result as UserSettings;
};

// Medications functions
export const getMedications = async (): Promise<Medication[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
  
  return data as Medication[];
};

export const addMedication = async (medicationData: Partial<Medication>): Promise<Medication | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('medications')
    .insert({ ...medicationData, user_id: user.id })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding medication:', error);
    return null;
  }
  
  return data as Medication;
};

export const updateMedication = async (id: string, medicationData: Partial<Medication>): Promise<Medication | null> => {
  const { data, error } = await supabase
    .from('medications')
    .update(medicationData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating medication:', error);
    return null;
  }
  
  return data as Medication;
};

export const deleteMedication = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting medication:', error);
    return false;
  }
  
  return true;
};
