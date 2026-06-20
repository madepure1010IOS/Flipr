import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICE } from "../constants/theme";
import { supabase } from "../supabase";

const API_URL = "https://flipr-backend-production-ac14.up.railway.app";

interface PriceSnapshot {
  avgPrice: number | null;
  minPrice?: number;
  maxPrice?: number;
  listingVolume?: number;
  spreadPct?: number;
  flipScore?: number;
  scored: boolean;
  source: "cached" | "ebay_live" | "none";
  lastUpdated?: string;
  message?: string;
}

export default function ItemScreen() {
  const router = useRouter();
  const { name, price, category, volume, image } = useLocalSearchParams<{
    name: string;
    price: string;
    category: string;
    volume: string;
    image: string;
  }>();

  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlisted, setWatchlisted] = useState(false);

  useEffect(() => {
    if (!name) return;
    fetch(`${API_URL}/pricehistory?name=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => setSnapshot(data))
      .catch(() => setSnapshot(null))
      .finally(() => setLoading(false));
  }, [name]);

  const rawPrice = price
    ? parseFloat(String(price).replace(/[^0-9.]/g, ""))
    : null;

  const displayAvg = snapshot?.avgPrice ?? rawPrice;
  const displayMin = snapshot?.minPrice ?? null;
  const displayMax = snapshot?.maxPrice ?? null;
  const displayVolume =
    snapshot?.listingVolume ??
    (volume ? parseInt(String(volume).replace(/[^0-9]/g, ""), 10) : null);

  const isScored = snapshot?.scored === true;
  const flipScore = snapshot?.flipScore ?? null;
  const spreadPct = snapshot?.spreadPct ?? null;

  // Flip score tier -- the single primary signal now that there's no
  // time-based trend. Reused for both the image overlay and score card.
  const scoreColor =
    flipScore == null
      ? ICE.textMuted
      : flipScore >= 70
        ? ICE.up
        : flipScore >= 45
          ? "#f59e0b"
          : ICE.down;
  const scoreLabel =
    flipScore == null
      ? "Not yet scored"
      : flipScore >= 70
        ? "Strong Flip Candidate"
        : flipScore >= 45
          ? "Worth Watching"
          : "Low Signal";
  const shortScoreLabel =
    flipScore == null
      ? null
      : flipScore >= 70
        ? "🔥 HOT"
        : flipScore >= 45
          ? "📈 WATCH"
          : "💤 PASS";

  // Spread tier -- how far apart the cheapest and priciest active listing
  // of this product are, relative to average. The actual flip signal.
  const spreadColor =
    spreadPct == null
      ? ICE.textMuted
      : spreadPct >= 50
        ? ICE.up
        : spreadPct >= 25
          ? "#f59e0b"
          : ICE.textMuted;

  const handleAddToWatchlist = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await supabase.from("watchlist").insert({
        user_id: user.id,
        item_name: name,
        category,
        price: displayAvg,
        volume: displayVolume,
        image: image || null,
      });
      setWatchlisted(true);
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: String(image) }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Text style={styles.imageFallbackLetter}>
                {String(name)?.charAt(0)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          {isScored && shortScoreLabel && (
            <View
              style={[
                styles.signalBadge,
                {
                  borderColor: scoreColor,
                  backgroundColor: "rgba(0,0,0,0.45)",
                },
              ]}
            >
              <Text style={[styles.signalText, { color: scoreColor }]}>
                {shortScoreLabel}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{String(category)?.toUpperCase()}</Text>
          <Text style={styles.name}>{name}</Text>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={ICE.primary} />
            </View>
          ) : (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {displayAvg != null ? `$${displayAvg}` : "—"}
                </Text>
                {isScored && spreadPct != null && (
                  <View
                    style={[
                      styles.changePill,
                      { backgroundColor: spreadColor },
                    ]}
                  >
                    <Text style={styles.changePillText}>
                      {Math.round(spreadPct)}% spread
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.volumeText}>
                {isScored
                  ? `${displayVolume ?? "—"} listed · tracked daily`
                  : snapshot?.source === "ebay_live"
                    ? `${displayVolume ?? "—"} active listings · live eBay data`
                    : snapshot?.message || "No pricing data available"}
              </Text>

              {displayMin != null && displayMax != null && (
                <View style={styles.rangeCard}>
                  <View style={styles.rangeItem}>
                    <Text style={[styles.rangeValue, styles.down]}>
                      ${displayMin}
                    </Text>
                    <Text style={styles.rangeLabel}>LOW</Text>
                  </View>
                  <View style={styles.rangeDivider} />
                  <View style={styles.rangeItem}>
                    <Text style={styles.rangeValue}>${displayAvg}</Text>
                    <Text style={styles.rangeLabel}>AVG</Text>
                  </View>
                  <View style={styles.rangeDivider} />
                  <View style={styles.rangeItem}>
                    <Text style={[styles.rangeValue, styles.up]}>
                      ${displayMax}
                    </Text>
                    <Text style={styles.rangeLabel}>HIGH</Text>
                  </View>
                </View>
              )}

              {isScored && flipScore != null ? (
                <View style={styles.scoreSection}>
                  <View style={styles.scoreSectionHeader}>
                    <Text style={styles.scoreSectionLabel}>FLIP SCORE</Text>
                    <View
                      style={[
                        styles.scoreCardBadge,
                        { borderColor: scoreColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreCardBadgeText,
                          { color: scoreColor },
                        ]}
                      >
                        {scoreLabel}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.scoreBarTrack}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        {
                          width: `${Math.min(flipScore, 100)}%`,
                          backgroundColor: scoreColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreBarValue}>{flipScore} / 100</Text>
                  <Text style={styles.scoreExplainer}>
                    Based on how many of this item are currently listed on eBay
                    and how wide the price gap is between the cheapest and
                    priciest listing of the same item.
                  </Text>
                </View>
              ) : (
                <View style={styles.notTrackedCard}>
                  <Text style={styles.notTrackedTitle}>Not yet tracked</Text>
                  <Text style={styles.notTrackedText}>
                    Flipr's daily scanner hasn't picked up this exact item yet.
                    The numbers above are a live snapshot pulled directly from
                    eBay just now.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.watchlistBtn,
                  watchlisted && styles.watchlistBtnActive,
                ]}
                onPress={handleAddToWatchlist}
                disabled={watchlisted}
              >
                <Text
                  style={[
                    styles.watchlistBtnText,
                    watchlisted && styles.watchlistBtnTextActive,
                  ]}
                >
                  {watchlisted ? "✓ Added to Watchlist" : "+ Add to Watchlist"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  imageWrap: {
    width: "100%",
    height: 320,
    backgroundColor: ICE.bgElement,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { justifyContent: "center", alignItems: "center" },
  imageFallbackLetter: {
    fontSize: 64,
    fontWeight: "800",
    color: ICE.textMuted,
  },

  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  signalBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  signalText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },

  content: { padding: 20, gap: 4 },
  category: {
    color: ICE.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  name: {
    color: ICE.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 8,
  },

  loadingWrap: { paddingVertical: 30, alignItems: "center" },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  price: {
    color: ICE.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  changePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  changePillText: { color: "#000", fontSize: 12, fontWeight: "800" },

  volumeText: {
    color: ICE.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  rangeCard: {
    flexDirection: "row",
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 18,
  },
  rangeItem: { flex: 1, alignItems: "center", gap: 4 },
  rangeDivider: { width: 1, backgroundColor: ICE.bgElement },
  rangeValue: { color: ICE.textPrimary, fontSize: 16, fontWeight: "700" },
  rangeLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  scoreSection: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    gap: 8,
  },
  scoreSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreSectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  scoreCardBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreCardBadgeText: { fontSize: 10, fontWeight: "800" },
  scoreBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ICE.bgElement,
    overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: 4 },
  scoreBarValue: { color: ICE.textPrimary, fontSize: 13, fontWeight: "700" },
  scoreExplainer: {
    color: ICE.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  notTrackedCard: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    gap: 4,
  },
  notTrackedTitle: { color: ICE.textPrimary, fontSize: 14, fontWeight: "700" },
  notTrackedText: { color: ICE.textMuted, fontSize: 12, lineHeight: 17 },

  watchlistBtn: {
    backgroundColor: ICE.bgElement,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  watchlistBtnActive: { backgroundColor: ICE.primaryGlow },
  watchlistBtnText: { color: ICE.textPrimary, fontSize: 14, fontWeight: "700" },
  watchlistBtnTextActive: { color: ICE.primary },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
