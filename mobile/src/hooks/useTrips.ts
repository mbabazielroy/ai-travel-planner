import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Trip, TripPayload } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const cacheKey = (userId?: string) => `trips-cache-${userId ?? "anon"}`;

export const useTrips = (userId?: string) => {
  const [rawTrips, setRawTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ favoritesOnly: boolean; query: string }>({
    favoritesOnly: false,
    query: "",
  });

  useEffect(() => {
    const db = getDb();
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    // Load cached trips first
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(cacheKey(userId));
        if (cached) setRawTrips(JSON.parse(cached));
      } catch {
        // ignore cache errors
      }
    })();

    const q = query(
      collection(db, "users", userId, "trips"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextTrips: Trip[] = snapshot.docs.map((snap) => {
        const data = snap.data();
        return {
          id: snap.id,
          title: data.title,
          destination: data.destination,
          budget: data.budget,
          startDate: data.startDate,
          endDate: data.endDate,
          travelerType: data.travelerType,
          itinerary: data.itinerary,
          costBreakdown: data.costBreakdown,
          favorite: data.favorite ?? false,
          createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
          updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
        };
      });
      setRawTrips(nextTrips);
      setLoading(false);
      AsyncStorage.setItem(cacheKey(userId), JSON.stringify(nextTrips)).catch(() => {});
    });
    return () => unsubscribe();
  }, [userId]);

  const trips = useMemo(() => {
    return rawTrips.filter((trip) => {
      const matchesQuery =
        !filter.query ||
        trip.title.toLowerCase().includes(filter.query.toLowerCase()) ||
        trip.destination.toLowerCase().includes(filter.query.toLowerCase());
      const matchesFavorite = !filter.favoritesOnly || trip.favorite;
      return matchesQuery && matchesFavorite;
    });
  }, [filter.favoritesOnly, filter.query, rawTrips]);

  const saveTrip = useCallback(
    async (payload: TripPayload) => {
      const db = getDb();
      if (!userId || !db) throw new Error("No user or database");
      const docRef = await addDoc(collection(db, "users", userId, "trips"), {
        ...payload,
        favorite: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [userId]
  );

  const updateTripTitle = useCallback(
    async (tripId: string, title: string) => {
      const db = getDb();
      if (!userId || !db) return;
      await updateDoc(doc(db, "users", userId, "trips", tripId), {
        title,
        updatedAt: serverTimestamp(),
      });
    },
    [userId]
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      const db = getDb();
      if (!userId || !db) return;
      await deleteDoc(doc(db, "users", userId, "trips", tripId));
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    async (tripId: string, favorite: boolean) => {
      const db = getDb();
      if (!userId || !db) return;
      await updateDoc(doc(db, "users", userId, "trips", tripId), {
        favorite,
        updatedAt: serverTimestamp(),
      });
    },
    [userId]
  );

  return {
    trips,
    loading,
    saveTrip,
    updateTripTitle,
    deleteTrip,
    toggleFavorite,
    setFilter,
    filter,
  };
};
