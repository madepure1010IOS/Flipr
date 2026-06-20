import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { supabase } from "../supabase";

const { width } = Dimensions.get("window");

interface PriceSnapshot {
  avgPrice: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  totalSold: number | null;
  priceChangePct?: number;
  flipScore?: number;
  trend?: string;
  scored: boolean;
  source: string;
  lastUpdated?: string;
  message?: string;
}

export default function ItemScreen() {
  const { name, price, change, trend, category, volume, image } =
    useLocalSearchParams();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  const imageUri =
    image && String(image).startsWith("http") ? String(image) : null;

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://flipr-backend-production-ac14.up.railway.app/pricehistory?name=${encodeURIComponent(String(name))}`,
    )
      .then((res) => res.json())
      .then((data: PriceSnapshot) => {
        setSnapshot(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [name]);

  const rawPrice = parseFloat(String(price).replace("$", "")) || 0;
  const isScored = snapshot?.scored === true;
  const isUp = (snapshot?.trend ?? trend) === "up";

  const displayAvg = snapshot?.avgPrice ?? rawPrice;
  const displayMin = snapshot?.minPrice ?? Math.round(displayAvg * 0.85);
  const displayMax = snapshot?.maxPrice ?? Math.round(displayAvg * 1.15);
  const displaySold = snapshot?.totalSold ?? null;
  const flipScore = snapshot?.flipScore ?? null;

  const rawChange =
    snapshot?.priceChangePct ??
    parseFloat(String(change).replace("%", "").replace("+", "")) ??
    0;
  const diffPct = Math.abs(rawChange).toFixed(1);
  const lineColor = isUp ? ICE.up : ICE.down;

  const scoreColor =
    flipScore != null
      ? flipScore >= 70
        ? ICE.up
        : flipScore >= 45
          ? "#f59e0b"
          : ICE.down
      : ICE.textMuted;
  const scoreLabel =
    flipScore != null
      ? flipScore >= 70
        ? "🔥 Hot Flip"
        : flipScore >= 45
          ? "📈 Worth Watching"
          : "💤 Low Signal"
      : null;

  const handleAddToWatchlist = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("watchlist").insert({
      user_id: user.id,
      item_name: name,
      category,
      price,
      change,
      trend,
      volume,
    });
    setAdded(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImageWrap}>
          {imageUri && !imgFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.heroImage}
              resizeMode="contain"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View style={styles.heroImageFallback}>
              <Text style={styles.heroImageFallbackText}>
                {String(name).charAt(0)}
              </Text>
            </View>
          )}

          <View style={styles.navOverlay}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            {isScored && (
              <View
                style={[
                  styles.signalBadge,
                  isUp ? styles.signalUp : styles.signalDown,
                ]}
              >
                <Text
                  style={[styles.signalText, isUp ? styles.up : styles.down]}
                >
                  {isUp ? "BUY" : "AVOID"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Category label */}
        <View style={styles.categoryRow}>
          <Text style={styles.navCategory}>
            {String(category).toUpperCase()}
          </Text>
          {!loading && !isScored && (
            <View style={styles.notTrackedBadge}>
              <Text style={styles.notTrackedText}>NOT YET TRACKED</Text>
            </View>
          )}
        </View>

        {/* Price Hero */}
        <View style={styles.priceHero}>
          <Text style={styles.itemName}>{name}</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={ICE.primary} />
              <Text style={styles.loadingText}>Loading price data…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.priceText}>
                {displayAvg ? `$${displayAvg}` : "—"}
              </Text>

              {isScored ? (
                <View
                  style={[styles.changePill, { backgroundColor: lineColor }]}
                >
                  <Text style={styles.changePillText}>
                    {isUp ? "+" : "-"}
                    {diffPct}%
                  </Text>
                </View>
              ) : null}

              <Text style={styles.volumeText}>
                {isScored
                  ? `${displaySold ?? "—"} sold · tracked daily`
                  : snapshot?.source === "ebay_live"
                    ? `${displaySold ?? "—"} active listings · live eBay data`
                    : snapshot?.message || "No pricing data available"}
              </Text>

              {displayAvg ? (
                <View style={styles.priceRangeRow}>
                  <View style={styles.priceRangeItem}>
                    <Text style={styles.priceRangeLabel}>LOW</Text>
                    <Text style={[styles.priceRangeValue, styles.down]}>
                      ${displayMin}
                    </Text>
                  </View>
                  <View style={styles.priceRangeDivider} />
                  <View style={styles.priceRangeItem}>
                    <Text style={styles.priceRangeLabel}>AVG</Text>
                    <Text style={styles.priceRangeValue}>${displayAvg}</Text>
                  </View>
                  <View style={styles.priceRangeDivider} />
                  <View style={styles.priceRangeItem}>
                    <Text style={styles.priceRangeLabel}>HIGH</Text>
                    <Text style={[styles.priceRangeValue, styles.up]}>
                      ${displayMax}
                    </Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Flip Score — only for scanner-discovered items */}
        {!loading && isScored && flipScore != null && (
          <View style={styles.scoreSection}>
            <View style={styles.scoreCard}>
              <View>
                <Text style={styles.scoreCardLabel}>FLIP SCORE</Text>
                <Text style={[styles.scoreCardValue, { color: scoreColor }]}>
                  {flipScore}
                  <Text style={styles.scoreCardMax}>/100</Text>
                </Text>
              </View>
              <View
                style={[styles.scoreCardBadge, { borderColor: scoreColor }]}
              >
                <Text
                  style={[styles.scoreCardBadgeText, { color: scoreColor }]}
                >
                  {scoreLabel}
                </Text>
              </View>
            </View>
            {snapshot?.lastUpdated && (
              <Text style={styles.lastUpdatedText}>
                Last scanned {snapshot.lastUpdated}
              </Text>
            )}
          </View>
        )}

        {/* Not tracked explainer */}
        {!loading && !isScored && displayAvg ? (
          <View style={styles.untrackedSection}>
            <Text style={styles.untrackedTitle}>
              This item isn't tracked yet
            </Text>
            <Text style={styles.untrackedBody}>
              Flipr's daily scanner hasn't picked up this exact item, so there's
              no flip score yet. Pricing above reflects current live eBay
              listings. Items that show strong demand patterns get added to
              Discover automatically.
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Add to Watchlist */}
        <View style={styles.watchlistSection}>
          <TouchableOpacity
            style={[styles.watchlistBtn, added && styles.watchlistBtnAdded]}
            onPress={handleAddToWatchlist}
            disabled={added}
          >
            <Text
              style={[
                styles.watchlistBtnText,
                added && styles.watchlistBtnTextAdded,
              ]}
            >
              {added ? "✓ Added to Watchlist" : "Add to Watchlist"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  heroImageWrap: {
    width: width,
    height: 280,
    backgroundColor: ICE.bgCard,
    position: "relative",
  },
  heroImage: { width: "100%", height: "100%" },
  heroImageFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ICE.bgElement,
  },
  heroImageFallbackText: {
    fontSize: 72,
    fontFamily: FONT.extrabold,
    color: ICE.textMuted,
  },

  navOverlay: {
    position: "absolute",
    top: 12,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 20, lineHeight: 22 },

  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  signalUp: { backgroundColor: ICE.upBg, borderColor: ICE.upBorder },
  signalDown: { backgroundColor: ICE.downBg, borderColor: ICE.downBorder },
  signalText: { fontSize: 11, fontFamily: FONT.extrabold, letterSpacing: 1 },

  categoryRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navCategory: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.bold,
    letterSpacing: 2,
  },
  notTrackedBadge: {
    backgroundColor: ICE.bgElement,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  notTrackedText: {
    color: ICE.textMuted,
    fontSize: 9,
    fontFamily: FONT.extrabold,
    letterSpacing: 1,
  },

  priceHero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 8,
  },
  itemName: { color: ICE.textSecondary, fontSize: 14, fontFamily: FONT.medium },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: { color: ICE.textMuted, fontSize: 13, fontFamily: FONT.regular },
  priceText: {
    color: ICE.textPrimary,
    fontSize: 52,
    fontFamily: FONT.extrabold,
    letterSpacing: -2,
  },
  changePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  changePillText: { color: "#000", fontFamily: FONT.extrabold, fontSize: 13 },
  volumeText: { color: ICE.textMuted, fontSize: 12, fontFamily: FONT.regular },

  priceRangeRow: {
    flexDirection: "row",
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  priceRangeItem: { flex: 1, alignItems: "center", gap: 4 },
  priceRangeDivider: { width: 1, backgroundColor: ICE.bgElement },
  priceRangeLabel: {
    color: ICE.textMuted,
    fontSize: 9,
    fontFamily: FONT.bold,
    letterSpacing: 1.5,
  },
  priceRangeValue: {
    color: ICE.textPrimary,
    fontSize: 16,
    fontFamily: FONT.bold,
  },

  scoreSection: { paddingHorizontal: 20, marginBottom: 24 },
  scoreCard: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreCardLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  scoreCardValue: { fontSize: 36, fontFamily: FONT.extrabold },
  scoreCardMax: {
    fontSize: 16,
    color: ICE.textMuted,
    fontFamily: FONT.semibold,
  },
  scoreCardBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreCardBadgeText: { fontSize: 12, fontFamily: FONT.bold },
  lastUpdatedText: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.regular,
    marginTop: 8,
    textAlign: "center",
  },

  untrackedSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  untrackedTitle: {
    color: ICE.textPrimary,
    fontSize: 15,
    fontFamily: FONT.bold,
    marginBottom: 6,
  },
  untrackedBody: {
    color: ICE.textMuted,
    fontSize: 13,
    fontFamily: FONT.regular,
    lineHeight: 19,
  },

  divider: {
    height: 1,
    backgroundColor: ICE.bgElement,
    marginHorizontal: 20,
    marginBottom: 28,
  },

  watchlistSection: { paddingHorizontal: 20, marginBottom: 28 },
  watchlistBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ICE.primary,
    backgroundColor: ICE.upBg,
  },
  watchlistBtnAdded: {
    borderColor: ICE.textMuted,
    backgroundColor: ICE.bgElement,
  },
  watchlistBtnText: { color: ICE.primary, fontSize: 15, fontFamily: FONT.bold },
  watchlistBtnTextAdded: { color: ICE.textMuted },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
