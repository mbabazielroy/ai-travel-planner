import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "@/theme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  fullWidth,
}: Props) => {
  const baseStyle = [
    styles.button,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "ghost" && styles.ghost,
    variant === "danger" && styles.danger,
    fullWidth ? styles.fullWidth : null,
    disabled || loading ? styles.disabled : null,
  ].filter(Boolean) as StyleProp<ViewStyle>[];

  const styleForState = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    ...baseStyle,
    pressed ? { opacity: 0.9, transform: [{ scale: 0.99 }] } : null,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={styleForState}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  fullWidth: { width: "100%" },
  primary: {
    backgroundColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  secondary: {
    backgroundColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: "#b91c1c",
  },
  disabled: {
    opacity: 0.6,
  },
});
