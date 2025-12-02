"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="glass sticky top-0 z-20 flex items-center justify-between rounded-2xl px-6 py-4 backdrop-saturate-150">
      <Link href={user ? "/dashboard" : "/"}>
        <span className="text-lg font-semibold tracking-tight text-white">
          ✈️ AI Travel Planner
        </span>
      </Link>
      <div className="flex items-center gap-3">
        {pathname !== "/dashboard" && user ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/20"
          >
            Dashboard
          </Link>
        ) : null}
        {user ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
          >
            Log out
          </button>
        ) : null}
      </div>
    </nav>
  );
};
