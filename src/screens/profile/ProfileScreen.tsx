import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import Button from '../../components/Button';
import { achievements } from '../../utils/mockData';
import { useAuth } from '../../hooks/useAuth';

// Define types for our profile data
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  diabetesType: string;
  diagnosisYear: number;
  a1c: number;
  targetGlucoseRange: {
    min: number;
    max: number;
  };
  medications: Medication[];
  emergencyContact: EmergencyContact;
}

const ProfileScreen: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadUserProfile = () => {
      if (!user) return;

      try {
        setLoading(true);

        console.log("Current user:", user); // Log the user object to see its structure

        // Create a default profile with the user's information
        const defaultProfile = {
          id: user.id,
          name: user.name || 'User', // This will use the actual user name from auth context
          email: user.email || '',
          age: 35,
          weight: 170,
          height: 68,
          diabetesType: 'Type 2',
          diagnosisYear: new Date().getFullYear() - 1,
          a1c: 7.0,
          targetGlucoseRange: { min: 80, max: 140 },
          medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
            { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily' },
          ],
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Relation',
            phone: '555-123-4567',
          }
        };

        setProfileData(defaultProfile);
      } catch (error) {
        console.error('Error in loadUserProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  // Show loading indicator while fetching profile data
  if (loading || !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImagePlaceholder}>
              {profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profileData.name || 'User'}</Text>
          <Text style={styles.profileInfo}>
            {profileData.diabetesType || 'Type not set'} •
            Diagnosed {profileData.diagnosisYear || 'Year not set'}
          </Text>
          <Button
            title="Edit Profile"
            variant="outline"
            size="small"
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available in the next update.')}
            style={styles.editButton}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Information</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{profileData.age || 'Not set'} {profileData.age ? 'years' : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{profileData.weight || 'Not set'} {profileData.weight ? 'lbs' : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>
              {profileData.height ? `${Math.floor(profileData.height / 12)}'${profileData.height % 12}"` : 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latest A1C</Text>
            <Text style={styles.infoValue}>{profileData.a1c || 'Not set'}{profileData.a1c ? '%' : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Glucose Range</Text>
            <Text style={styles.infoValue}>
              {profileData.targetGlucoseRange ?
                `${profileData.targetGlucoseRange.min}-${profileData.targetGlucoseRange.max} mg/dL` :
                'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
        </View>

        <View style={styles.medicationsCard}>
          {profileData.medications && profileData.medications.length > 0 ? (
            profileData.medications.map((medication: Medication, index: number) => (
              <View key={index} style={styles.medicationItem}>
                <View style={styles.medicationIcon}>
                  <Ionicons name="medical-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDetails}>
                    {medication.dosage} • {medication.frequency}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No medications added yet</Text>
          )}
          <TouchableOpacity style={styles.addMedicationButton}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addMedicationText}>Add Medication</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsContainer}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementIconContainer}>
                <Ionicons name={achievement.icon as any} size={30} color={colors.primary} />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDate}>{achievement.date}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Share Data with Doctor</Text>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        <View style={styles.emergencyContactCard}>
          <Text style={styles.emergencyContactTitle}>Emergency Contact</Text>
          {profileData.emergencyContact ? (
            <View style={styles.emergencyContactInfo}>
              <Text style={styles.emergencyContactName}>
                {profileData.emergencyContact.name || 'No name set'}
              </Text>
              <Text style={styles.emergencyContactRelation}>
                {profileData.emergencyContact.relationship || 'No relationship set'}
              </Text>
              <Text style={styles.emergencyContactPhone}>
                {profileData.emergencyContact.phone || 'No phone number set'}
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No emergency contact added yet</Text>
          )}
          <TouchableOpacity style={styles.editEmergencyContact}>
            <Text style={styles.editEmergencyContactText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Logout"
          variant="outline"
          icon="log-out-outline"
          onPress={confirmLogout}
          style={styles.logoutButton}
        />

        <Text style={styles.versionText}>DiabFit v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.large,
    color: colors.text,
  },
  noDataText: {
    fontSize: typography.fontSizes.medium,
    color: colors.disabled,
    textAlign: 'center',
    padding: spacing.m,
  },
  scrollView: {
    padding: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    fontSize: typography.fontSizes.xxlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  settingsButton: {
    padding: spacing.s,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  profileImagePlaceholder: {
    fontSize: 36,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.background,
  },
  profileName: {
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileInfo: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.m,
  },
  editButton: {
    width: 120,
  },
  sectionHeader: {
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  infoLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  infoValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.primary,
  },
  medicationsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  medicationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.text,
  },
  medicationDetails: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  addMedicationText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  achievementsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  achievementCard: {
    width: 120,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginRight: spacing.m,
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  achievementTitle: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDate: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  settingLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  emergencyContactCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginTop: spacing.l,
    marginBottom: spacing.l,
  },
  emergencyContactTitle: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.s,
  },
  emergencyContactInfo: {
    marginBottom: spacing.s,
  },
  emergencyContactName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.text,
  },
  emergencyContactRelation: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
  },
  emergencyContactPhone: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  editEmergencyContact: {
    alignSelf: 'flex-end',
  },
  editEmergencyContactText: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  logoutButton: {
    marginBottom: spacing.l,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.small,
    color: colors.disabled,
    marginBottom: spacing.l,
  },
});

export default ProfileScreen;
