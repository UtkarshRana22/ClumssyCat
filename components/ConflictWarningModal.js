import { useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS, tactileShadow } from '../theme';
import { formatFullDate, formatTime12h, pgDateToDate, pgTimeToTimeObj } from '../utils/dateFormat';

// Shown when a new meeting overlaps or falls inside the buffer window of an
// existing (non-completed) meeting. Styled to match DatePickerModal /
// TimePickerModal instead of a plain OS Alert.
export default function ConflictWarningModal({ visible, conflicts, onCancel, onConfirm }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="alert-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.title}>Scheduling Conflict</Text>
          <Text style={styles.subtitle}>
            This meeting clashes with {conflicts?.length === 1 ? 'an existing meeting' : `${conflicts?.length ?? 0} existing meetings`}:
          </Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {(conflicts ?? []).map(({ meeting, reason }) => {
              const date = pgDateToDate(meeting.meeting_date);
              const start = pgTimeToTimeObj(meeting.start_time);
              return (
                <View key={meeting.id} style={styles.conflictRow}>
                  <Text style={styles.conflictClient}>{meeting.client_name}</Text>
                  <Text style={styles.conflictWhen}>
                    {formatFullDate(date)} · {formatTime12h(start)}
                  </Text>
                  <Text style={styles.conflictReason}>
                    {reason === 'overlap'
                      ? 'Directly overlaps this meeting'
                      : 'Falls inside its buffer window'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.hint}>You can still create it anyway if this is intentional.</Text>

          <View style={styles.footerRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, tactileShadow(colors.primaryShadow)]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Create Anyway</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      maxHeight: '80%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
    },
    iconCircle: {
      alignSelf: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    title: {
      fontFamily: FONTS.extraBold,
      fontSize: 16,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 12,
    },
    list: {
      maxHeight: 200,
      marginBottom: 8,
    },
    conflictRow: {
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.input,
      padding: 12,
      marginBottom: 8,
    },
    conflictClient: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.textPrimary,
    },
    conflictWhen: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    conflictReason: {
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.primary,
      marginTop: 4,
    },
    hint: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 16,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 13,
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
    confirmButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.white,
    },
  });
}
