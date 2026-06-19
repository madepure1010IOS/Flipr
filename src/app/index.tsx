import { useRouter } from "expo-router";
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
import { ICE } from "../constants/theme";

const API_URL = "https://flipr-backend-production-ac14.up.railway.app";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const CATEGORIES = [
  "All",
  "Sneakers",
  "Cards",
  "LEGO",
  "Streetwear",
  "Electronics",
  "Watches",
];

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_URL}/trending`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const navigateToItem = (item: any) => {
    router.push({
      pathname: "/item",
      params: {
        name: item.name,
        price: item.price,
        change: item.change,
        trend: item.trend,
        category: item.category,
        volume: item.volume,
      },
    });
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
              <Text style={styles.subtitle}>Resale Intelligence</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
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

        {loading && (
          <ActivityIndicator
            size="large"
            color={ICE.primary}
            style={{ marginTop: 60 }}
          />
        )}

        {/* Top Performer — full width hero card */}
        {!loading && items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TOP PERFORMER</Text>
            <TouchableOpacity
              style={styles.heroCard}
              onPress={() => navigateToItem(items[0])}
            >
              <View style={styles.heroCardTop}>
                <View style={styles.heroImageBox}>
                  <Text style={styles.heroImageLetter}>
                    {items[0].name?.charAt(0)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.trendBadge,
                    items[0].trend === "up"
                      ? styles.trendBadgeUp
                      : styles.trendBadgeDown,
                  ]}
                >
                  <Text
                    style={[
                      styles.trendBadgeText,
                      items[0].trend === "up" ? styles.up : styles.down,
                    ]}
                  >
                    {items[0].trend === "up" ? "▲" : "▼"}{" "}
                    {String(items[0].change).replace("+", "")}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroCategory}>
                {items[0].category?.toUpperCase()}
              </Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {items[0].name}
              </Text>
              <View style={styles.heroBottom}>
                <Text style={styles.heroPrice}>{items[0].price}</Text>
                <Text style={styles.heroVolume}>{items[0].volume}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>TRENDING NOW</Text>
              <Text style={styles.sectionCount}>{filtered.length} items</Text>
            </View>
            <View style={styles.grid}>
              {filtered.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridCard}
                  onPress={() => navigateToItem(item)}
                >
                  {/* Image area */}
                  <View style={styles.gridImageBox}>
                    <Text style={styles.gridImageLetter}>
                      {item.name?.charAt(0)}
                    </Text>
                    <View
                      style={[
                        styles.gridTrendDot,
                        item.trend === "up"
                          ? styles.trendDotUp
                          : styles.trendDotDown,
                      ]}
                    />
                  </View>

                  {/* Info */}
                  <Text style={styles.gridCategory}>{item.category}</Text>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* Price row */}
                  <View style={styles.gridPriceRow}>
                    <Text style={styles.gridPrice}>{item.price}</Text>
                    <Text
                      style={[
                        styles.gridChange,
                        item.trend === "up" ? styles.up : styles.down,
                      ]}
                    >
                      {item.trend === "up" ? "+" : ""}
                      {String(item.change).replace("+", "")}
                    </Text>
                  </View>
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

  // Header
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
  liveText: {
    color: ICE.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Categories
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

  // Sections
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
    marginBottom: 14,
  },
  sectionCount: { color: ICE.textMuted, fontSize: 11 },

  // Hero Card
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
    width: 56,
    height: 56,
    backgroundColor: ICE.bgElement,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageLetter: { color: ICE.textMuted, fontSize: 24, fontWeight: "800" },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  trendBadgeUp: { backgroundColor: ICE.upBg },
  trendBadgeDown: { backgroundColor: ICE.downBg },
  trendBadgeText: { fontSize: 12, fontWeight: "700" },
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

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: ICE.bgCard,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  gridImageBox: {
    width: "100%",
    height: 90,
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
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
  trendDotUp: { backgroundColor: ICE.up },
  trendDotDown: { backgroundColor: ICE.down },
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
  gridChange: { fontSize: 12, fontWeight: "600" },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
