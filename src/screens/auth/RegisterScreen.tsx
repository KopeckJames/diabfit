import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      setLoading(false);
    } catch (error) {
      console.log('Registration error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Diabetes Type (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Type 1, Type 2, etc."
                value={diabetesType}
                onChangeText={setDiabetesType}
              />
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={!name || !email || !password || !confirmPassword}
              style={styles.button}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: spacing.l,
  },
  headerContainer: {
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.m,
  },
  backButtonText: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    fontSize: typography.fontSizes.medium,
  },
  button: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  loginLink: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold as any,
  },
});

export default RegisterScreen;
