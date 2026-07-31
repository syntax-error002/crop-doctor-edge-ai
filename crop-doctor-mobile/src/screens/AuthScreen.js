import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    let error = null;

    if (isLogin) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
      if (!error && !data.session) {
        Alert.alert('Please Confirm Email', 'You need to confirm your email address before signing in.');
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
      if (!error) {
        if (!data.session) {
          Alert.alert('Success', 'Check your email for the confirmation link! (Or disable Email Confirmations in your Supabase Dashboard)');
        } else {
           // Successfully signed up and email confirmation was disabled
        }
      }
    }

    setLoading(false);

    if (error) {
      Alert.alert('Authentication Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf" size={48} color="#1a4314" />
        </View>
        <Text style={styles.title}>FloraGuard AI</Text>
        <Text style={styles.subtitle}>Sign in to sync your crop scans</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchButtonText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fbf2', justifyContent: 'center' },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 90, height: 90, backgroundColor: '#eef6e1', borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1a4314' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 10 },
  
  formContainer: { paddingHorizontal: 30 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, marginBottom: 15, height: 60, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  
  authButton: { backgroundColor: '#1a4314', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#1a4314', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  authButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  switchButton: { marginTop: 25, alignItems: 'center' },
  switchButtonText: { color: '#1a4314', fontSize: 15, fontWeight: '600' }
});
