"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  FormValues,
  ItineraryForm,
} from "@/components/ItineraryForm";
import { ItineraryPreview } from "@/components/ItineraryPreview";
import { TripCard } from "@/components/TripCard";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import type { TravelerType } from "@/lib/types";

const initialForm: FormValues = {
  title: "",
  destination: "",
  budget: "",
  startDate: "",
  endDate: "",
  travelerType: "solo",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth({
    protected: true,
    redirectTo: "/",
  });
  const {
    trips,
    loading: tripsLoading,
    saveTrip,
    updateTripTitle,
    deleteTrip,
    toggleFavorite,
    setFilter,
    filter,
  } = useTrips(user?.uid);
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const [formValues, setFormValues] = useState<FormValues>(initialForm);
  const [itinerary, setItinerary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const canGenerate = useMemo(
    () =>
      !!formValues.destination &&
      !!formValues.budget &&
      !!formValues.startDate &&
      !!formValues.endDate,
    [formValues]
  );

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError("Please complete destination, budget, and dates first.");
      return;
    }
    setError(null);
    setGenerating(true);
    setToast(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formValues.destination,
          budget: formValues.budget,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          travelerType: formValues.travelerType as TravelerType,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to generate itinerary.");
      }

      const { itinerary: aiPlan } = (await response.json()) as {
        itinerary: string;
      };
      setItinerary(aiPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("You need to be logged in to save trips.");
      return;
    }
    if (!itinerary) {
      setError("Generate an itinerary first.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveTrip({
        title:
          formValues.title ||
          `${formValues.destination || "Trip"} itinerary`,
        destination: formValues.destination,
        budget: formValues.budget,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        travelerType: formValues.travelerType,
        itinerary,
        costBreakdown: `Estimated budget: ${formValues.budget}`,
      });
      setToast("Trip saved to your library.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save trip.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!itinerary) return;
    await navigator.clipboard.writeText(itinerary);
    setToast("Itinerary copied");
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-200">Loading your dashboard...</p>
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

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <Navbar />
      <header className="flex flex-col gap-3">
        <span className="pill w-fit">Personalized itineraries</span>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Hey {user?.email?.split("@")[0] || "traveler"}, craft your next trip.
          </h1>
          {toast ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              {toast}
            </span>
          ) : null}
        </div>
        <p className="max-w-2xl text-slate-200">
          Fill out the trip details, generate an itinerary instantly with
          OpenAI, then save it to your Firebase-backed collection.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ItineraryForm
            values={formValues}
            loading={generating}
            onChange={handleChange}
            onSubmit={handleGenerate}
          />
        </div>
        <div className="lg:col-span-2">
          <ItineraryPreview
            itinerary={itinerary}
            onSave={handleSave}
            onRegenerate={handleGenerate}
            onCopy={handleCopy}
            saving={saving}
            regenerating={generating}
            destination={formValues.destination}
          />
        </div>
      </section>

      <section className="glass rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Your trips
            </p>
            <h3 className="text-xl font-semibold text-white">
              Saved itineraries
            </h3>
          </div>
          <span className="pill text-xs">
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilter({ query: e.target.value, favoritesOnly: showFavorites });
            }}
            placeholder="Search destination or title"
            className="w-full max-w-xs rounded-xl border border-border bg-midnight/60 px-3 py-2 text-sm text-white outline-none focus:border-iris focus:ring-2 focus:ring-iris/50"
          />
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={showFavorites}
              onChange={(e) => {
                setShowFavorites(e.target.checked);
                setFilter({ query: search, favoritesOnly: e.target.checked });
              }}
            />
            Favorites only
          </label>
        </div>
        {tripsLoading ? (
          <p className="mt-4 text-sm text-slate-300">Loading your trips...</p>
        ) : trips.length === 0 ? (
          <p className="mt-4 text-sm text-slate-300">
            No trips yet. Generate an itinerary and save it.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={deleteTrip}
                onUpdateTitle={updateTripTitle}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
