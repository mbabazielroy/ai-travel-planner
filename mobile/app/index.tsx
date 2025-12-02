import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { theme } from "@/theme";

export default function LoginScreen() {
  const { user, loading, signIn, signUp, error } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user]);

  const handleSubmit = async () => {
    setLocalError(null);
    setPending(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>AI Travel Planner</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Welcome back" : "Create an account"}
        </Text>
        <Text style={styles.subtitle}>
          Sign in to generate, save, and manage itineraries on your phone.
        </Text>
        <View style={{ gap: 12, marginTop: 16, width: "100%" }}>
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {(localError || error) && (
          <Text style={styles.error}>{localError ?? error}</Text>
        )}
        <Button
          title={pending ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
          onPress={handleSubmit}
          loading={pending}
          fullWidth
        />
        <Text style={styles.switcher}>
          {mode === "login" ? "New traveler?" : "Already registered?"}{" "}
          <Text
            style={styles.link}
            onPress={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.accent,
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.subtext,
  },
  error: {
    color: theme.colors.danger,
    backgroundColor: "rgba(248,113,113,0.1)",
    borderColor: "rgba(248,113,113,0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  switcher: {
    color: theme.colors.subtext,
    textAlign: "center",
    marginTop: 4,
  },
  link: {
    color: theme.colors.secondary,
    fontWeight: "700",
  },
});
