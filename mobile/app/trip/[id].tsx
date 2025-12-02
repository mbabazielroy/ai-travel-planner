import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
  ActivityIndicator,
} from "react-native";
import * as Linking from "expo-linking";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { ItineraryView } from "@/components/ItineraryView";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/firebase";
import type { Trip } from "@/lib/types";
import { theme } from "@/theme";

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const db = getDb();
      if (!db || !user || !params.id) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid, "trips", params.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Trip not found.");
          setLoading(false);
          return;
        }
        const data = snap.data() as Trip;
        setTrip({ ...data, id: snap.id });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trip.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [params.id, user]);

  const dateRange = trip?.startDate
    ? `${format(new Date(trip.startDate), "LLL dd, yyyy")} → ${format(
        new Date(trip.endDate),
        "LLL dd, yyyy"
      )}`
    : "Flexible dates";

  const handleCopy = async () => {
    if (!trip?.itinerary) return;
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(trip.itinerary);
    setToast("Copied itinerary");
  };

  const handleShare = async () => {
    if (!trip?.itinerary) return;
    await Share.share({
      title: trip.title,
      message: trip.itinerary,
    });
  };

  const openMaps = async (query: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;
    await Linking.openURL(url);
  };

  const handleRegenerate = async () => {
    if (!trip) return;
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch(
        `${(process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(
          /\/$/,
          ""
        )}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: trip.destination,
            budget: trip.budget,
            startDate: trip.startDate,
            endDate: trip.endDate,
            travelerType: trip.travelerType,
          }),
        }
      );
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to regenerate itinerary.");
      }
      const { itinerary } = (await response.json()) as { itinerary: string };
      const db = getDb();
      if (db && user) {
        const ref = doc(db, "users", user.uid, "trips", trip.id);
        await updateDoc(ref, { itinerary, updatedAt: serverTimestamp() });
        setTrip({ ...trip, itinerary });
      }
      setToast("Itinerary updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to regenerate.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    const db = getDb();
    if (!db || !user || !trip) return;
    await deleteDoc(doc(db, "users", user.uid, "trips", trip.id));
    router.replace("/dashboard");
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.text} />
        <Text style={styles.text}>Loading trip...</Text>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>{error ?? "Trip not found."}</Text>
        <Button title="Back" variant="ghost" onPress={() => router.replace("/dashboard")} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.kicker}>Trip</Text>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.subtitle}>
          {trip.destination} • {trip.travelerType}
        </Text>
        <Text style={styles.meta}>{dateRange}</Text>
        <View style={styles.row}>
          <Button title="Share" variant="ghost" onPress={() => void handleShare()} />
          <Button title="Delete" variant="danger" onPress={() => void handleDelete()} />
          <Button
            title="Open Maps"
            variant="ghost"
            onPress={() => void openMaps(trip.destination)}
          />
          <Button
            title="Restaurants nearby"
            variant="ghost"
            onPress={() => void openMaps(`${trip.destination} restaurants`)}
          />
        </View>
        {trip.costBreakdown ? (
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Budget: {trip.costBreakdown}</Text>
          </View>
        ) : null}
        {toast ? <Text style={styles.toast}>{toast}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <ItineraryView
        itinerary={trip.itinerary}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        regenerating={regenerating}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: { color: theme.colors.text },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  kicker: {
    color: theme.colors.accent,
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: { color: theme.colors.text, fontSize: 16 },
  meta: { color: theme.colors.subtext },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    color: theme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  toast: {
    color: theme.colors.success,
    backgroundColor: "rgba(52,211,153,0.1)",
    borderColor: "rgba(52,211,153,0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: 8,
  },
  error: {
    color: theme.colors.danger,
    marginTop: 6,
  },
});
