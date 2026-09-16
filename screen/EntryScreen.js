import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, tactileShadow } from '../theme';

// UI-only screen for now — no meetings/tasks table exists yet, so Save is
// a no-op. Matches the Stitch "New Entry" mockup. Not wired up to any
// navigator/button yet; that comes once there's somewhere for it to go.

const DURATIONS = ['20m', '45m', '60m', '90m'];
const TAGS = ['Design Review', 'Discovery', 'Monthly Retainer'];

export default function EntryScreen({ navigation }) {
  const [mode, setMode] = useState('meeting'); // 'meeting' | 'task'

  // Meeting fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('45m');
  const [tag, setTag] = useState('Design Review');
  const [meetingDetails, setMeetingDetails] = useState('');
  const [buffer, setBuffer] = useState(15);

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [taskDetails, setTaskDetails] = useState('');

  function handleClose() {
    navigation?.goBack?.();
  }

  function handleSave() {
    // No backend table to save to yet — placeholder only.
    navigation?.goBack?.();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <MaterialCommunityIcons name="close" size={18} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>New Entry</Text>
        <View style={styles.draftPill}>
          <Text style={styles.draftPillText}>Draft</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mode switcher */}
        <View style={styles.switcher}>
          <Pressable
            style={[styles.switchTab, mode === 'meeting' && styles.switchTabActive]}
            onPress={() => setMode('meeting')}
          >
            <MaterialCommunityIcons
              name="calendar-outline"
              size={15}
              color={mode === 'meeting' ? COLORS.white : COLORS.textSecondary}
            />
            <Text style={[styles.switchLabel, mode === 'meeting' && styles.switchLabelActive]}>
              Meeting
            </Text>
          </Pressable>
          <Pressable
            style={[styles.switchTab, mode === 'task' && styles.switchTabActive]}
            onPress={() => setMode('task')}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={15}
              color={mode === 'task' ? COLORS.white : COLORS.textSecondary}
            />
            <Text style={[styles.switchLabel, mode === 'task' && styles.switchLabelActive]}>
              Task
            </Text>
          </Pressable>
        </View>

        {mode === 'meeting' ? (
          <>
            {/* Conflict guard banner */}
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Conflict Guard is active!</Text>
                <Text style={styles.bannerSubtitle}>
                  ClumssyCat alerts you if this overlaps with your buffer window.
                </Text>
              </View>
            </View>

            {/* Client & Contact */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>CLIENT & CONTACT *</Text>

              <Text style={styles.fieldLabel}>Client Name</Text>
              <TextInput
                style={styles.input}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Elena Rostova"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 749-3012"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            {/* Date & Timing */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>DATE & TIMING *</Text>

              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="Thursday, Oct 26, 2026"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Start Time</Text>
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="02:30 PM"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>End Time</Text>
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="03:15 PM"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.chipRow}>
                {DURATIONS.map((d) => {
                  const active = duration === d;
                  return (
                    <Pressable
                      key={d}
                      style={[styles.durationChip, active && styles.durationChipActive]}
                      onPress={() => setDuration(d)}
                    >
                      <Text style={[styles.durationChipText, active && styles.durationChipTextActive]}>
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category & Tag */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>
                CATEGORY & TAG <Text style={styles.optional}>(optional)</Text>
              </Text>
              <View style={styles.chipRow}>
                {TAGS.map((t) => {
                  const active = tag === t;
                  return (
                    <Pressable
                      key={t}
                      style={[styles.tagChip, active && styles.tagChipActive]}
                      onPress={() => setTag(t)}
                    >
                      <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                        {t}
                      </Text>
                      {active && (
                        <MaterialCommunityIcons name="check" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                      )}
                    </Pressable>
                  );
                })}
                <Pressable style={styles.customTagChip}>
                  <Text style={styles.customTagChipText}>+ Custom Tag</Text>
                </Pressable>
              </View>
            </View>

            {/* Additional Details */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>
                ADDITIONAL DETAILS & NOTES <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={meetingDetails}
                onChangeText={setMeetingDetails}
                placeholder="Add agenda items, video link, or reminders like 'Bring latest prototype'…"
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={300}
              />
            </View>

            {/* Buffer Override */}
            <View style={styles.card}>
              <View style={styles.bufferRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bufferTitle}>Buffer Override</Text>
                  <Text style={styles.bufferSubtitle}>
                    Override the default buffer after this meeting
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => setBuffer((b) => Math.max(0, b - 5))}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </Pressable>
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValue}>{buffer}</Text>
                    <Text style={styles.stepperUnit}>min</Text>
                  </View>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => setBuffer((b) => b + 5)}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.bufferHint}>
                Default is set in Settings. Prevents new meetings from booking back-to-back.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Task Title */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Task Title *</Text>
              <TextInput
                style={styles.input}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Send SOW & invoice for Q3 brand assets"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Due Date</Text>
                  <TextInput
                    style={styles.input}
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="Tomorrow, Oct 25"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Due Time</Text>
                  <TextInput
                    style={styles.input}
                    value={dueTime}
                    onChangeText={setDueTime}
                    placeholder="5:00 PM"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>
                Task Details <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={taskDetails}
                onChangeText={setTaskDetails}
                placeholder="Attach signed SOW and PDF invoice…"
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.saveButton, tactileShadow()]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {mode === 'meeting' ? 'Save Meeting' : 'Save Task'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  draftPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  draftPillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: RADIUS.pill,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  switchTabActive: {
    backgroundColor: COLORS.primary,
  },
  switchLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  switchLabelActive: {
    color: COLORS.white,
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
    padding: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  optional: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textTransform: 'none',
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  input: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.chip,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  durationChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  durationChipTextActive: {
    color: COLORS.white,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tagChipActive: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tagChipTextActive: {
    color: COLORS.primary,
  },
  customTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondarySoft,
  },
  customTagChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  bufferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bufferTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  bufferSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSunken,
    borderRadius: RADIUS.pill,
    padding: 4,
    gap: 4,
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  stepperValueBox: {
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: 34,
  },
  stepperValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  stepperUnit: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  bufferHint: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
  },
});
