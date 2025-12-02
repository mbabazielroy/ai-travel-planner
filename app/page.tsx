"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
      <Navbar />
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div className="glass rounded-3xl p-8 shadow-card">
          <span className="pill mb-4 w-fit">Next.js 14 • Firebase • OpenAI</span>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Plan bold trips in seconds, save them forever.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            Enter your destination, budget, and dates. AI crafts a daily plan,
            restaurants, tips, and costs, while Firebase keeps everything in
            sync across devices.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              "Email login with protected dashboard",
              "Instant itineraries with OpenAI",
              "Save, edit, delete trips in Firestore",
              "Share-ready trip pages",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                ✅ {item}
              </div>
            ))}
          </div>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
