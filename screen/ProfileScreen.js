import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS } from '../theme';

// Only verified users ever reach this screen (it's behind the Gatekeeping
// gate), so the "Verified" badge is always shown — no need to check
// Users.verified again here.
export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);

  // Default Buffer is the real global fallback the per-meeting Buffer
  // Override on the Entry screen defaults from — persisted on
  // Users.default_buffer_minutes. Notifications has nothing to persist to
  // yet, so it stays local-only for now.
  const [buffer, setBuffer] = useState(15);
  const [notifyOn, setNotifyOn] = useState(true);

  // Custom tags — meeting_custom_tags / tasks_custom_tags on Users, both
  // seeded with funky defaults at account creation. Picked from when
  // creating a meeting or task on the Entry screen.
  const [meetingTags, setMeetingTags] = useState([]);
  const [taskTags, setTaskTags] = useState([]);
  const [newMeetingTag, setNewMeetingTag] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? '');
      setName(user.user_metadata?.name ?? '');
      setUserId(user.id);

      const { data: userRow } = await supabase
        .from('Users')
        .select('default_buffer_minutes, meeting_custom_tags, tasks_custom_tags')
        .eq('uid', user.id)
        .maybeSingle();
      if (userRow?.default_buffer_minutes != null) {
        setBuffer(userRow.default_buffer_minutes);
      }
      setMeetingTags(userRow?.meeting_custom_tags ?? []);
      setTaskTags(userRow?.tasks_custom_tags ?? []);
    });
  }, []);

  function updateBuffer(next) {
    setBuffer(next);
    if (!userId) return;
    // Fire-and-forget — the column-level grant only allows this one
    // column to be updated, so this can't touch verified/role.
    supabase.from('Users').update({ default_buffer_minutes: next }).eq('uid', userId).then();
  }

  function addMeetingTag() {
    const tag = newMeetingTag.trim();
    if (!tag || meetingTags.includes(tag)) return;
    const next = [...meetingTags, tag];
    setMeetingTags(next);
    setNewMeetingTag('');
    if (!userId) return;
    supabase.from('Users').update({ meeting_custom_tags: next }).eq('uid', userId).then();
  }

  function removeMeetingTag(tag) {
    const next = meetingTags.filter((t) => t !== tag);
    setMeetingTags(next);
    if (!userId) return;
    supabase.from('Users').update({ meeting_custom_tags: next }).eq('uid', userId).then();
  }

  function addTaskTag() {
    const tag = newTaskTag.trim();
    if (!tag || taskTags.includes(tag)) return;
    const next = [...taskTags, tag];
    setTaskTags(next);
    setNewTaskTag('');
    if (!userId) return;
    supabase.from('Users').update({ tasks_custom_tags: next }).eq('uid', userId).then();
  }

  function removeTaskTag(tag) {
    const next = taskTags.filter((t) => t !== tag);
    setTaskTags(next);
    if (!userId) return;
    supabase.from('Users').update({ tasks_custom_tags: next }).eq('uid', userId).then();
  }

  function handleLogOut() {
    supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="paw" size={30} color={colors.white} />
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name || 'ClumssyCat User'}</Text>
            <View style={styles.verifiedPill}>
              <MaterialCommunityIcons name="check" size={12} color={colors.white} />
              <Text style={styles.verifiedPillText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Scheduling defaults */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SCHEDULING DEFAULTS</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Default Buffer</Text>
              <Text style={styles.settingSubtitle}>
                Applied after every new meeting unless overridden
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => updateBuffer(Math.max(0, buffer - 5))}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <View style={styles.stepperValueBox}>
                <Text style={styles.stepperValue}>{buffer}</Text>
                <Text style={styles.stepperUnit}>min</Text>
              </View>
              <Pressable style={styles.stepperButton} onPress={() => updateBuffer(buffer + 5)}>
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Reminders for upcoming meetings and tasks
              </Text>
            </View>
            <Pressable
              style={[styles.toggle, notifyOn && styles.toggleOn]}
              onPress={() => setNotifyOn((v) => !v)}
            >
              <View style={[styles.toggleKnob, notifyOn && styles.toggleKnobOn]} />
            </Pressable>
          </View>
        </View>

        {/* Custom Tags */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>MEETING TAGS</Text>
          <View style={styles.tagWrap}>
            {meetingTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
                <Pressable onPress={() => removeMeetingTag(tag)} hitSlop={8}>
                  <MaterialCommunityIcons name="close" size={13} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
          <View style={styles.addTagRow}>
            <TextInput
              style={styles.addTagInput}
              value={newMeetingTag}
              onChangeText={setNewMeetingTag}
              placeholder="Add a meeting tag…"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addMeetingTag}
              returnKeyType="done"
            />
            <Pressable style={styles.addTagButton} onPress={addMeetingTag}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>TASK TAGS</Text>
          <View style={styles.tagWrap}>
            {taskTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
                <Pressable onPress={() => removeTaskTag(tag)} hitSlop={8}>
                  <MaterialCommunityIcons name="close" size={13} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
          <View style={styles.addTagRow}>
            <TextInput
              style={styles.addTagInput}
              value={newTaskTag}
              onChangeText={setNewTaskTag}
              placeholder="Add a task tag…"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addTaskTag}
              returnKeyType="done"
            />
            <Pressable style={styles.addTagButton} onPress={addTaskTag}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingIconCircle}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={16}
                color={colors.secondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Dark Theme</Text>
              <Text style={styles.settingSubtitle}>
                {isDark ? 'Easier on the eyes at night' : 'Bright and cozy, the classic look'}
              </Text>
            </View>
            <Pressable
              style={[styles.toggle, isDark && styles.toggleOn]}
              onPress={toggleTheme}
            >
              <View style={[styles.toggleKnob, isDark && styles.toggleKnobOn]} />
            </Pressable>
          </View>
        </View>

        {/* Tip banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipEmoji}>🐱</Text>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Clumssy tip: </Text>
            Buffers automatically stop back-to-back client fatigue so you always have time
            for coffee!
          </Text>
        </View>

        {/* Log out */}
        <Pressable style={styles.logOutButton} onPress={handleLogOut}>
          <MaterialCommunityIcons name="logout" size={16} color={colors.primary} />
          <Text style={styles.logOutText}>Log Out</Text>
        </Pressable>
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
    topBar: {
      alignItems: 'center',
      paddingVertical: 14,
    },
    topBarTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    container: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 16,
    },
    avatarWrap: {
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    name: {
      fontFamily: FONTS.extraBold,
      fontSize: 19,
      color: colors.textPrimary,
    },
    verifiedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.primary,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: RADIUS.pill,
    },
    verifiedPillText: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      color: colors.white,
    },
    email: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    sectionLabel: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      letterSpacing: 0.5,
      color: colors.textMuted,
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 6,
    },
    settingIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    settingSubtitle: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.pill,
      padding: 4,
      gap: 4,
    },
    stepperButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    stepperValueBox: {
      alignItems: 'center',
      paddingHorizontal: 4,
      minWidth: 34,
    },
    stepperValue: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    stepperUnit: {
      fontFamily: FONTS.regular,
      fontSize: 9,
      color: colors.textMuted,
    },
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.secondaryContainer,
    },
    tagChipText: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.onSecondaryContainer,
    },
    addTagRow: {
      flexDirection: 'row',
      gap: 8,
    },
    addTagInput: {
      flex: 1,
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.input,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    addTagButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggle: {
      width: 46,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.surfaceSunken,
      padding: 3,
      justifyContent: 'center',
    },
    toggleOn: {
      backgroundColor: colors.primary,
    },
    toggleKnob: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.white,
    },
    toggleKnobOn: {
      transform: [{ translateX: 20 }],
    },
    tipBanner: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: colors.tertiarySoft,
      borderRadius: RADIUS.input,
      padding: 14,
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    tipEmoji: {
      fontSize: 16,
    },
    tipText: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    tipBold: {
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
    },
    logOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.pill,
      paddingVertical: 14,
    },
    logOutText: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.primary,
    },
  });
}
