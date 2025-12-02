"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/firebase";

interface AuthOptions {
  protected?: boolean;
  redirectTo?: string;
}

export const useAuth = (options: AuthOptions = {}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const authClient = getAuthClient();
    if (!authClient) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      authClient,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!options.protected) return;
    if (!loading && !user) {
      router.replace(options.redirectTo ?? "/");
    }
  }, [loading, options.protected, options.redirectTo, router, user]);

  const signOut = async () => {
    const authClient = getAuthClient();
    if (authClient) {
      await firebaseSignOut(authClient);
    }
    setUser(null);
  };

  return { user, loading, error, signOut };
};
