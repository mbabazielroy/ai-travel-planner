"use client";

import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";

type Mode = "login" | "signup";

export const AuthForm = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const authClient = getAuthClient();
    if (!authClient) {
      setError("Firebase is not configured. Check your environment variables.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(authClient, email, password);
      } else {
        await createUserWithEmailAndPassword(authClient, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass w-full max-w-md rounded-3xl p-8 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Start planning
          </p>
          <h2 className="text-2xl font-semibold text-white">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
        </div>
        <span className="pill text-xs text-slate-200">
          {mode === "login" ? "Member" : "New traveler"}
        </span>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm text-slate-200">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="text-sm text-slate-200">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-midnight/60 px-3 py-3 text-sm text-white outline-none ring-iris/50 transition focus:border-iris focus:ring-2"
            placeholder="Minimum 6 characters"
            minLength={6}
          />
        </label>
        {error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aqua to-iris px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-300">
        {mode === "login" ? "New to the app?" : "Already registered?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-semibold text-iris underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Create an account" : "Sign in instead"}
        </button>
      </p>
    </div>
  );
};
