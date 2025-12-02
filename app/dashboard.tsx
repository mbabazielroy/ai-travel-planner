import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import type { TravelerType } from "@/lib/types";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ItineraryView } from "@/components/ItineraryView";
import { TripListItem } from "@/components/TripListItem";
import { theme } from "@/theme";

const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );

export default function DashboardScreen() {
  const { user, loading: authLoading, signOutUser } = useAuth();
  const {
    trips,
    loading: tripsLoading,
    saveTrip,
    deleteTrip,
    toggleFavorite,
    setFilter,
  } = useTrips(user?.uid);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [travelerType, setTravelerType] = useState<TravelerType>("solo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user]);

  const canGenerate = useMemo(
    () => destination && budget && startDate && endDate,
    [destination, budget, startDate, endDate]
  );

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError("Please add destination, budget, and dates.");
      return;
    }
    setError(null);
    setPendingGenerate(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          budget,
          travelerType,
          startDate,
          endDate,
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to generate itinerary.");
      }
      const json = (await response.json()) as { itinerary: string };
      setItinerary(json.itinerary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingGenerate(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("You need to log in to save trips.");
      return;
    }
    if (!itinerary) {
      setError("Generate an itinerary first.");
      return;
    }
    setPendingSave(true);
    setError(null);
    try {
      await saveTrip({
        title: title || `${destination || "Trip"} itinerary`,
        destination,
        budget,
        startDate,
        endDate,
        travelerType,
        itinerary,
        costBreakdown: `Estimated budget: ${budget || "TBD"}`,
      });
      setToast("Trip saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save trip.");
    } finally {
      setPendingSave(false);
    }
  };

  const handleCopy = async () => {
    const Clipboard = await import("expo-clipboard");
    if (!itinerary) return;
    await Clipboard.setStringAsync(itinerary);
    setToast("Copied itinerary");
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  const greet = user?.email?.split("@")[0] ?? "traveler";

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.kicker}>Dashboard</Text>
          <Text style={styles.title}>Hi {greet}, plan your next trip.</Text>
          <Text style={styles.subtitle}>
            Generate itineraries with OpenAI, save them to Firebase, and reopen
            anytime.
          </Text>
        </View>
        <Button title="Log out" variant="ghost" onPress={() => signOutUser()} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trip details</Text>
        <View style={styles.inputs}>
          <Input label="Trip title" value={title} onChangeText={setTitle} />
          <Input
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholder="Barcelona, Spain"
          />
          <Input
            label="Budget"
            value={budget}
            onChangeText={setBudget}
            placeholder="1500 USD"
          />
          <Input
            label="Traveler type (solo, couple, family, group)"
            value={travelerType}
            onChangeText={(val) =>
              setTravelerType((val.trim().toLowerCase() as TravelerType) || "solo")
            }
          />
          <Input
            label="Start date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2025-02-01"
          />
          <Input
            label="End date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2025-02-07"
          />
        </View>
        <Button
          title={pendingGenerate ? "Generating..." : "Generate itinerary"}
          onPress={handleGenerate}
          loading={pendingGenerate}
          disabled={!canGenerate}
          fullWidth
        />
      </View>

      <ItineraryView
        itinerary={itinerary}
        onSave={handleSave}
        saving={pendingSave}
        onRegenerate={async () => handleGenerate()}
        regenerating={pendingGenerate}
        onCopy={handleCopy}
      />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Saved trips</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Input
            label="Search"
            value={search}
            onChangeText={(val) => {
              setSearch(val);
              setFilter({ query: val, favoritesOnly });
            }}
            placeholder="Search destination or title"
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: theme.colors.subtext }}>Favorites only</Text>
            <Button
              title={favoritesOnly ? "On" : "Off"}
              variant={favoritesOnly ? "secondary" : "ghost"}
              onPress={() => {
                setFavoritesOnly(!favoritesOnly);
                setFilter({ query: search, favoritesOnly: !favoritesOnly });
              }}
            />
          </View>
        </View>
        {tripsLoading ? (
          <Text style={styles.subtitle}>Loading your trips...</Text>
        ) : trips.length === 0 ? (
          <Text style={styles.subtitle}>No trips yet. Save your first one.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {trips.map((trip) => (
              <TripListItem
                key={trip.id}
                trip={trip}
                onDelete={async (id) => {
                  if (Platform.OS !== "web") {
                    const should = await new Promise<boolean>((resolve) => {
                      Alert.alert("Delete trip", "Are you sure?", [
                        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                        { text: "Delete", style: "destructive", onPress: () => resolve(true) },
                      ]);
                    });
                    if (!should) return;
                  }
                  await deleteTrip(id);
                }}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  text: { color: theme.colors.text },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kicker: {
    color: theme.colors.accent,
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.subtext,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  inputs: { gap: 12 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.danger,
    backgroundColor: "rgba(248,113,113,0.1)",
    borderColor: "rgba(248,113,113,0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  toast: {
    color: theme.colors.success,
    backgroundColor: "rgba(52,211,153,0.1)",
    borderColor: "rgba(52,211,153,0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
});
