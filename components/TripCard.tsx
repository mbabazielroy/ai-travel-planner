"use client";

import Link from "next/link";
import { useState } from "react";
import type { Trip } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  trip: Trip;
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onToggleFavorite: (id: string, favorite: boolean) => Promise<void>;
}

export const TripCard = ({
  trip,
  onDelete,
  onUpdateTitle,
  onToggleFavorite,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(trip.title);
  const [pending, setPending] = useState(false);

  const formattedRange = (() => {
    if (!trip.startDate || !trip.endDate) return "Flexible dates";
    try {
      return `${format(new Date(trip.startDate), "LLL dd")} → ${format(new Date(trip.endDate), "LLL dd")}`;
    } catch {
      return "Flexible dates";
    }
  })();

  const saveTitle = async () => {
    setPending(true);
    try {
      await onUpdateTitle(trip.id, title || trip.title);
      setEditing(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-midnight/60 px-3 py-2 text-sm text-white outline-none focus:border-iris focus:ring-2 focus:ring-iris/50"
            />
          ) : (
            <h4 className="text-lg font-semibold text-white">{trip.title}</h4>
          )}
          <p className="text-sm text-slate-300">{trip.destination}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {trip.travelerType} • {formattedRange}
          </p>
        </div>
        <span className="pill text-xs">{trip.budget}</span>
      </div>

      <p className="text-sm text-slate-300">
        {trip.itinerary.slice(0, 260)}
      </p>

      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/trip/${trip.id}`}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Open trip
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(trip.id, !trip.favorite)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${trip.favorite ? "bg-emerald-600 text-white" : "border border-white/15 text-slate-200 hover:border-white/40"}`}
          >
            {trip.favorite ? "★ Favorite" : "☆ Favorite"}
          </button>
          {editing ? (
            <>
              <button
                type="button"
                onClick={saveTitle}
                disabled={pending}
                className="rounded-xl bg-iris/80 px-3 py-2 text-xs font-semibold text-white hover:bg-iris disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setTitle(trip.title);
                }}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-white/30"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 hover:border-white/40"
            >
              Edit title
            </button>
          )}
          <button
            type="button"
            onClick={() => void onDelete(trip.id)}
            className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
