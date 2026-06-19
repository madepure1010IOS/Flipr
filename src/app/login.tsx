import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICE } from "../constants/theme";
import { supabase } from "../supabase";

const { width } = Dimensions.get("window");

const ONBOARDING_STEPS = [
  {
    title: "Track Any Item",
    subtitle:
      "From sneakers to trading cards — see what's trending in the resale market in real time.",
  },
  {
    title: "Buy & Sell Signals",
    subtitle:
      "Know exactly when to buy low and sell high with our flip intelligence engine.",
  },
  {
    title: "Never Miss a Deal",
    subtitle:
      "Set price alerts and get notified the moment an item hits your target price.",
  },
];

export default function LoginScreen() {
  const router = useRouter();
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    if (isSignUp && !agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
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
    if (isSignUp) {
      setError("Check your email to confirm your account!");
    } else {
      router.replace("/");
    }
  };

  // Onboarding
  if (showOnboarding) {
    const step = ONBOARDING_STEPS[onboardingIndex];
    const isLast = onboardingIndex === ONBOARDING_STEPS.length - 1;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.onboarding}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => setShowOnboarding(false)}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Penguin */}
          <View style={styles.penguinWrap}>
            <Image
              source={require("../../assets/images/penguin.png")}
              style={styles.penguinLarge}
              resizeMode="contain"
            />
          </View>

          {/* Step indicator */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {onboardingIndex + 1} of {ONBOARDING_STEPS.length}
            </Text>
          </View>

          <View style={styles.onboardingText}>
            <Text style={styles.onboardingTitle}>{step.title}</Text>
            <Text style={styles.onboardingSubtitle}>{step.subtitle}</Text>
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === onboardingIndex && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.onboardingBtn}
            onPress={() => {
              if (isLast) setShowOnboarding(false);
              else setOnboardingIndex(onboardingIndex + 1);
            }}
          >
            <Text style={styles.onboardingBtnText}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/images/penguin.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Flipr</Text>
            <Text style={styles.tagline}>RESALE MARKET INTELLIGENCE</Text>
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
                placeholderTextColor={ICE.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={ICE.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUp ? "new-password" : "password"}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            {isSignUp && (
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreedToTerms && styles.checkboxActive,
                  ]}
                >
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTerms(true)}
                  >
                    Terms & Conditions
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Error */}
            {error ? (
              <Text
                style={[
                  styles.error,
                  error.includes("Check your email") && styles.success,
                ]}
              >
                {error}
              </Text>
            ) : null}

            {/* Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
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
                setAgreedToTerms(false);
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

          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.skip}>Continue without account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <Modal
        visible={showTerms}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowTerms(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>
              {`Last updated: June 2026\n\n1. ACCEPTANCE OF TERMS\nBy using Flipr, you agree to these Terms & Conditions.\n\n2. USE OF SERVICE\nFlipr provides resale market intelligence for informational purposes only. Nothing constitutes financial advice.\n\n3. DATA & PRIVACY\nWe collect your email address and usage data to provide and improve our service. We do not sell your personal data.\n\n4. ACCURACY OF DATA\nFlipr makes no guarantees about the accuracy or timeliness of market data. Resale prices can be volatile.\n\n5. USER ACCOUNTS\nYou are responsible for maintaining the security of your account.\n\n6. LIMITATION OF LIABILITY\nFlipr is not liable for any financial losses resulting from use of this app.\n\n7. CONTACT\nsupport@flipr.app`}
            </Text>
            <TouchableOpacity
              style={styles.termsAgreeBtn}
              onPress={() => {
                setAgreedToTerms(true);
                setShowTerms(false);
              }}
            >
              <Text style={styles.termsAgreeBtnText}>Agree & Close</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  // Onboarding
  onboarding: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  skipBtn: { position: "absolute", top: 16, right: 0, padding: 12 },
  skipText: { color: ICE.textMuted, fontSize: 15 },
  penguinWrap: { alignItems: "center" },
  penguinLarge: { width: 180, height: 180 },
  stepBadge: {
    backgroundColor: ICE.bgElement,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ICE.border,
  },
  stepBadgeText: { color: ICE.textSecondary, fontSize: 12, fontWeight: "600" },
  onboardingText: { alignItems: "center", gap: 12 },
  onboardingTitle: {
    color: ICE.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  onboardingSubtitle: {
    color: ICE.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ICE.bgElement },
  dotActive: { backgroundColor: ICE.primary, width: 24 },
  onboardingBtn: {
    backgroundColor: ICE.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  onboardingBtnText: { color: "#000", fontSize: 16, fontWeight: "800" },

  // Auth
  inner: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 24,
    paddingVertical: 40,
  },
  logoSection: { alignItems: "center", gap: 6 },
  logoImage: { width: 80, height: 80, borderRadius: 20 },
  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: ICE.textPrimary,
    letterSpacing: -2,
  },
  tagline: { color: ICE.textMuted, fontSize: 11, letterSpacing: 2 },
  card: {
    backgroundColor: ICE.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: ICE.border,
    gap: 16,
  },
  cardTitle: { color: ICE.textPrimary, fontSize: 22, fontWeight: "800" },
  cardSubtitle: { color: ICE.textSecondary, fontSize: 14, marginTop: -8 },
  inputGroup: { gap: 6 },
  inputLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: ICE.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: ICE.border,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ICE.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: ICE.textPrimary,
    fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeIcon: { fontSize: 18 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ICE.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: ICE.primary, borderColor: ICE.primary },
  checkmark: { color: "#000", fontSize: 13, fontWeight: "800" },
  termsText: { color: ICE.textSecondary, fontSize: 13, flex: 1 },
  termsLink: { color: ICE.primary, fontWeight: "600" },
  error: { color: ICE.down, fontSize: 13, textAlign: "center" },
  success: { color: ICE.up },
  button: {
    backgroundColor: ICE.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#000", fontSize: 16, fontWeight: "800" },
  toggle: { alignItems: "center" },
  toggleText: { color: ICE.textSecondary, fontSize: 13 },
  toggleLink: { color: ICE.primary, fontWeight: "700" },
  skip: { color: ICE.textMuted, fontSize: 13, textAlign: "center" },

  // Modal
  modalContainer: { flex: 1, backgroundColor: ICE.bg },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ICE.border,
  },
  modalTitle: { color: ICE.textPrimary, fontSize: 18, fontWeight: "700" },
  modalClose: { paddingHorizontal: 12, paddingVertical: 6 },
  modalCloseText: { color: ICE.primary, fontSize: 15, fontWeight: "600" },
  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  modalText: { color: ICE.textSecondary, fontSize: 14, lineHeight: 24 },
  termsAgreeBtn: {
    backgroundColor: ICE.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  termsAgreeBtnText: { color: "#000", fontSize: 16, fontWeight: "800" },
});
