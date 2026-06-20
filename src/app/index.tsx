import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { ICE } from "../constants/theme";

const API_URL = "https://flipr-backend-production-ac14.up.railway.app";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

// Matches the category names the backend's scanner actually assigns
// (CATEGORY_SWEEPS names in server.js), so filtering actually works.
const CATEGORIES = [
  "All",
  "Sneakers",
  "Cards",
  "Collectibles",
  "Streetwear",
  "Electronics",
  "Watches",
  "Toys & Hobbies",
];

function ItemImage({
  uri,
  fallbackLetter,
  style,
  letterStyle,
}: {
  uri?: string | null;
  fallbackLetter: string;
  style: any;
  letterStyle: any;
}) {
  const [failed, setFailed] = useState(false);
  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[style, { resizeMode: "contain" }]}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[style, styles.fallbackBox]}>
      <Text style={letterStyle}>{fallbackLetter}</Text>
    </View>
  );
}

function FlipScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? ICE.up : score >= 45 ? "#f59e0b" : ICE.down;
  const label = score >= 70 ? "🔥 HOT" : score >= 45 ? "📈 WATCH" : "💤 PASS";
  return (
    <View style={[styles.flipBadge, { borderColor: color }]}>
      <Text style={[styles.flipBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

// Spread = how far apart the cheapest and priciest listing of the same
// item are, relative to average. Bigger spread = bigger flip opportunity.
function spreadTierColor(spreadPct: number) {
  if (spreadPct >= 50) return ICE.up;
  if (spreadPct >= 25) return "#f59e0b";
  return ICE.down;
}

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDiscover = (isPoll = false) => {
    fetch(`${API_URL}/discover`)
      .then((res) => res.json())
      .then((data) => {
        // Always show whatever we got, even if stale/empty -- never block
        // the UI waiting on a scan to finish.
        if (data.results && data.results.length > 0) {
          setItems(data.results);
          setLastScanned(data.lastScanned);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
        setScanning(!!data.scanning);
        setLoading(false);

        if (data.scanning && !pollRef.current && !isPoll) {
          pollRef.current = setInterval(() => fetchDiscover(true), 8000);
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiscover();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const topItem = filtered[0];

  const navigateToItem = (item: any) => {
    router.push({
      pathname: "/item",
      params: {
        name: item.name,
        price: item.price,
        category: item.category,
        volume: item.volume,
        image: item.image || "",
      },
    });
  };

  const formatLastScanned = (iso: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.round(
      (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000,
    );
    if (diffDays <= 0) return "Updated today";
    if (diffDays === 1) return "Updated yesterday";
    return `Updated ${diffDays}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/penguin.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.appName}>Flipr</Text>
              <Text style={styles.subtitle}>
                {lastScanned
                  ? formatLastScanned(lastScanned)
                  : "Resale Intelligence"}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, scanning && styles.liveDotPulse]} />
              <Text style={styles.liveText}>
                {scanning ? "UPDATING" : "LIVE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                activeCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Initial load spinner */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={ICE.primary} />
            <Text style={styles.loadingText}>Finding flip opportunities…</Text>
          </View>
        )}

        {/* True empty state -- no cached data exists anywhere yet */}
        {!loading && scanning && items.length === 0 && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={ICE.primary} />
            <Text style={styles.loadingText}>Running first market scan…</Text>
            <Text style={styles.loadingSubtext}>
              This can take a couple minutes the very first time
            </Text>
          </View>
        )}

        {/* Top Flip Opportunity -- hero card */}
        {!loading && topItem && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>TOP FLIP OPPORTUNITY</Text>
              <FlipScoreBadge score={topItem.flipScore || 0} />
            </View>
            <TouchableOpacity
              style={styles.heroCard}
              onPress={() => navigateToItem(topItem)}
            >
              <View style={styles.heroCardTop}>
                <ItemImage
                  uri={topItem.image}
                  fallbackLetter={topItem.name?.charAt(0)}
                  style={styles.heroImageBox}
                  letterStyle={styles.heroImageLetter}
                />
                <View style={styles.heroRight}>
                  {topItem.spreadPct != null && (
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            spreadTierColor(topItem.spreadPct) + "33",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.trendBadgeText,
                          { color: spreadTierColor(topItem.spreadPct) },
                        ]}
                      >
                        ↔ {Math.round(topItem.spreadPct)}% spread
                      </Text>
                    </View>
                  )}
                  <Text style={styles.heroScore}>
                    Score: {topItem.flipScore || "—"}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroCategory}>
                {topItem.category?.toUpperCase()}
              </Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {topItem.name}
              </Text>
              <View style={styles.heroBottom}>
                <Text style={styles.heroPrice}>{topItem.price}</Text>
                <Text style={styles.heroVolume}>{topItem.volume}</Text>
              </View>
              {topItem.minPrice != null && topItem.maxPrice != null && (
                <Text style={styles.heroRange}>
                  Range: ${topItem.minPrice} – ${topItem.maxPrice}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Grid -- all opportunities ranked by flip score */}
        {!loading && filtered.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>ALL OPPORTUNITIES</Text>
              <Text style={styles.sectionCount}>{filtered.length} found</Text>
            </View>
            <View style={styles.grid}>
              {filtered.slice(1).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridCard}
                  onPress={() => navigateToItem(item)}
                >
                  <View style={styles.gridImageWrap}>
                    <ItemImage
                      uri={item.image}
                      fallbackLetter={item.name?.charAt(0)}
                      style={styles.gridImageBox}
                      letterStyle={styles.gridImageLetter}
                    />
                    {item.flipScore != null && (
                      <View
                        style={[
                          styles.gridTrendDot,
                          {
                            backgroundColor:
                              item.flipScore >= 70
                                ? ICE.up
                                : item.flipScore >= 45
                                  ? "#f59e0b"
                                  : ICE.down,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={styles.gridCategory}>{item.category}</Text>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.gridPriceRow}>
                    <Text style={styles.gridPrice}>{item.price}</Text>
                    {item.spreadPct != null && (
                      <Text
                        style={[
                          styles.gridChange,
                          { color: spreadTierColor(item.spreadPct) },
                        ]}
                      >
                        {Math.round(item.spreadPct)}% spread
                      </Text>
                    )}
                  </View>
                  {item.flipScore != null && (
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Flip Score</Text>
                      <Text
                        style={[
                          styles.scoreValue,
                          item.flipScore >= 70
                            ? styles.up
                            : item.flipScore >= 45
                              ? styles.warn
                              : styles.down,
                        ]}
                      >
                        {item.flipScore}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg: { width: 38, height: 38, borderRadius: 10 },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: ICE.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 11, color: ICE.textMuted, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsIcon: { fontSize: 18 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ICE.primaryGlow,
    borderWidth: 1,
    borderColor: ICE.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ICE.primary,
  },
  liveDotPulse: { backgroundColor: "#f59e0b" },
  liveText: {
    color: ICE.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  categoryContainer: { paddingHorizontal: 20, gap: 8, marginBottom: 28 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ICE.bgElement,
  },
  categoryPillActive: { backgroundColor: ICE.primary },
  categoryText: { color: ICE.textMuted, fontSize: 13, fontWeight: "500" },
  categoryTextActive: { color: "#000", fontWeight: "700" },

  loadingWrap: {
    marginTop: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: ICE.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  loadingSubtext: {
    color: ICE.textMuted,
    fontSize: 12,
  },

  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  sectionCount: { color: ICE.textMuted, fontSize: 11 },

  flipBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flipBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  heroCard: {
    backgroundColor: ICE.bgCard,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  heroCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  heroImageBox: {
    width: 72,
    height: 72,
    backgroundColor: ICE.bgElement,
    borderRadius: 14,
  },
  heroImageLetter: { color: ICE.textMuted, fontSize: 28, fontWeight: "800" },
  fallbackBox: { justifyContent: "center", alignItems: "center" },
  heroRight: { alignItems: "flex-end", gap: 8 },
  heroScore: { color: ICE.textMuted, fontSize: 11, fontWeight: "600" },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  trendBadgeText: { fontSize: 11, fontWeight: "700" },
  heroCategory: {
    color: ICE.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroName: {
    color: ICE.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  heroBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  heroPrice: {
    color: ICE.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroVolume: { color: ICE.textMuted, fontSize: 12 },
  heroRange: { color: ICE.textMuted, fontSize: 11, marginTop: 2 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: ICE.bgCard,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  gridImageWrap: { position: "relative", marginBottom: 10 },
  gridImageBox: {
    width: "100%",
    height: 90,
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
  },
  gridImageLetter: { color: ICE.textMuted, fontSize: 32, fontWeight: "800" },
  gridTrendDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridCategory: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  gridName: {
    color: ICE.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  gridPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  gridPrice: { color: ICE.textPrimary, fontSize: 15, fontWeight: "800" },
  gridChange: { fontSize: 11, fontWeight: "600" },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: ICE.bgElement,
  },
  scoreLabel: { color: ICE.textMuted, fontSize: 10, fontWeight: "600" },
  scoreValue: { fontSize: 13, fontWeight: "800" },

  up: { color: ICE.up },
  down: { color: ICE.down },
  warn: { color: "#f59e0b" },
});
