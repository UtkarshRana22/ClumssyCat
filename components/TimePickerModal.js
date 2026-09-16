import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS, tactileShadow } from '../theme';

const MINUTE_STEP = 5;

// Fully custom, theme-matched time picker (hour/minute steppers + AM/PM
// switch) — same stepper pattern already used for Buffer Override, kept
// consistent instead of pulling in the native OS time picker.
export default function TimePickerModal({ visible, value, onClose, onSelect }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [hour, setHour] = useState(value?.hour ?? 9);
  const [minute, setMinute] = useState(value?.minute ?? 0);
  const [ampm, setAmpm] = useState(value?.ampm ?? 'AM');

  // Re-sync local draft state whenever the modal opens, so it always
  // starts from the field's current value (or a sensible default).
  useEffect(() => {
    if (visible) {
      setHour(value?.hour ?? 9);
      setMinute(value?.minute ?? 0);
      setAmpm(value?.ampm ?? 'AM');
    }
  }, [visible]);

  function handleConfirm() {
    onSelect({ hour, minute, ampm });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickerRow}>
            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>Hour</Text>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setHour((h) => (h === 1 ? 12 : h - 1))}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{String(hour).padStart(2, '0')}</Text>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setHour((h) => (h === 12 ? 1 : h + 1))}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.colon}>:</Text>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>Minute</Text>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setMinute((m) => (m - MINUTE_STEP + 60) % 60)}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{String(minute).padStart(2, '0')}</Text>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setMinute((m) => (m + MINUTE_STEP) % 60)}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.ampmCol}>
              {['AM', 'PM'].map((p) => (
                <Pressable
                  key={p}
                  style={[styles.ampmChip, ampm === p && styles.ampmChipActive]}
                  onPress={() => setAmpm(p)}
                >
                  <Text style={[styles.ampmText, ampm === p && styles.ampmTextActive]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.footerRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, tactileShadow(colors.primaryShadow)]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
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
      padding: 20,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 16,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
    },
    stepperCol: {
      alignItems: 'center',
      gap: 6,
    },
    stepperLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 11,
      color: colors.textMuted,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.pill,
      padding: 4,
      gap: 6,
    },
    stepperButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    stepperValue: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.textPrimary,
      minWidth: 28,
      textAlign: 'center',
    },
    colon: {
      fontFamily: FONTS.bold,
      fontSize: 20,
      color: colors.textMuted,
      marginTop: 16,
    },
    ampmCol: {
      gap: 6,
      marginTop: 17,
    },
    ampmChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: RADIUS.chip,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    ampmChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    ampmText: {
      fontFamily: FONTS.semiBold,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    ampmTextActive: {
      color: colors.white,
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
