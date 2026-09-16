import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CatLogo from '../assets/CatLogo';
import OnboardingMascot from '../assets/OnboardingMascot';
import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS, tactileShadow } from '../theme';

function getBadges(colors) {
  return [
    { icon: 'shield-check', label: 'Conflict Guard', sub: 'Zero overlaps', tint: colors.primarySoft, iconColor: colors.primary },
    { icon: 'lightning-bolt', label: '1-Click Booking', sub: 'Instant sharing', tint: colors.secondaryContainer, iconColor: colors.secondary },
    { icon: 'clock-outline', label: 'Timezone Auto', sub: 'Synced global', tint: colors.tertiarySoft, iconColor: colors.tertiaryText },
  ];
}

export default function OnboardingScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BADGES = useMemo(() => getBadges(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand pill */}
        <View style={styles.brandRow}>
          <View style={styles.brandPill}>
            <CatLogo size={22} />
            <Text style={styles.brandName}>ClumssyCat</Text>
            <View style={styles.dot} />
            <Text style={styles.brandTag}>Never double-book again ✨</Text>
          </View>
        </View>

        {/* Hero mascot */}
        <View style={styles.heroWrap}>
          <OnboardingMascot width={280} />
          <View style={styles.floatingBadge}>
            <View style={styles.floatingDot} />
            <Text style={styles.floatingBadgeText}>100% Conflict-free!</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineWrap}>
          <Text style={styles.headline}>
            Purr-fect scheduling,{'\n'}
            <Text style={styles.headlineAccent}>zero clumsy clashes.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Keep all client calls, coffee syncs, and kickoff meetings neatly aligned in one cozy
            spot. We handle time zones so you never double-book.
          </Text>
        </View>

        {/* Trust badges */}
        <View style={styles.badgeRow}>
          {BADGES.map((b) => (
            <View key={b.label} style={styles.badgeCard}>
              <View style={[styles.badgeIconWrap, { backgroundColor: b.tint }]}>
                <MaterialCommunityIcons name={b.icon} size={16} color={b.iconColor} />
              </View>
              <Text style={styles.badgeLabel}>{b.label}</Text>
              <Text style={styles.badgeSub}>{b.sub}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              tactileShadow(colors.primaryShadow),
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={() => navigation.navigate('Login / Signup')}
          >
            <MaterialCommunityIcons name="paw" size={20} color={colors.white} />
            <Text style={styles.ctaLabel}>Get Started Free</Text>
            <Text style={styles.ctaSparkle}>✨</Text>
          </Pressable>

          <Pressable
            style={styles.loginRow}
            onPress={() => navigation.navigate('Login / Signup')}
          >
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Text style={styles.loginLink}>Log In</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="paw" size={12} color={colors.primary} style={{ transform: [{ rotate: '-20deg' }] }} />
          <Text style={styles.footerText}>CALM &amp; COZY SCHEDULING</Text>
          <MaterialCommunityIcons name="paw" size={12} color={colors.primary} style={{ transform: [{ rotate: '15deg' }] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      alignItems: 'center',
    },
    brandRow: {
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 20,
    },
    brandPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surfaceSunken,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: RADIUS.pill,
    },
    brandName: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.textPrimary,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.primarySoft,
    },
    brandTag: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      color: colors.primary,
    },
    heroWrap: {
      alignItems: 'center',
      marginBottom: 16,
    },
    floatingBadge: {
      position: 'absolute',
      bottom: -6,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.pill,
      ...softShadowLike(),
    },
    floatingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    floatingBadgeText: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      color: colors.textPrimary,
    },
    headlineWrap: {
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    headline: {
      fontFamily: FONTS.bold,
      fontSize: 26,
      lineHeight: 34,
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    headlineAccent: {
      color: colors.primary,
    },
    subtitle: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
      maxWidth: 340,
    },
    badgeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 28,
      width: '100%',
    },
    badgeCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 6,
      ...softShadowLike(),
    },
    badgeIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    badgeLabel: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    badgeSub: {
      fontFamily: FONTS.regular,
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    ctaWrap: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: RADIUS.pill,
    },
    ctaButtonPressed: {
      transform: [{ translateY: 3 }],
      shadowOffset: { width: 0, height: 1 },
    },
    ctaLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 15,
      color: colors.white,
      letterSpacing: 0.2,
    },
    ctaSparkle: {
      fontSize: 14,
    },
    loginRow: {
      flexDirection: 'row',
      paddingVertical: 6,
    },
    loginPrompt: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
    },
    loginLink: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.secondaryText,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      opacity: 0.4,
    },
    footerText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      letterSpacing: 1.2,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
  });
}

function softShadowLike() {
  return {
    shadowColor: '#26262B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };
}
