import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://localhost:3000";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

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

  const upCount = items.filter((i) => i.trend === "up").length;
  const downCount = items.filter((i) => i.trend === "down").length;

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
          <View>
            <Text style={styles.logo}>FlipTracker</Text>
            <Text style={styles.subtitle}>Resale Market Intelligence</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Market Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>MARKET OVERVIEW</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNumber}>{upCount}</Text>
              <Text style={styles.overviewStatLabel}>Uptrend</Text>
              <View
                style={[styles.overviewBar, { backgroundColor: "#00ff88" }]}
              />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNumber}>{downCount}</Text>
              <Text style={styles.overviewStatLabel}>Downtrend</Text>
              <View
                style={[styles.overviewBar, { backgroundColor: "#ff4444" }]}
              />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewNumber}>{items.length}</Text>
              <Text style={styles.overviewStatLabel}>Tracked</Text>
              <View
                style={[styles.overviewBar, { backgroundColor: "#f0a500" }]}
              />
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

        {/* Top Performer */}
        {!loading && items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performer</Text>
            </View>
            <TouchableOpacity
              style={styles.topCard}
              onPress={() => navigateToItem(items[0])}
            >
              <View style={styles.topCardImagePlaceholder}>
                <Text style={styles.topCardImageText}>
                  {items[0].category?.charAt(0)}
                </Text>
              </View>
              <View style={styles.topCardInfo}>
                <Text style={styles.topCardCategory}>
                  {items[0].category?.toUpperCase()}
                </Text>
                <Text style={styles.topCardName}>{items[0].name}</Text>
                <View style={styles.topCardBottom}>
                  <Text style={styles.topCardPrice}>{items[0].price}</Text>
                  <View
                    style={[
                      styles.changePill,
                      items[0].trend === "up"
                        ? styles.changePillUp
                        : styles.changePillDown,
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        items[0].trend === "up" ? styles.up : styles.down,
                      ]}
                    >
                      {items[0].trend === "up" ? "+" : ""}
                      {items[0].change}
                    </Text>
                  </View>
                </View>
                <Text style={styles.topCardVolume}>{items[0].volume}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid Section */}
        {!loading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeCategory === "All" ? "Trending Now" : activeCategory}
                <Text style={styles.sectionCount}> {filtered.length}</Text>
              </Text>
              <TouchableOpacity>
                <Text style={styles.showAll}>Show all</Text>
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator color="#00ff88" />}

            <View style={styles.grid}>
              {filtered.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridCard}
                  onPress={() => navigateToItem(item)}
                >
                  <View style={styles.gridImageBox}>
                    <Text style={styles.gridImageLetter}>
                      {item.name?.charAt(0)}
                    </Text>
                    <View
                      style={[
                        styles.trendIndicator,
                        item.trend === "up" ? styles.trendUp : styles.trendDown,
                      ]}
                    >
                      <Text style={styles.trendIndicatorText}>
                        {item.trend === "up" ? "▲" : "▼"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.gridPrice}>{item.price}</Text>
                  <Text
                    style={[
                      styles.gridChange,
                      item.trend === "up" ? styles.up : styles.down,
                    ]}
                  >
                    {item.trend === "up" ? "+" : ""}
                    {item.change}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111318",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2a1a",
    borderWidth: 1,
    borderColor: "#00ff88",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00ff88",
  },
  liveText: {
    color: "#00ff88",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  overviewCard: {
    marginHorizontal: 20,
    backgroundColor: "#1c1f26",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#252830",
  },
  overviewLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  overviewStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  overviewNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  overviewStatLabel: {
    color: "#555",
    fontSize: 11,
  },
  overviewBar: {
    height: 3,
    width: 30,
    borderRadius: 2,
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#252830",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1c1f26",
    borderWidth: 1,
    borderColor: "#252830",
  },
  categoryPillActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  categoryText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionCount: {
    color: "#555",
    fontSize: 16,
    fontWeight: "400",
  },
  showAll: {
    color: "#00ff88",
    fontSize: 13,
    fontWeight: "600",
  },
  topCard: {
    marginHorizontal: 20,
    backgroundColor: "#1c1f26",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252830",
  },
  topCardImagePlaceholder: {
    width: 120,
    backgroundColor: "#252830",
    justifyContent: "center",
    alignItems: "center",
  },
  topCardImageText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#333",
  },
  topCardInfo: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  topCardCategory: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  topCardName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    lineHeight: 22,
  },
  topCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  topCardPrice: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changePillUp: { backgroundColor: "#0a2a1a" },
  changePillDown: { backgroundColor: "#2a0a0a" },
  changeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  topCardVolume: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: "#1c1f26",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#252830",
  },
  gridImageBox: {
    width: "100%",
    height: 100,
    backgroundColor: "#252830",
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gridImageLetter: {
    fontSize: 36,
    fontWeight: "800",
    color: "#333",
  },
  trendIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  trendUp: { backgroundColor: "#0a2a1a" },
  trendDown: { backgroundColor: "#2a0a0a" },
  trendIndicatorText: {
    fontSize: 10,
    color: "#fff",
  },
  gridName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 6,
  },
  gridPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  gridChange: {
    fontSize: 12,
    fontWeight: "600",
  },
  up: { color: "#00ff88" },
  down: { color: "#ff4444" },
});
