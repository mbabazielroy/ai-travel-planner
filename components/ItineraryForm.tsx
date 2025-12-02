"use client";

import type { TravelerType } from "@/lib/types";
import { format } from "date-fns";
import { useMemo } from "react";

export interface FormValues {
  title: string;
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  travelerType: TravelerType;
}

interface Props {
  values: FormValues;
  loading: boolean;
  onChange: (field: keyof FormValues, value: string) => void;
  onSubmit: () => void;
}

export const ItineraryForm = ({ values, loading, onChange, onSubmit }: Props) => {
  const dateSummary = useMemo(() => {
    if (!values.startDate || !values.endDate) return "Pick your dates";
    try {
      return `${format(new Date(values.startDate), "LLL dd")} → ${format(new Date(values.endDate), "LLL dd")}`;
    } catch {
      return "Pick your dates";
    }
  }, [values.startDate, values.endDate]);

  return (
    <div className="glass rounded-3xl p-6 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Planner
          </p>
          <h3 className="text-xl font-semibold text-white">
            Tell us about your trip
          </h3>
        </div>
        <span className="pill">{dateSummary}</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-200">
          Trip title
          <input
            value={values.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Lisbon food crawl"
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          />
        </label>
        <label className="text-sm text-slate-200">
          Destination
          <input
            required
            value={values.destination}
            onChange={(e) => onChange("destination", e.target.value)}
            placeholder="Barcelona, Spain"
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          />
        </label>
        <label className="text-sm text-slate-200">
          Budget
          <input
            required
            value={values.budget}
            onChange={(e) => onChange("budget", e.target.value)}
            placeholder="1500 USD"
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          />
        </label>
        <label className="text-sm text-slate-200">
          Traveler type
          <select
            value={values.travelerType}
            onChange={(e) =>
              onChange("travelerType", e.target.value as TravelerType)
            }
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          >
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
        </label>
        <label className="text-sm text-slate-200">
          Start date
          <input
            required
            type="date"
            value={values.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          />
        </label>
        <label className="text-sm text-slate-200">
          End date
          <input
            required
            type="date"
            value={values.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-aqua to-iris px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating your itinerary..." : "Generate Itinerary"}
      </button>
    </div>
  );
};
