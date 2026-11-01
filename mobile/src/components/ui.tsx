import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius, space } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

/** Écran défilant avec fond crème et « tirer pour rafraîchir » optionnel. */
export function Screen({
  children,
  refreshing,
  onRefresh,
  footer,
  contentStyle,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.screenContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={colors.orange}
              colors={[colors.orange]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {hint ? <Text style={styles.muted}>{hint}</Text> : null}
    </View>
  );
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: colors.orange, fg: colors.blanc, border: colors.orange },
    secondary: { bg: colors.blanc, fg: colors.marronProfond, border: colors.border },
    ghost: { bg: "transparent", fg: colors.orange, border: "transparent" },
    danger: { bg: colors.blanc, fg: colors.danger, border: "#F3C1BC" },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
          <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  hint,
  style,
  ...props
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.grisChaud}
        style={[styles.input, !!error && { borderColor: colors.danger }, props.multiline && { minHeight: 80, textAlignVertical: "top" }, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

/** Carte de choix (radio) : église, mode de livraison, paiement… */
export function ChoiceCard({
  selected,
  onPress,
  icon,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  icon: IconName;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.orange : colors.grisChaud} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, flexWrap: "wrap" }}>
          <Text style={styles.choiceTitle}>{title}</Text>
          {badge ? (
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.choiceSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export function QuantityStepper({
  value,
  onChange,
  max,
  compact,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number | null;
  compact?: boolean;
}) {
  const size = compact ? 30 : 36;
  const canAdd = max == null || value < max;
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={value <= 0}
        accessibilityLabel="Retirer un"
        style={[styles.stepBtn, { width: size, height: size }, value <= 0 && { opacity: 0.35 }]}
      >
        <Ionicons name="remove" size={18} color={colors.marronProfond} />
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={!canAdd}
        accessibilityLabel="Ajouter un"
        style={[styles.stepBtn, styles.stepBtnAdd, { width: size, height: size }, !canAdd && { opacity: 0.35 }]}
      >
        <Ionicons name="add" size={18} color={colors.blanc} />
      </Pressable>
    </View>
  );
}

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "orange" | "green" | "red" }) {
  const t = {
    neutral: { bg: "#F1E8DD", fg: colors.marron },
    orange: { bg: colors.orangeBg, fg: colors.orange },
    green: { bg: colors.successBg, fg: colors.success },
    red: { bg: colors.dangerBg, fg: colors.danger },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.body, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.body, strong && styles.strongOrange]}>{value}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.orange} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle" size={20} color={colors.danger} />
      <Text style={[styles.body, { color: colors.danger, flex: 1 }]}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retry}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.orange} />
      </View>
      <Text style={[styles.sectionTitle, { textAlign: "center" }]}>{title}</Text>
      {text ? <Text style={[styles.muted, { textAlign: "center" }]}>{text}</Text> : null}
      {action ? <View style={{ marginTop: space.lg, alignSelf: "stretch" }}>{action}</View> : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blancCreme },
  screenContent: { padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg },
  footer: {
    padding: space.lg,
    paddingBottom: space.xl,
    backgroundColor: colors.blanc,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.marronProfond, lineHeight: 34 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.marronProfond, lineHeight: 26 },
  body: { fontFamily: fonts.sans, fontSize: 15, color: colors.textBody, lineHeight: 21 },
  muted: { fontFamily: fonts.sans, fontSize: 13, color: colors.grisChaud, lineHeight: 18 },
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.grisChaud,
    marginBottom: space.sm,
  },
  strong: { fontFamily: fonts.sansBold, color: colors.marronProfond, fontSize: 17 },
  strongOrange: { fontFamily: fonts.sansBold, color: colors.orange, fontSize: 17 },
  card: {
    backgroundColor: colors.blanc,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  buttonText: { fontFamily: fonts.sansBold, fontSize: 16 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textBody, marginBottom: 6 },
  input: {
    backgroundColor: colors.blanc,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.marronProfond,
  },
  errorText: { fontFamily: fonts.sans, fontSize: 12, color: colors.danger, marginTop: 4 },
  hint: { fontFamily: fonts.sans, fontSize: 12, color: colors.grisChaud, marginTop: 4 },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "#EFE4D6",
    backgroundColor: colors.blanc,
  },
  choiceSelected: { borderColor: colors.orange, backgroundColor: "#FFF4EA" },
  choiceTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.marronProfond },
  choiceSubtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textBody, marginTop: 2, lineHeight: 18 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: colors.orange },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  badgeGreen: { backgroundColor: colors.success, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeGreenText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.blanc },
  stepper: { flexDirection: "row", alignItems: "center", gap: space.sm },
  stepBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blanc,
  },
  stepBtnAdd: { backgroundColor: colors.orange, borderColor: colors.orange },
  stepValue: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.marronProfond, minWidth: 22, textAlign: "center" },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: space.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xxl, backgroundColor: colors.blancCreme },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: space.md,
  },
  retry: { fontFamily: fonts.sansBold, color: colors.danger, fontSize: 14 },
  empty: { alignItems: "center", gap: space.sm, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
});
