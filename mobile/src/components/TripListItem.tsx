import { format } from "date-fns";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { theme } from "@/theme";
import type { Trip } from "@/lib/types";
import { Button } from "./Button";

interface Props {
  trip: Trip;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string, favorite: boolean) => Promise<void>;
}

export const TripListItem = ({ trip, onDelete, onToggleFavorite }: Props) => {
  const formattedRange =
    trip.startDate && trip.endDate
      ? `${format(new Date(trip.startDate), "LLL dd")} → ${format(
          new Date(trip.endDate),
          "LLL dd"
        )}`
      : "Flexible dates";

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.subtitle}>
          {trip.destination} • {trip.travelerType}
        </Text>
        <Text style={styles.subdued}>{formattedRange}</Text>
      </View>
      <View style={styles.actions}>
        <Link href={`/trip/${trip.id}`} style={styles.link}>
          Open
        </Link>
        <Button
          title={trip.favorite ? "★ Favorite" : "☆ Favorite"}
          variant={trip.favorite ? "secondary" : "ghost"}
          onPress={() => void onToggleFavorite(trip.id, !trip.favorite)}
        />
        <Button
          title="Delete"
          variant="ghost"
          onPress={() => void onDelete(trip.id)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 14,
  },
  subdued: {
    color: theme.colors.subtext,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  link: {
    color: theme.colors.accent,
    fontWeight: "700",
    fontSize: 14,
  },
});
