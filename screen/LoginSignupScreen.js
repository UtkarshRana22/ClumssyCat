import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CatLogo from '../assets/CatLogo';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS, RADIUS, tactileShadow } from '../theme';

export default function LoginSignupScreen({ navigation }) {
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please fill in your email and password.');
      return;
    }
    if (isSignup && !name.trim()) {
      Alert.alert('Missing info', "Please tell us what to call you — we'll use it on your account.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        // The public.Users row (uid / verified / role / name) is created
        // automatically by a DB trigger on auth.users insert, using this
        // `name` metadata — see the on_auth_user_created migration.
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }

      // No home/dashboard screen exists yet, and there's no verified-status
      // routing wired up — every successful signup/login lands on the
      // Gatekeeping screen for now.
      navigation.navigate('Gatekeeping');
    } catch (err) {
      Alert.alert(isSignup ? 'Sign up failed' : 'Log in failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mascot header */}
        <View style={styles.mascotHeader}>
          <View style={styles.mascotBadgeWrap}>
            <View style={styles.mascotCircle}>
              <CatLogo size={56} />
            </View>
            <View style={styles.meowBadge}>
              <Text style={styles.meowSparkle}>✨</Text>
              <Text style={styles.meowText}>Meow!</Text>
            </View>
          </View>
          <Text style={styles.title}>Welcome to ClumssyCat 🐾</Text>
          <Text style={styles.subtitle}>
            Log in to manage your schedule or join to start booking clients effortlessly.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Segmented switcher */}
          <View style={styles.switcher}>
            <Pressable
              style={[styles.switchTab, !isSignup && styles.switchTabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.switchLabel, !isSignup && styles.switchLabelActive]}>Log In</Text>
            </Pressable>
            <Pressable
              style={[styles.switchTab, isSignup && styles.switchTabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.switchLabel, isSignup && styles.switchLabelActive]}>Sign Up</Text>
              {isSignup && <View style={styles.switchPulseDot} />}
            </Pressable>
          </View>

          {isSignup && (
            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Your Full Name</Text>
                <Text style={styles.fieldHint}>What should we call you?</Text>
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="account" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Alex Morgan"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                />
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="at" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="alex@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              {!isSignup && <Text style={styles.forgotLink}>Forgot code?</Text>}
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 36 }]}
              />
              <Pressable style={styles.eyeButton} onPress={() => setShowPassword((s) => !s)}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              tactileShadow(),
              pressed && styles.submitButtonPressed,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitLabel}>
                {isSignup ? 'Create Free Account 🚀' : 'Log In to Schedule 🐾'}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footnote}>
          By continuing, you agree to our <Text style={styles.footnoteLink}>Paw Policy</Text> &amp;{' '}
          <Text style={styles.footnoteLink}>Service Terms</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  mascotHeader: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  mascotBadgeWrap: {
    marginBottom: 12,
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meowBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    ...cardShadow(),
  },
  meowSparkle: { fontSize: 11 },
  meowText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    gap: 20,
    ...cardShadow(),
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: RADIUS.pill,
    padding: 4,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  switchTabActive: {
    backgroundColor: COLORS.primary,
    ...tactileShadow(),
    shadowRadius: 0,
  },
  switchLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  switchLabelActive: {
    color: COLORS.white,
  },
  switchPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  field: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  fieldHint: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  forgotLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: RADIUS.input,
    paddingVertical: 13,
    paddingLeft: 40,
    paddingRight: 16,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    transform: [{ translateY: 2 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
  },
  footnote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  footnoteLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

function cardShadow() {
  return {
    shadowColor: '#26262B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  };
}
