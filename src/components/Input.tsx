import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { theme } from "@/theme";

interface Props extends TextInputProps {
  label: string;
}

export const Input = ({ label, ...props }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.subtext}
        style={[styles.input, props.multiline && styles.multiline]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%", gap: 8 },
  label: { color: theme.colors.subtext, fontSize: 13, fontWeight: "600" },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});
