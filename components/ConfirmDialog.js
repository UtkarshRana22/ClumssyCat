import { useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../ThemeContext';
import { FONTS, RADIUS } from '../theme';

// Generic themed confirm/notice dialog, matching DatePickerModal /
// TimePickerModal / ConflictWarningModal instead of the plain OS Alert.
//
// Two shapes:
// - Confirm: pass onCancel + onConfirm (e.g. "Delete this meeting?").
// - Notice: pass only onConfirm (e.g. an error message) — renders a single
//   button, labeled by confirmLabel (defaults to "OK").
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  onCancel,
  onConfirm,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel ?? onConfirm}>
      <Pressable style={styles.backdrop} onPress={onCancel ?? onConfirm}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconCircle, destructive && styles.iconCircleDestructive]}>
            <MaterialCommunityIcons
              name={destructive ? 'trash-can-outline' : 'information-outline'}
              size={20}
              color={destructive ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.footerRow}>
            {onCancel && (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.confirmButton, destructive && styles.confirmButtonDestructive]}
              onPress={onConfirm}
            >
              <Text
                style={[styles.confirmButtonText, destructive && styles.confirmButtonTextDestructive]}
              >
                {confirmLabel}
              </Text>
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
    iconCircle: {
      alignSelf: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    iconCircleDestructive: {
      backgroundColor: colors.primaryTint,
    },
    title: {
      fontFamily: FONTS.extraBold,
      fontSize: 16,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    message: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 4,
      lineHeight: 19,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
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
      backgroundColor: colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonDestructive: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.onSecondaryContainer,
    },
    confirmButtonTextDestructive: {
      color: colors.white,
    },
  });
}
