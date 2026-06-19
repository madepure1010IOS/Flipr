import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT, ICE } from "../constants/theme";

const { width } = Dimensions.get("window");

const FEATURES = [
  { title: "Unlimited Searches", sub: "Search any item, anytime" },
  { title: "Full Price History", sub: "1M, 6M, 1Y, 5Y and ALL time charts" },
  { title: "Watchlist", sub: "Save and track your items" },
  { title: "Price Alerts", sub: "Get notified at your target price" },
  { title: "Priority Data", sub: "Faster refresh rates" },
  { title: "Flip Signals", sub: "Buy and sell recommendations" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromAuth = params.fromAuth === "true";
  const [selected, setSelected] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/");
    }, 1500);
  };

  const handleDismiss = () => router.replace("/");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/penguin.png")}
            style={styles.penguinImg}
            resizeMode="contain"
          />
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <Text style={styles.heroTitle}>Flipr Pro</Text>
          <Text style={styles.heroSub}>
            The complete resale intelligence platform for serious flippers
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresLabel}>EVERYTHING IN PRO</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureCheckBox}>
                  <Text style={styles.featureCheckMark}>✓</Text>
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <View style={styles.planSection}>
          <Text style={styles.planLabel}>CHOOSE YOUR PLAN</Text>

          <TouchableOpacity
            style={[
              styles.planCard,
              selected === "yearly" && styles.planCardActive,
            ]}
            onPress={() => setSelected("yearly")}
          >
            <View style={styles.planRadio}>
              {selected === "yearly" && <View style={styles.planRadioDot} />}
            </View>
            <View style={styles.planInfo}>
              <View style={styles.planTitleRow}>
                <Text style={styles.planTitle}>Yearly</Text>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              </View>
              <Text style={styles.planSub}>
                $3.33 per month, billed annually
              </Text>
            </View>
            <Text
              style={[
                styles.planPrice,
                selected === "yearly" && styles.planPriceActive,
              ]}
            >
              $39.99
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selected === "monthly" && styles.planCardActive,
            ]}
            onPress={() => setSelected("monthly")}
          >
            <View style={styles.planRadio}>
              {selected === "monthly" && <View style={styles.planRadioDot} />}
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>Monthly</Text>
              <Text style={styles.planSub}>Billed every month</Text>
            </View>
            <Text
              style={[
                styles.planPrice,
                selected === "monthly" && styles.planPriceActive,
              ]}
            >
              $4.99
            </Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.ctaBtnText}>
                {selected === "yearly"
                  ? "Start Pro at $39.99 per year"
                  : "Start Pro at $4.99 per month"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.notNowText}>
              {fromAuth ? "Continue with free plan" : "Not now"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Subscriptions renew automatically unless cancelled at least 24 hours
            before the end of the current period. Manage subscriptions in your
            App Store settings.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ICE.bgElement,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: ICE.textSecondary,
    fontSize: 13,
    fontFamily: FONT.semibold,
  },

  hero: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  penguinImg: { width: 96, height: 96, borderRadius: 24, marginBottom: 4 },
  proBadge: {
    backgroundColor: ICE.primary,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proBadgeText: {
    color: "#000",
    fontSize: 11,
    fontFamily: FONT.extrabold,
    letterSpacing: 2,
  },
  heroTitle: {
    color: ICE.textPrimary,
    fontSize: 36,
    fontFamily: FONT.extrabold,
    letterSpacing: -1,
    marginTop: 4,
  },
  heroSub: {
    color: ICE.textSecondary,
    fontSize: 15,
    fontFamily: FONT.regular,
    textAlign: "center",
    lineHeight: 24,
  },

  featuresSection: { marginHorizontal: 20, marginBottom: 28 },
  featuresLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 2,
    marginBottom: 14,
  },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 20,
    width: (width - 50) / 2,
    gap: 12,
    alignItems: "center",
  },
  featureCheckBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ICE.upBg,
    justifyContent: "center",
    alignItems: "center",
  },
  featureCheckMark: { color: ICE.up, fontSize: 28, fontFamily: FONT.extrabold },
  featureTitle: {
    color: ICE.textPrimary,
    fontSize: 13,
    fontFamily: FONT.bold,
    textAlign: "center",
  },
  featureSub: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.regular,
    lineHeight: 16,
    textAlign: "center",
  },

  planSection: { paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  planLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  planCard: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardActive: { borderColor: ICE.primary },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: ICE.textMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  planRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ICE.primary,
  },
  planInfo: { flex: 1 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planTitle: { color: ICE.textPrimary, fontSize: 15, fontFamily: FONT.bold },
  planSub: {
    color: ICE.textMuted,
    fontSize: 12,
    fontFamily: FONT.regular,
    marginTop: 3,
  },
  bestValueBadge: {
    backgroundColor: ICE.upBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestValueText: {
    color: ICE.up,
    fontSize: 9,
    fontFamily: FONT.extrabold,
    letterSpacing: 0.5,
  },
  planPrice: { color: ICE.textMuted, fontSize: 17, fontFamily: FONT.bold },
  planPriceActive: { color: ICE.textPrimary },

  ctaSection: { paddingHorizontal: 20, gap: 16, alignItems: "center" },
  ctaBtn: {
    backgroundColor: ICE.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: "#000", fontSize: 16, fontFamily: FONT.extrabold },
  notNowText: { color: ICE.textMuted, fontSize: 14, fontFamily: FONT.regular },
  legal: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.regular,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
