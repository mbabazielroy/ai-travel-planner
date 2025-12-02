"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { ItineraryPreview } from "@/components/ItineraryPreview";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({
    protected: true,
    redirectTo: "/",
  });

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const database = getDb();
    if (!user || !id || !database) return;
    const fetchTrip = async () => {
      try {
        const tripRef = doc(database, "users", user.uid, "trips", id);
        const snapshot = await getDoc(tripRef);
        if (!snapshot.exists()) {
          setError("Trip not found.");
          setLoading(false);
          return;
        }
        const data = snapshot.data() as Trip;
        setTrip({ ...data, id: snapshot.id });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trip details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, user]);

  const dateRange = useMemo(() => {
    if (!trip?.startDate || !trip.endDate) return "Flexible dates";
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;
    } catch {
      return "Flexible dates";
    }
  }, [trip]);

  const handleDelete = async () => {
    const database = getDb();
    if (!user || !id || !database) return;
    await deleteDoc(doc(database, "users", user.uid, "trips", id));
    router.replace("/dashboard");
  };

  const handleCopy = async () => {
    if (!trip) return;
    await navigator.clipboard.writeText(trip.itinerary);
    setMessage("Itinerary copied to clipboard");
  };

  const handleShare = async () => {
    if (!trip) return;
    if (navigator.share) {
      await navigator.share({
        title: trip.title,
        text: trip.itinerary,
        url: window.location.href,
      });
    } else {
      await handleCopy();
    }
    setMessage("Shared");
  };

  const handleRegenerate = async () => {
    const database = getDb();
    if (!trip || !database) return;
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.destination,
          budget: trip.budget,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelerType: trip.travelerType,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to regenerate itinerary.");
      }

      const { itinerary: aiPlan } = (await response.json()) as {
        itinerary: string;
      };

      const tripRef = doc(database, "users", user!.uid, "trips", trip.id);
      await updateDoc(tripRef, {
        itinerary: aiPlan,
        updatedAt: serverTimestamp(),
      });

      setTrip((prev) =>
        prev ? { ...prev, itinerary: aiPlan } : prev
      );
      setMessage("Itinerary regenerated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to regenerate.");
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message]);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-200">Loading trip...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-200">Redirecting to login...</p>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 md:px-8">
        <Navbar />
        <div className="glass rounded-3xl p-8 text-slate-200">
          {error ?? "Trip not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      <Navbar />
      <header className="glass rounded-3xl p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Trip overview
            </p>
            <h1 className="text-3xl font-semibold text-white">{trip.title}</h1>
            <p className="text-sm text-slate-300">
              {trip.destination} • {trip.travelerType} traveler • {dateRange}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill text-xs">{trip.budget}</span>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              Share
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <p className="text-xs text-slate-400">Date range</p>
            <p className="font-semibold text-white">{dateRange}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <p className="text-xs text-slate-400">Budget</p>
            <p className="font-semibold text-white">{trip.budget}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <p className="text-xs text-slate-400">Traveler type</p>
            <p className="font-semibold capitalize text-white">
              {trip.travelerType}
            </p>
          </div>
        </div>
        {trip.costBreakdown ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <p className="text-xs text-slate-400">Cost breakdown</p>
            <p>{trip.costBreakdown}</p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              trip.destination
            )}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10"
          >
            View on Map
          </a>
        </div>
        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </header>

      <ItineraryPreview
        itinerary={trip.itinerary}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        regenerating={regenerating}
      />
    </main>
  );
}
