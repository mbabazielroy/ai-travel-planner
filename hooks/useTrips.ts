"use client";

import { useCallback, useEffect, useState } from "react";
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

export const useTrips = (userId?: string) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<{ favoritesOnly: boolean; query: string }>({
    favoritesOnly: false,
    query: "",
  });

  useEffect(() => {
    const database = getDb();
    if (!userId || !database) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const tripsQuery = query(
      collection(database, "users", userId, "trips"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
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
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      const filtered = nextTrips.filter((trip) => {
        const matchesQuery =
          !filter.query ||
          trip.title.toLowerCase().includes(filter.query.toLowerCase()) ||
          trip.destination.toLowerCase().includes(filter.query.toLowerCase());
        const matchesFavorite = !filter.favoritesOnly || trip.favorite;
        return matchesQuery && matchesFavorite;
      });
      setTrips(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter.favoritesOnly, filter.query, userId]);

  const saveTrip = useCallback(
    async (payload: TripPayload) => {
      const database = getDb();
      if (!userId || !database) {
        throw new Error("User not found or database unavailable.");
      }

      const docRef = await addDoc(
        collection(database, "users", userId, "trips"),
        {
          ...payload,
          favorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      return docRef.id;
    },
    [userId]
  );

  const updateTripTitle = useCallback(
    async (tripId: string, title: string) => {
      const database = getDb();
      if (!userId || !database) return;
      await updateDoc(doc(database, "users", userId, "trips", tripId), {
        title,
        updatedAt: serverTimestamp(),
      });
    },
    [userId]
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      const database = getDb();
      if (!userId || !database) return;
      await deleteDoc(doc(database, "users", userId, "trips", tripId));
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    async (tripId: string, favorite: boolean) => {
      const database = getDb();
      if (!userId || !database) return;
      await updateDoc(doc(database, "users", userId, "trips", tripId), {
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
