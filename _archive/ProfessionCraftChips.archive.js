// ARCHIVED — "Primary craft" profession-picker chips, removed from
// screen/LoginSignupScreen.js on request. Kept here in case we want to
// bring it back later (e.g. to calibrate booking slots per profession).
//
// To restore:
// 1. Add back near the top of LoginSignupScreen.js:
//      const PROFESSIONS = [
//        { key: 'designer', label: '🎨 Designer' },
//        { key: 'consultant', label: '💼 Consultant' },
//        { key: 'coach', label: '🌱 Coach' },
//      ];
// 2. Add back the state: const [profession, setProfession] = useState('designer');
// 3. Re-insert the JSX block below between the email field and the password field.
// 4. Re-add the chipRow/chip/chipActive/chipLabel/chipLabelActive styles
//    (see bottom of this file) to the StyleSheet in LoginSignupScreen.js.

/* JSX block (goes inside the {isSignup && (...)} sign-up-only section) */
/*
{isSignup && (
  <View style={styles.field}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>Primary craft</Text>
      <Text style={styles.fieldHint}>Calibrates your slots</Text>
    </View>
    <View style={styles.chipRow}>
      {PROFESSIONS.map((p) => {
        const active = profession === p.key;
        return (
          <Pressable
            key={p.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => setProfession(p.key)}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
)}
*/

/* Styles (add into the LoginSignupScreen.js StyleSheet.create({...})) */
/*
chipRow: {
  flexDirection: 'row',
  gap: 8,
},
chip: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: RADIUS.pill,
  backgroundColor: COLORS.surfaceSunken,
},
chipActive: {
  backgroundColor: COLORS.primarySoft,
},
chipLabel: {
  fontFamily: FONTS.semiBold,
  fontSize: 12,
  color: COLORS.textSecondary,
},
chipLabelActive: {
  color: '#661000',
},
*/
