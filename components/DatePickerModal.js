import { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS } from '../theme';
import { MONTH_NAMES, WEEKDAY_LABELS, getMonthMatrix, isSameDay } from '../utils/dateFormat';

// Fully custom, theme-matched date picker — deliberately not the native OS
// picker, since that can't be restyled to match the app's design system.
export default function DatePickerModal({ visible, value, onClose, onSelect }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(value ?? today);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  function goPrevMonth() {
    setCursor(new Date(year, month - 1, 1));
  }

  function goNextMonth() {
    setCursor(new Date(year, month + 1, 1));
  }

  function handleSelectDay(day) {
    onSelect(new Date(year, month, day));
    onClose();
  }

  function handleToday() {
    setCursor(today);
    onSelect(today);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Pressable style={styles.navButton} onPress={goPrevMonth}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <Pressable style={styles.navButton} onPress={goNextMonth}>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.weekdayLabel}>
                {w}
              </Text>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, ci) => {
                if (!cell.inMonth) {
                  return <View key={ci} style={styles.dayCell} />;
                }
                const cellDate = new Date(year, month, cell.day);
                const selected = isSameDay(cellDate, value);
                const isToday = isSameDay(cellDate, today);
                return (
                  <Pressable key={ci} style={styles.dayCell} onPress={() => handleSelectDay(cell.day)}>
                    <View
                      style={[
                        styles.dayCircle,
                        isToday && !selected && styles.dayCircleToday,
                        selected && styles.dayCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && !selected && styles.dayTextToday,
                          selected && styles.dayTextSelected,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.footerRow}>
            <Pressable style={styles.todayButton} onPress={handleToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
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
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    navButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    weekdayLabel: {
      flex: 1,
      textAlign: 'center',
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.textMuted,
    },
    weekRow: {
      flexDirection: 'row',
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleToday: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    dayCircleSelected: {
      backgroundColor: colors.primary,
    },
    dayText: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textPrimary,
    },
    dayTextToday: {
      color: colors.primary,
      fontFamily: FONTS.bold,
    },
    dayTextSelected: {
      color: colors.white,
      fontFamily: FONTS.bold,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    todayButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    todayButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.primary,
    },
    closeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    closeButtonText: {
      fontFamily: FONTS.semiBold,
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
}
