import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CatLogo from '../assets/CatLogo';
import ConfirmDialog from '../components/ConfirmDialog';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS } from '../theme';
import { formatFullDate, formatTime12h, isSameDay, pgDateToDate, pgTimeToTimeObj } from '../utils/dateFormat';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'task', label: 'Tasks' },
  { key: 'completed', label: 'Completed' },
];

// Shown as a second row only while viewing Completed, to narrow it down to
// just completed meetings or just completed tasks.
const COMPLETED_SUB_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'task', label: 'Tasks' },
];

// meetings/tasks row -> the shape the cards below render.
//
// meetings.id and tasks.id are separate identity sequences, both starting
// at 1 — so a meeting and a task can share the same numeric id. Everywhere
// these get merged into one list (React keys, the completed Set, deleting),
// we key off `key` (type-qualified) instead of the raw `id`, which stays
// around only for the actual Supabase calls.
function mapMeeting(row) {
  const start = pgTimeToTimeObj(row.start_time);
  const end = pgTimeToTimeObj(row.end_time);
  return {
    id: row.id,
    key: `meeting-${row.id}`,
    type: 'meeting',
    icon: 'calendar-outline',
    client: row.client_name,
    tag: row.tag,
    time: end ? `${formatTime12h(start)} - ${formatTime12h(end)}` : formatTime12h(start),
    details: row.details || '',
    phone: row.phone,
    completed: row.completed,
    groupDate: row.meeting_date,
  };
}

function mapTask(row) {
  const dueTime = pgTimeToTimeObj(row.due_time);
  return {
    id: row.id,
    key: `task-${row.id}`,
    type: 'task',
    icon: 'checkbox-blank-circle-outline',
    title: row.title,
    due: dueTime ? formatTime12h(dueTime) : row.due_date ? 'No time set' : 'No due date',
    details: row.details || '',
    completed: row.completed,
    groupDate: row.due_date,
  };
}

// Buckets entries by their groupDate into Today / Tomorrow / an actual date
// label / a trailing "No Date" group for entries with nothing set, sorted
// chronologically (No Date always last).
function buildGroups(entries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const buckets = new Map();

  for (const entry of entries) {
    let key = 'no-date';
    let label = 'No Date';
    let sortValue = Infinity;

    if (entry.groupDate) {
      const date = pgDateToDate(entry.groupDate);
      key = entry.groupDate;
      sortValue = date.getTime();
      if (isSameDay(date, today)) label = 'Today';
      else if (isSameDay(date, tomorrow)) label = 'Tomorrow';
      else label = formatFullDate(date);
    }

    if (!buckets.has(key)) buckets.set(key, { key, label, sortValue, entries: [] });
    buckets.get(key).entries.push(entry);
  }

  return Array.from(buckets.values()).sort((a, b) => a.sortValue - b.sortValue);
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filter, setFilter] = useState('all');
  const [completedSubFilter, setCompletedSubFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());

  const loadEntries = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: meetings }, { data: tasks }] = await Promise.all([
      supabase
        .from('meetings')
        .select('id, client_name, phone, meeting_date, start_time, end_time, tag, details, completed')
        .eq('uid', user.id),
      supabase
        .from('tasks')
        .select('id, title, due_date, due_time, details, completed')
        .eq('uid', user.id),
    ]);

    const mapped = [...(meetings ?? []).map(mapMeeting), ...(tasks ?? []).map(mapTask)];
    setEntries(mapped);
    setCompletedIds(new Set(mapped.filter((e) => e.completed).map((e) => e.key)));
  }, []);

  // Refetch every time Home comes back into focus (e.g. after saving a new
  // entry) rather than only once on mount.
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  // entry.type picks the table ('meeting' -> meetings, 'task' -> tasks) —
  // both now have a `completed` boolean column. Optimistic locally, then
  // fire-and-forget the write (RLS already restricts this to the owner's
  // own rows).
  function toggleCompleted(entry) {
    const nowCompleted = !completedIds.has(entry.key);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (nowCompleted) next.add(entry.key);
      else next.delete(entry.key);
      return next;
    });

    const table = entry.type === 'meeting' ? 'meetings' : 'tasks';
    supabase.from(table).update({ completed: nowCompleted }).eq('id', entry.id).then();
  }

  // Works for both meetings and tasks — confirm first since this is
  // permanent. Uses the app's own themed ConfirmDialog instead of the OS
  // Alert, driven by `deleteTarget` (the entry pending confirmation) and
  // `deleteError` (a themed notice if the delete itself fails).
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function handleDeleteEntry(entry) {
    setDeleteTarget(entry);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    const entry = deleteTarget;
    if (!entry) return;
    setDeleteTarget(null);

    const table = entry.type === 'meeting' ? 'meetings' : 'tasks';
    const label = entry.type === 'meeting' ? 'meeting' : 'task';
    const { error } = await supabase.from(table).delete().eq('id', entry.id);
    if (error) {
      setDeleteError(`Could not delete this ${label}: ${error.message}`);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.key !== entry.key));
  }

  const isEntryCompleted = (e) => completedIds.has(e.key);

  // All / Meetings / Tasks only ever show what's NOT completed — a
  // completed entry moves out of those and only shows under Completed.
  const activeEntries = entries.filter((e) => !isEntryCompleted(e));
  const completedEntries = entries.filter(isEntryCompleted);

  let visibleEntries;
  if (filter === 'completed') {
    visibleEntries = completedEntries.filter(
      (e) => completedSubFilter === 'all' || e.type === completedSubFilter
    );
  } else {
    visibleEntries = activeEntries.filter((e) => filter === 'all' || e.type === filter);
  }

  const groups = useMemo(() => buildGroups(visibleEntries), [visibleEntries]);
  const counts = {
    all: activeEntries.length,
    meeting: activeEntries.filter((e) => e.type === 'meeting').length,
    task: activeEntries.filter((e) => e.type === 'task').length,
    completed: completedEntries.length,
  };
  const completedCounts = {
    all: completedEntries.length,
    meeting: completedEntries.filter((e) => e.type === 'meeting').length,
    task: completedEntries.filter((e) => e.type === 'task').length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CatLogo size={28} />
          <Text style={styles.headerTitle}>ClumssyCat</Text>
          <Text style={styles.headerSlash}>/</Text>
          <Text style={styles.headerSchedule}>Schedule</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Filter switcher */}
        <View style={styles.switcher}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.switchTab, active && styles.switchTabActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.switchLabel, active && styles.switchLabelActive]}>
                  {f.label} ({counts[f.key]})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Only shown while viewing Completed — narrows to just completed
            meetings or just completed tasks. */}
        {filter === 'completed' && (
          <View style={styles.subSwitcher}>
            {COMPLETED_SUB_FILTERS.map((f) => {
              const active = completedSubFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[styles.subSwitchTab, active && styles.subSwitchTabActive]}
                  onPress={() => setCompletedSubFilter(f.key)}
                >
                  <Text style={[styles.subSwitchLabel, active && styles.subSwitchLabelActive]}>
                    {f.label} ({completedCounts[f.key]})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {visibleEntries.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>Nothing to show for this filter right now.</Text>
          </View>
        )}

        {groups.map((group) => {
          if (group.entries.length === 0) return null;

          return (
            <View key={group.key} style={styles.group}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupHeaderLeft}>
                  <View style={styles.groupDot} />
                  <Text style={styles.groupLabel}>{group.label}</Text>
                </View>
              </View>

              {group.entries.map((entry) =>
                entry.type === 'meeting' ? (
                  <View key={entry.key} style={[styles.card, completedIds.has(entry.key) && styles.cardDone]}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.iconCircle}>
                        <MaterialCommunityIcons
                          name={completedIds.has(entry.key) ? 'check' : entry.icon}
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.cardTopText}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.cardTitle, completedIds.has(entry.key) && styles.cardTitleDone]}
                          >
                            {entry.client}
                          </Text>
                          {entry.tag && (
                            <View style={styles.tagPill}>
                              <Text style={styles.tagPillText}>{entry.tag}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.timeRow}>
                          <MaterialCommunityIcons name="clock-outline" size={13} color={colors.textSecondary} />
                          <Text style={styles.timeText}>{entry.time}</Text>
                        </View>
                      </View>
                      <Pressable
                        style={[styles.pawCheck, completedIds.has(entry.key) && styles.pawCheckActive]}
                        onPress={() => toggleCompleted(entry)}
                      >
                        <MaterialCommunityIcons
                          name="paw"
                          size={16}
                          color={completedIds.has(entry.key) ? colors.secondary : colors.textMuted}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.detailsText} numberOfLines={1}>
                      {entry.details}
                    </Text>

                    <View style={styles.phoneDeleteRow}>
                      <View style={styles.phoneRow}>
                        <MaterialCommunityIcons name="phone-outline" size={13} color={colors.textSecondary} />
                        <Text style={styles.phoneText}>{entry.phone}</Text>
                      </View>
                      <Pressable style={styles.deleteButton} hitSlop={12} onPress={() => handleDeleteEntry(entry)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View key={entry.key} style={[styles.card, completedIds.has(entry.key) && styles.cardDone]}>
                    <View style={styles.taskRow}>
                      <View style={[styles.iconCircle, styles.iconCircleTask]}>
                        <MaterialCommunityIcons
                          name={completedIds.has(entry.key) ? 'check' : entry.icon}
                          size={18}
                          color={colors.secondary}
                        />
                      </View>
                      <View style={styles.cardTopText}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.cardTitle, completedIds.has(entry.key) && styles.cardTitleDone]}
                          >
                            {entry.title}
                          </Text>
                          <View style={styles.duePill}>
                            <Text style={styles.duePillText}>{entry.due}</Text>
                          </View>
                        </View>
                        <Text style={styles.detailsText} numberOfLines={1}>
                          {entry.details}
                        </Text>
                      </View>
                      <Pressable
                        style={[styles.pawCheck, completedIds.has(entry.key) && styles.pawCheckActive]}
                        onPress={() => toggleCompleted(entry)}
                      >
                        <MaterialCommunityIcons
                          name="paw"
                          size={16}
                          color={completedIds.has(entry.key) ? colors.secondary : colors.textMuted}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.deleteOnlyRow}>
                      <Pressable style={styles.deleteButton} hitSlop={12} onPress={() => handleDeleteEntry(entry)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )
              )}
            </View>
          );
        })}
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'meeting' ? 'Meeting' : 'Task'}`}
        message={
          deleteTarget?.type === 'meeting'
            ? `Remove the meeting with ${deleteTarget?.client}? This can't be undone.`
            : `Remove "${deleteTarget?.title}"? This can't be undone.`
        }
        confirmLabel="Delete"
        destructive
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        visible={!!deleteError}
        title="Couldn't Delete"
        message={deleteError}
        confirmLabel="OK"
        destructive={false}
        onConfirm={() => setDeleteError(null)}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    headerSlash: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    headerSchedule: {
      fontFamily: FONTS.semiBold,
      fontSize: 14,
      color: colors.primary,
    },
    container: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    switcher: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.pill,
      padding: 4,
      marginBottom: 20,
    },
    switchTab: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: RADIUS.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchTabActive: {
      backgroundColor: colors.primary,
    },
    switchLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.textSecondary,
    },
    switchLabelActive: {
      color: colors.white,
    },
    subSwitcher: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.pill,
      padding: 3,
      marginBottom: 20,
    },
    subSwitchTab: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: RADIUS.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subSwitchTabActive: {
      backgroundColor: colors.secondaryContainer,
    },
    subSwitchLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.textSecondary,
    },
    subSwitchLabelActive: {
      color: colors.onSecondaryContainer,
    },
    group: {
      marginBottom: 20,
    },
    groupHeaderRow: {
      marginBottom: 10,
    },
    groupHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    groupDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    groupLabel: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    groupDate: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      gap: 8,
      shadowColor: '#26262B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 1,
    },
    cardDone: {
      opacity: 0.6,
    },
    cardTopRow: {
      flexDirection: 'row',
      gap: 10,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleTask: {
      backgroundColor: colors.secondaryContainer,
    },
    cardTopText: {
      flex: 1,
      gap: 4,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    cardTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    cardTitleDone: {
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    tagPill: {
      backgroundColor: colors.secondaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.pill,
    },
    tagPillText: {
      fontFamily: FONTS.semiBold,
      fontSize: 10,
      color: colors.onSecondaryContainer,
    },
    duePill: {
      backgroundColor: colors.tertiarySoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.pill,
    },
    duePillText: {
      fontFamily: FONTS.semiBold,
      fontSize: 10,
      color: colors.tertiaryText,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
    },
    detailsText: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      paddingLeft: 46,
    },
    phoneDeleteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 46,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    phoneText: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.textSecondary,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    deleteButtonText: {
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.textMuted,
    },
    deleteOnlyRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingLeft: 46,
    },
    pawCheck: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pawCheckActive: {
      backgroundColor: colors.secondaryContainer,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 4,
    },
    emptyTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
      marginTop: 8,
    },
    emptySubtitle: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}
