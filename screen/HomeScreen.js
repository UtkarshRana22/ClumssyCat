import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CatLogo from '../assets/CatLogo';
import { COLORS, FONTS, RADIUS } from '../theme';

// Dummy placeholder data only — there's no meetings/tasks table wired up
// yet, this is just the screen UI per the Stitch design.
const ENTRIES = [
  {
    id: 'm1',
    type: 'meeting',
    day: 'today',
    icon: 'video-outline',
    client: 'Sarah Jenkins',
    tag: 'Design Review',
    time: '10:30 AM – 11:15 AM (45m)',
    phone: '+1 (555) 234-8901',
    details: 'Reviewing mobile onboarding screens, feline mascot variants, & client feedback notes.',
  },
  {
    id: 't1',
    type: 'task',
    day: 'today',
    icon: 'clipboard-text-outline',
    title: 'Send invoice for Q3 brand assets',
    due: 'Due 5:00 PM',
    details: 'Attach signed SOW and PDF breakdown to Acme Corp email thread.',
    completed: false,
  },
  {
    id: 'm2',
    type: 'meeting',
    day: 'today',
    icon: 'account-group-outline',
    client: 'Marcus Chen',
    tag: 'Fintech Studio',
    time: '02:00 PM – 02:30 PM (30m)',
    phone: '+1 (555) 876-5432',
    details: 'Discovery chat regarding monthly retainer, roadmap allocation, and team availability.',
  },
  {
    id: 't2',
    type: 'task',
    day: 'tomorrow',
    icon: 'note-edit-outline',
    title: 'Prepare discovery questionnaire',
    due: 'Tomorrow 11:00 AM',
    details: 'Tailor questionnaire questions for fintech client stakeholders and scope.',
    completed: false,
  },
  {
    id: 't3',
    type: 'task',
    day: 'tomorrow',
    icon: 'note-edit-outline',
    title: 'Sync Google Calendar credentials',
    due: 'Done 9:15 AM',
    details: 'Refreshed OAuth token for seamless slot synchronizations.',
    completed: true,
  },
];

const GROUPS = [
  { key: 'today', label: 'Today', date: 'Oct 24' },
  { key: 'tomorrow', label: 'Tomorrow', date: 'Oct 25' },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'task', label: 'Tasks' },
];

export default function HomeScreen() {
  const [filter, setFilter] = useState('all');
  const [completedIds, setCompletedIds] = useState(() =>
    new Set(ENTRIES.filter((e) => e.completed).map((e) => e.id))
  );

  function toggleCompleted(id) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleEntries = ENTRIES.filter((e) => filter === 'all' || e.type === filter);
  const counts = {
    all: ENTRIES.length,
    meeting: ENTRIES.filter((e) => e.type === 'meeting').length,
    task: ENTRIES.filter((e) => e.type === 'task').length,
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

        {visibleEntries.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw" size={28} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>Nothing to show for this filter right now.</Text>
          </View>
        )}

        {GROUPS.map((group) => {
          const groupEntries = visibleEntries.filter((e) => e.day === group.key);
          if (groupEntries.length === 0) return null;

          return (
            <View key={group.key} style={styles.group}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupHeaderLeft}>
                  <View style={styles.groupDot} />
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  <Text style={styles.groupDate}>• {group.date}</Text>
                </View>
              </View>

              {groupEntries.map((entry) =>
                entry.type === 'meeting' ? (
                  <View key={entry.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name={entry.icon} size={18} color={COLORS.primary} />
                      </View>
                      <View style={styles.cardTopText}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle}>{entry.client}</Text>
                          {entry.tag && (
                            <View style={styles.tagPill}>
                              <Text style={styles.tagPillText}>{entry.tag}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.timeRow}>
                          <MaterialCommunityIcons name="clock-outline" size={13} color={COLORS.textSecondary} />
                          <Text style={styles.timeText}>{entry.time}</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.detailsText} numberOfLines={1}>
                      {entry.details}
                    </Text>

                    <View style={styles.phoneRow}>
                      <MaterialCommunityIcons name="phone-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.phoneText}>{entry.phone}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={entry.id} style={[styles.card, completedIds.has(entry.id) && styles.cardDone]}>
                    <View style={styles.taskRow}>
                      <View style={[styles.iconCircle, styles.iconCircleTask]}>
                        <MaterialCommunityIcons
                          name={completedIds.has(entry.id) ? 'check' : entry.icon}
                          size={18}
                          color={COLORS.secondary}
                        />
                      </View>
                      <View style={styles.cardTopText}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.cardTitle, completedIds.has(entry.id) && styles.cardTitleDone]}
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
                        style={[styles.pawCheck, completedIds.has(entry.id) && styles.pawCheckActive]}
                        onPress={() => toggleCompleted(entry.id)}
                      >
                        <MaterialCommunityIcons
                          name="paw"
                          size={16}
                          color={completedIds.has(entry.id) ? COLORS.secondary : COLORS.textMuted}
                        />
                      </Pressable>
                    </View>
                  </View>
                )
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
  },
  headerSlash: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  headerSchedule: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSunken,
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
    backgroundColor: COLORS.primary,
  },
  switchLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  switchLabelActive: {
    color: COLORS.white,
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
    backgroundColor: COLORS.primary,
  },
  groupLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  groupDate: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleTask: {
    backgroundColor: '#E5DEFF',
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
    color: COLORS.textPrimary,
  },
  cardTitleDone: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  tagPill: {
    backgroundColor: '#E5DEFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  tagPillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: '#442cb1',
  },
  duePill: {
    backgroundColor: COLORS.tertiarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  duePillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.tertiaryText,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailsText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingLeft: 46,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 46,
  },
  phoneText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pawCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawCheckActive: {
    backgroundColor: '#E5DEFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
