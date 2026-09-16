import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AwaitingApprovalMascot from '../assets/AwaitingApprovalMascot';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS, RADIUS } from '../theme';

const STEPS = [
  { key: 'account', icon: 'check', label: 'Account Created', sub: 'Profile credentials recorded', status: 'done' },
  { key: 'verification', icon: 'timer-sand', label: 'Freelancer Verification', sub: 'Currently in review queue', status: 'review' },
];

const PERKS = [
  'Conflict-free calendar synchronization with Google & Apple.',
  'Your custom, adorable link ',
  'Automated, ultra-polite SMS and email appointment reminders.',
];

// Shown to a logged-in user whose account is not yet verified
// (Users.verified === false). Subscribes to realtime updates on this
// user's Users row and jumps to Home the moment `verified` flips to true
// (e.g. someone flips it in the Supabase dashboard) — no need to relaunch
// the app or manually refresh.
export default function GatekeepingScreen({ navigation }) {
  const [notifyOn, setNotifyOn] = useState(false);

  useEffect(() => {
    let channel;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel(`users-verified-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'Users', filter: `uid=eq.${user.id}` },
          (payload) => {
            if (payload.new?.verified) {
              navigation.replace('Home');
            }
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.reviewPill}>
          <View style={styles.reviewDot} />
          <Text style={styles.reviewPillText}>APPLICATION UNDER REVIEW</Text>
        </View>

        <AwaitingApprovalMascot width={260} />

        <Text style={styles.title}>Our cats are reviewing your profile ☕</Text>
        <Text style={styles.subtitle}>
          To protect freelancer schedules and prevent spam client invites, our team hand-checks
          every new account. It usually takes under 2 hours!
        </Text>

        {/* Onboarding status card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="paw" size={18} color={COLORS.secondary} />
              <Text style={styles.cardHeaderTitle}>Onboarding Status</Text>
            </View>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>Step 2 of 2</Text>
            </View>
          </View>

          {STEPS.map((step) => (
            <View
              key={step.key}
              style={[styles.stepRow, step.status === 'review' && styles.stepRowActive, step.status === 'queued' && styles.stepRowQueued]}
            >
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepIconCircle,
                    step.status === 'review' && { backgroundColor: COLORS.tertiary },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={16}
                    color={step.status === 'review' ? '#4E3E00' : step.status === 'queued' ? COLORS.textMuted : COLORS.secondary}
                  />
                </View>
                <View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={[styles.stepSub, step.status === 'review' && { color: COLORS.tertiaryText }]}>
                    {step.sub}
                  </Text>
                </View>
              </View>

              {step.status === 'done' && (
                <View style={styles.statusPillDone}>
                  <View style={styles.statusDotSecondary} />
                  <Text style={styles.statusPillDoneText}>Done</Text>
                </View>
              )}
              {step.status === 'review' && (
                <View style={styles.statusPillReview}>
                  <View style={styles.statusDotTertiary} />
                  <Text style={styles.statusPillReviewText}>In Review</Text>
                </View>
              )}
              {step.status === 'queued' && <Text style={styles.statusQueuedText}>Queued</Text>}
            </View>
          ))}
        </View>

        {/* Unlocked once approved */}
        <View style={styles.perksCard}>
          <View style={styles.perksHeaderRow}>
            <MaterialCommunityIcons name="auto-fix" size={18} color={COLORS.primary} />
            <Text style={styles.perksHeaderTitle}>Unlocked once approved:</Text>
          </View>
          {PERKS.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <MaterialCommunityIcons name="paw" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.notifyButton, notifyOn && styles.notifyButtonActive]}
          onPress={() => setNotifyOn((s) => !s)}
        >
          <MaterialCommunityIcons
            name={notifyOn ? 'check-circle' : 'bell-ring-outline'}
            size={18}
            color={notifyOn ? COLORS.textSecondary : '#442cb1'}
          />
          <Text style={[styles.notifyLabel, notifyOn && { color: COLORS.textSecondary }]}>
            {notifyOn ? 'Notifications Active ✓' : 'Turn On Push Notifications 🔔'}
          </Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Pressable style={styles.bottomLinkLeft}>
            <MaterialCommunityIcons name="chat-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.bottomLinkText}>Need quick help? Ping Support</Text>
          </Pressable>
          <Pressable onPress={() => supabase.auth.signOut()}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
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
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E5DEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginBottom: 16,
  },
  reviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  reviewPillText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#442cb1',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  stepPill: {
    backgroundColor: COLORS.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  stepPillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepRowActive: {
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: 16,
    padding: 8,
  },
  stepRowQueued: {
    opacity: 0.5,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  stepIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  stepSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusPillDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  statusDotSecondary: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  statusPillDoneText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.secondary,
  },
  statusPillReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  statusDotTertiary: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B45309',
  },
  statusPillReviewText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: '#4E3E00',
  },
  statusQueuedText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  perksCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  perksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  perksHeaderTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  perkText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  notifyButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E5DEFF',
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    marginBottom: 12,
  },
  notifyButtonActive: {
    backgroundColor: COLORS.surfaceSunken,
  },
  notifyLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#442cb1',
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomLinkText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
