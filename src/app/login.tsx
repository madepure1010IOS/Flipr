import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>Flipr</Text>
          <Text style={styles.tagline}>Resale Market Intelligence</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isSignUp
              ? "Start tracking the resale market"
              : "Sign in to your account"}
          </Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#333"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#333"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle */}
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={styles.toggleLink}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.skip}>Continue without account</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -2,
  },
  tagline: {
    color: "#444",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#12122a",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    gap: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#555",
    fontSize: 14,
    marginTop: -8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: "#444",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1e1e3a",
  },
  error: {
    color: "#ff4444",
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00e5aa",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  toggle: {
    alignItems: "center",
  },
  toggleText: {
    color: "#555",
    fontSize: 13,
  },
  toggleLink: {
    color: "#00e5aa",
    fontWeight: "700",
  },
  skip: {
    color: "#333",
    fontSize: 13,
    textAlign: "center",
  },
});
