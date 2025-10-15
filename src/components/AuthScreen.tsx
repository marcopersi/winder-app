import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TouchID from 'react-native-touch-id';
import * as Keychain from 'react-native-keychain';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  
  const { signIn, signUp } = useSupabaseAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkBiometricSupport();
    checkStoredCredentials();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      setBiometricSupported(true);
      setBiometricType(biometryType);
    } catch (error) {
      console.log('Biometric authentication not supported:', error);
      setBiometricSupported(false);
    }
  };

  const checkStoredCredentials = async () => {
    try {
      const credentials = await Keychain.getInternetCredentials('winder-app');
      if (credentials && credentials.username) {
        setEmail(credentials.username);
        // Show biometric prompt if supported
        if (biometricSupported) {
          showBiometricPrompt();
        }
      }
    } catch (error) {
      console.log('No stored credentials found:', error);
    }
  };

  const showBiometricPrompt = async () => {
    try {
      const biometricResult = await TouchID.authenticate('Authentifizieren Sie sich mit Face ID', {
        title: 'Winder Login',
        imageColor: '#8B0000',
        imageErrorColor: '#ff0000',
        sensorDescription: 'Touch sensor',
        sensorErrorDescription: 'Failed',
        cancelText: 'Abbrechen',
        fallbackLabel: 'Passwort verwenden',
        unifiedErrors: false,
        passcodeFallback: false,
      });

      if (biometricResult) {
        // Get stored password and auto-login
        const credentials = await Keychain.getInternetCredentials('winder-app');
        if (credentials && credentials.password) {
          setLoading(true);
          try {
            await signIn(credentials.username, credentials.password);
            onAuthSuccess?.();
          } catch (authError) {
            console.error('Auto-login failed:', authError);
            Alert.alert('Fehler', 'Automatischer Login fehlgeschlagen');
          } finally {
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.log('Biometric authentication failed:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Fehler', 'Passwörter stimmen nicht überein');
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        
        // Store credentials for biometric login
        if (biometricSupported) {
          await Keychain.setInternetCredentials('winder-app', email, password);
        }
        
        onAuthSuccess?.();
      } else {
        await signUp(email, password);
        Alert.alert(
          'Registrierung erfolgreich',
          'Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink.',
          [{ text: 'OK', onPress: () => setIsLogin(true) }]
        );
      }
    } catch (error: any) {
      let errorMessage = 'Ein Fehler ist aufgetreten';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Ungültige Anmeldedaten';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Benutzer bereits registriert';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'E-Mail noch nicht bestätigt';
      }
      
      Alert.alert('Fehler', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      Alert.alert('Fehler', 'Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: 'com.winderapp://auth/callback',
        }
      });

      if (error) throw error;

      Alert.alert(
        'Magic Link gesendet',
        'Überprüfen Sie Ihre E-Mail für den Login-Link'
      );
    } catch (error: any) {
      Alert.alert('Fehler', error.message || 'Magic Link konnte nicht gesendet werden');
    } finally {
      setLoading(false);
    }
  };

  const getBiometricButtonText = () => {
    switch (biometricType) {
      case 'FaceID':
        return '🪪 Mit Face ID anmelden';
      case 'TouchID':
        return '👆 Mit Touch ID anmelden';
      default:
        return '🔐 Mit Biometrie anmelden';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🍷</Text>
          <Text style={styles.title}>Winder</Text>
          <Text style={styles.subtitle}>
            Entdecken Sie Ihre perfekten Weine
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                Anmelden
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                Registrieren
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E-Mail-Adresse"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Passwort"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'Anmelden' : 'Registrieren'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={sendMagicLink}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>
                  🔗 Magic Link senden
                </Text>
              </TouchableOpacity>

              {!!(biometricSupported && email) && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={showBiometricPrompt}
                  disabled={loading}
                >
                  <Text style={styles.biometricButtonText}>
                    {getBiometricButtonText()}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin 
              ? 'Noch kein Konto? ' 
              : 'Bereits ein Konto? '
            }
            <Text 
              style={styles.linkText}
              onPress={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Registrieren' : 'Anmelden'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#8B0000',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafbfc',
  },
  primaryButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: '500',
  },
  biometricButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  linkText: {
    color: '#8B0000',
    fontWeight: '500',
  },
});