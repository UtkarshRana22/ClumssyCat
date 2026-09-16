import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ConfirmDialog from '../components/ConfirmDialog';
import ConflictWarningModal from '../components/ConflictWarningModal';
import DatePickerModal from '../components/DatePickerModal';
import TimePickerModal from '../components/TimePickerModal';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS, tactileShadow } from '../theme';
import {
  combineDateAndTime,
  dateToPgDate,
  formatFullDate,
  formatTime12h,
  timeObjToPgTime,
} from '../utils/dateFormat';
import { checkMeetingConflicts } from '../utils/meetingConflicts';

// Matches the Stitch "New Entry" mockup. Saves into the real `meetings` /
// `tasks` tables — meeting saves run a client-side conflict check first
// (see utils/meetingConflicts.js) rather than a Postgres RPC.

export default function EntryScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [mode, setMode] = useState('meeting'); // 'meeting' | 'task'

  const [userId, setUserId] = useState(null);
  // The user's Users.default_buffer_minutes — the Buffer Override stepper
  // starts here so it reflects their real default, not a hardcoded guess.
  const [defaultBuffer, setDefaultBuffer] = useState(15);
  // The user's own tag lists, managed from Profile — meeting_custom_tags /
  // tasks_custom_tags on Users.
  const [meetingTags, setMeetingTags] = useState([]);
  const [taskTags, setTaskTags] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data: userRow } = await supabase
        .from('Users')
        .select('default_buffer_minutes, meeting_custom_tags, tasks_custom_tags')
        .eq('uid', user.id)
        .maybeSingle();
      if (userRow?.default_buffer_minutes != null) {
        setDefaultBuffer(userRow.default_buffer_minutes);
        setBuffer(userRow.default_buffer_minutes);
      }
      const fetchedMeetingTags = userRow?.meeting_custom_tags ?? [];
      const fetchedTaskTags = userRow?.tasks_custom_tags ?? [];
      setMeetingTags(fetchedMeetingTags);
      setTaskTags(fetchedTaskTags);
      setTag(fetchedMeetingTags[0] ?? null);
      setTaskTag(fetchedTaskTags[0] ?? null);
    });
  }, []);

  // Meeting fields — date is a Date, times are { hour: 1-12, minute, ampm }
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [tag, setTag] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState('');
  const [buffer, setBuffer] = useState(15);
  // Whether the user actually touched the Buffer Override stepper — if not,
  // we save buffer_override_minutes as null so the meeting keeps following
  // the user's default buffer even if that default changes later.
  const [bufferTouched, setBufferTouched] = useState(false);

  const [saving, setSaving] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState([]);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null);
  const [taskTag, setTaskTag] = useState(null);
  const [taskDetails, setTaskDetails] = useState('');
  // Deadline date/time — separate from Due Date/Time, used later to fire a
  // custom notification (e.g. remind me before the task is actually due).
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);

  // Which picker modal is open, if any: 'date' | 'startTime' | 'endTime' |
  // 'dueDate' | 'dueTime' | 'deadlineDate' | 'deadlineTime' | null
  const [activePicker, setActivePicker] = useState(null);

  // Single themed notice popup, replacing Alert.alert — { title, message }.
  const [notice, setNotice] = useState(null);

  function handleClose() {
    navigation?.goBack?.();
  }

  async function handleSave() {
    if (!userId || saving) return;

    if (mode === 'meeting') {
      if (!clientName.trim() || !phone.trim() || !date || !startTime) {
        setNotice({
          title: 'Missing info',
          message: 'Client name, phone, date, and start time are required.',
        });
        return;
      }

      setSaving(true);
      try {
        const newStart = combineDateAndTime(date, startTime);
        const newEnd = endTime ? combineDateAndTime(date, endTime) : null;

        const conflicts = await checkMeetingConflicts({
          uid: userId,
          newStart,
          newEnd,
          defaultBufferMinutes: defaultBuffer,
          newBufferMinutes: bufferTouched ? buffer : defaultBuffer,
        });

        if (conflicts.length > 0) {
          setPendingConflicts(conflicts);
          setConflictModalVisible(true);
          return;
        }

        await insertMeeting(false);
      } catch (err) {
        setNotice({ title: 'Could not save meeting', message: err?.message ?? 'Something went wrong.' });
      } finally {
        setSaving(false);
      }
    } else {
      if (!taskTitle.trim()) {
        setNotice({ title: 'Missing info', message: 'Task title is required.' });
        return;
      }
      setSaving(true);
      try {
        await insertTask();
      } catch (err) {
        setNotice({ title: 'Could not save task', message: err?.message ?? 'Something went wrong.' });
      } finally {
        setSaving(false);
      }
    }
  }

  async function insertMeeting(clash) {
    const { error } = await supabase.from('meetings').insert({
      uid: userId,
      client_name: clientName.trim(),
      phone: phone.trim(),
      meeting_date: dateToPgDate(date),
      start_time: timeObjToPgTime(startTime),
      end_time: endTime ? timeObjToPgTime(endTime) : null,
      tag: tag || null,
      details: meetingDetails.trim() || null,
      buffer_override_minutes: bufferTouched ? buffer : null,
      clash_chances: clash,
    });

    if (error) {
      setNotice({ title: 'Could not save meeting', message: error.message });
      return;
    }
    navigation?.goBack?.();
  }

  async function insertTask() {
    const { error } = await supabase.from('tasks').insert({
      uid: userId,
      title: taskTitle.trim(),
      due_date: dueDate ? dateToPgDate(dueDate) : null,
      due_time: dueTime ? timeObjToPgTime(dueTime) : null,
      tag: taskTag || null,
      details: taskDetails.trim() || null,
      deadline_date: deadlineDate ? dateToPgDate(deadlineDate) : null,
      deadline_time: deadlineTime ? timeObjToPgTime(deadlineTime) : null,
    });

    if (error) {
      setNotice({ title: 'Could not save task', message: error.message });
      return;
    }
    navigation?.goBack?.();
  }

  function handleConflictCancel() {
    setConflictModalVisible(false);
    setPendingConflicts([]);
  }

  async function handleConflictConfirm() {
    setConflictModalVisible(false);
    setSaving(true);
    try {
      await insertMeeting(true);
    } catch (err) {
      setNotice({ title: 'Could not save meeting', message: err?.message ?? 'Something went wrong.' });
    } finally {
      setSaving(false);
      setPendingConflicts([]);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <MaterialCommunityIcons name="close" size={18} color={colors.textPrimary} />
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
              color={mode === 'meeting' ? colors.white : colors.textSecondary}
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
              color={mode === 'task' ? colors.white : colors.textSecondary}
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
                <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.primary} />
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
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 749-3012"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            {/* Date & Timing */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>DATE & TIMING *</Text>

              <Text style={styles.fieldLabel}>Date</Text>
              <Pressable style={styles.pickerField} onPress={() => setActivePicker('date')}>
                <Text style={[styles.pickerFieldText, !date && styles.pickerFieldPlaceholder]}>
                  {date ? formatFullDate(date) : 'Thursday, Oct 26, 2026'}
                </Text>
                <MaterialCommunityIcons name="calendar-outline" size={16} color={colors.textMuted} />
              </Pressable>

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Start Time</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('startTime')}>
                    <Text style={[styles.pickerFieldText, !startTime && styles.pickerFieldPlaceholder]}>
                      {startTime ? formatTime12h(startTime) : '02:30 PM'}
                    </Text>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>End Time</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('endTime')}>
                    <Text style={[styles.pickerFieldText, !endTime && styles.pickerFieldPlaceholder]}>
                      {endTime ? formatTime12h(endTime) : '03:15 PM'}
                    </Text>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Category & Tag */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>
                CATEGORY & TAG <Text style={styles.optional}>(optional)</Text>
              </Text>
              {meetingTags.length === 0 ? (
                <Text style={styles.noTagsHint}>
                  No tags yet — add some from your Profile to use here.
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  {meetingTags.map((t) => {
                    const active = tag === t;
                    return (
                      <Pressable
                        key={t}
                        style={[styles.tagChip, active && styles.tagChipActive]}
                        onPress={() => setTag(active ? null : t)}
                      >
                        <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                          {t}
                        </Text>
                        {active && (
                          <MaterialCommunityIcons name="check" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
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
                placeholderTextColor={colors.textMuted}
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
                    onPress={() => {
                      setBuffer((b) => Math.max(0, b - 5));
                      setBufferTouched(true);
                    }}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </Pressable>
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValue}>{buffer}</Text>
                    <Text style={styles.stepperUnit}>min</Text>
                  </View>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => {
                      setBuffer((b) => b + 5);
                      setBufferTouched(true);
                    }}
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
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Due Date</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('dueDate')}>
                    <Text style={[styles.pickerFieldText, !dueDate && styles.pickerFieldPlaceholder]}>
                      {dueDate ? formatFullDate(dueDate) : 'Tomorrow, Oct 25'}
                    </Text>
                    <MaterialCommunityIcons name="calendar-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Due Time</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('dueTime')}>
                    <Text style={[styles.pickerFieldText, !dueTime && styles.pickerFieldPlaceholder]}>
                      {dueTime ? formatTime12h(dueTime) : '5:00 PM'}
                    </Text>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.fieldLabel}>
                Tag <Text style={styles.optional}>(optional)</Text>
              </Text>
              {taskTags.length === 0 ? (
                <Text style={styles.noTagsHint}>
                  No tags yet — add some from your Profile to use here.
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  {taskTags.map((t) => {
                    const active = taskTag === t;
                    return (
                      <Pressable
                        key={t}
                        style={[styles.tagChip, active && styles.tagChipActive]}
                        onPress={() => setTaskTag(active ? null : t)}
                      >
                        <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                          {t}
                        </Text>
                        {active && (
                          <MaterialCommunityIcons name="check" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.fieldLabel}>
                Task Details <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={taskDetails}
                onChangeText={setTaskDetails}
                placeholder="Attach signed SOW and PDF invoice…"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            {/* Deadline / Notification */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>
                DEADLINE <Text style={styles.optional}>(optional — for notifications)</Text>
              </Text>
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Deadline Date</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('deadlineDate')}>
                    <Text
                      style={[styles.pickerFieldText, !deadlineDate && styles.pickerFieldPlaceholder]}
                    >
                      {deadlineDate ? formatFullDate(deadlineDate) : 'Same as due date'}
                    </Text>
                    <MaterialCommunityIcons name="calendar-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Deadline Time</Text>
                  <Pressable style={styles.pickerField} onPress={() => setActivePicker('deadlineTime')}>
                    <Text
                      style={[styles.pickerFieldText, !deadlineTime && styles.pickerFieldPlaceholder]}
                    >
                      {deadlineTime ? formatTime12h(deadlineTime) : 'Set a time'}
                    </Text>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.bufferHint}>
                We'll use this to send you a reminder notification.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, tactileShadow(colors.primaryShadow), saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : mode === 'meeting' ? 'Save Meeting' : 'Save Task'}
          </Text>
        </Pressable>
      </View>

      <DatePickerModal
        visible={activePicker === 'date'}
        value={date}
        onClose={() => setActivePicker(null)}
        onSelect={setDate}
      />
      <TimePickerModal
        visible={activePicker === 'startTime'}
        value={startTime}
        onClose={() => setActivePicker(null)}
        onSelect={setStartTime}
      />
      <TimePickerModal
        visible={activePicker === 'endTime'}
        value={endTime}
        onClose={() => setActivePicker(null)}
        onSelect={setEndTime}
      />
      <DatePickerModal
        visible={activePicker === 'dueDate'}
        value={dueDate}
        onClose={() => setActivePicker(null)}
        onSelect={setDueDate}
      />
      <TimePickerModal
        visible={activePicker === 'dueTime'}
        value={dueTime}
        onClose={() => setActivePicker(null)}
        onSelect={setDueTime}
      />
      <DatePickerModal
        visible={activePicker === 'deadlineDate'}
        value={deadlineDate}
        onClose={() => setActivePicker(null)}
        onSelect={setDeadlineDate}
      />
      <TimePickerModal
        visible={activePicker === 'deadlineTime'}
        value={deadlineTime}
        onClose={() => setActivePicker(null)}
        onSelect={setDeadlineTime}
      />

      <ConflictWarningModal
        visible={conflictModalVisible}
        conflicts={pendingConflicts}
        onCancel={handleConflictCancel}
        onConfirm={handleConflictConfirm}
      />

      <ConfirmDialog
        visible={!!notice}
        title={notice?.title}
        message={notice?.message}
        confirmLabel="OK"
        destructive={false}
        onConfirm={() => setNotice(null)}
      />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    draftPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    draftPillText: {
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.textSecondary,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
    },
    switcher: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSunken,
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
      backgroundColor: colors.primary,
    },
    switchLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 13,
      color: colors.textSecondary,
    },
    switchLabelActive: {
      color: colors.white,
    },
    banner: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: colors.primaryTint,
      borderRadius: RADIUS.input,
      borderWidth: 1,
      borderColor: colors.primarySoft,
      padding: 14,
      marginBottom: 16,
    },
    bannerIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.primary,
      marginBottom: 2,
    },
    bannerSubtitle: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 14,
      gap: 8,
    },
    sectionLabel: {
      fontFamily: FONTS.bold,
      fontSize: 11,
      letterSpacing: 0.5,
      color: colors.textMuted,
      marginBottom: 4,
    },
    optional: {
      fontFamily: FONTS.regular,
      color: colors.textMuted,
      textTransform: 'none',
    },
    fieldLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    input: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.input,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    textarea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    pickerField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.input,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pickerFieldText: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },
    pickerFieldPlaceholder: {
      color: colors.textMuted,
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
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: RADIUS.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    tagChipActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    tagChipText: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.textSecondary,
    },
    tagChipTextActive: {
      color: colors.primary,
    },
    noTagsHint: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      fontStyle: 'italic',
      color: colors.textMuted,
    },
    bufferRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bufferTitle: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.textPrimary,
    },
    bufferSubtitle: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
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
    bufferHint: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.textMuted,
    },
    bottomBar: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    cancelButton: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: RADIUS.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontFamily: FONTS.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: RADIUS.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.white,
    },
  });
}
