import { createContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth) {
      setError("Firebase config missing");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      signIn: async (email, password) => {
        const auth = getAuthClient();
        if (!auth) throw new Error("Firebase config missing");
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUp: async (email, password) => {
        const auth = getAuthClient();
        if (!auth) throw new Error("Firebase config missing");
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signOutUser: async () => {
        const auth = getAuthClient();
        if (!auth) return;
        await signOut(auth);
      },
    }),
    [error, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
