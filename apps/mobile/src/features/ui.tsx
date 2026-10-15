import { colors as brandColors } from "../../../../packages/brand/tokens";
import { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
export const colors = { ...brandColors, teal: brandColors.secondary };
export function Txt({
  children,
  title = false,
  muted = false,
}: PropsWithChildren<{ title?: boolean; muted?: boolean }>) {
  return (
    <Text
      style={{
        fontFamily: title ? "Nunito_800ExtraBold" : "Nunito_400Regular",
        fontSize: title ? 24 : 15,
        color: muted ? colors.muted : colors.ink,
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary ? "#E6F3F3" : colors.primary,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: "Nunito_800ExtraBold",
          color: secondary ? colors.teal : "white",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Txt muted>{label}</Txt>
      <TextInput
        placeholderTextColor="#9A918B"
        {...props}
        style={[s.input, props.style]}
      />
    </View>
  );
}
export function Card({ children }: PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}
export function Page({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          s.page,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Busy() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.primary} />
      <Txt muted>Um instante…</Txt>
    </View>
  );
}
export function Empty({ text = "Nada por aqui ainda." }: { text?: string }) {
  return (
    <Card>
      <Ionicons name="paw-outline" size={30} color={colors.primary} />
      <Txt muted>{text}</Txt>
    </Card>
  );
}
export const s = StyleSheet.create({
  page: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: "Nunito_400Regular",
    color: colors.ink,
  },
  button: { borderRadius: 999, paddingVertical: 15, paddingHorizontal: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  chip: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
