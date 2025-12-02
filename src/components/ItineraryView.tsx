import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { Button } from "./Button";

interface Props {
  itinerary: string;
  onSave?: () => Promise<void>;
  onCopy?: () => Promise<void>;
  onRegenerate?: () => Promise<void>;
  saving?: boolean;
  regenerating?: boolean;
}

export const ItineraryView = ({
  itinerary,
  onSave,
  onCopy,
  onRegenerate,
  saving,
  regenerating,
}: Props) => {
  if (!itinerary) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Generated itineraries will appear here after you tap “Generate”.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Your itinerary</Text>
        <View style={styles.actions}>
          {onCopy ? (
            <Button title="Copy" variant="ghost" onPress={() => void onCopy()} />
          ) : null}
          {onRegenerate ? (
            <Button
              title={regenerating ? "Regenerating..." : "Regenerate"}
              variant="ghost"
              onPress={() => void onRegenerate()}
              loading={regenerating}
            />
          ) : null}
          {onSave ? (
            <Button
              title={saving ? "Saving..." : "Save"}
              onPress={() => void onSave()}
              loading={saving}
            />
          ) : null}
        </View>
      </View>
      <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
        {itinerary.split("\n").map((line, idx) => (
          <Text key={`${line}-${idx}`} style={styles.text}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  placeholder: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  placeholderText: { color: theme.colors.subtext },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  text: {
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
});
