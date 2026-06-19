import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICE } from "../constants/theme";
const API_URL = "https://flipr-backend-production-ac14.up.railway.app";
const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const navigateToItem = (item: any) => {
    router.push({
      pathname: "/item",
      params: {
        name: item.name,
        price: item.price || `$${item.avgPrice}`,
        change: item.change || `+${item.changePercent}%`,
        trend: item.trend,
        category: item.category || "General",
        volume: item.volume || `${item.totalSold} sold`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require("../../assets/images/penguin.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.appName}>Flipr</Text>
            <Text style={styles.subtitle}>Search any item</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Jordan 1, Charizard PSA, LEGO..."
            placeholderTextColor={ICE.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
              }}
            >
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={ICE.primary}
            style={styles.loader}
          />
        )}

        {!loading && searched && results.length > 0 && (
          <>
            <Text style={styles.resultsLabel}>Results for "{query}"</Text>
            {results.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => navigateToItem(item)}
              >
                <View style={styles.cardImageBox}>
                  <Text style={styles.cardImageLetter}>
                    {item.name?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.category}>
                    {item.category} · {item.totalSold || item.volume} sold
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.price}>
                    ${item.avgPrice || item.price}
                  </Text>
                  <View
                    style={[
                      styles.changePill,
                      item.trend === "up"
                        ? styles.changePillUp
                        : styles.changePillDown,
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        item.trend === "up" ? styles.up : styles.down,
                      ]}
                    >
                      {item.trend === "up" ? "▲" : "▼"}{" "}
                      {item.changePercent || item.change}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!loading && searched && results.length === 0 && (
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/penguin.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different search term</Text>
          </View>
        )}

        {!loading && !searched && (
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/penguin.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Search anything</Text>
            <Text style={styles.emptyText}>
              Find out if an item is worth flipping
            </Text>

            {/* Quick searches */}
            <View style={styles.quickSearches}>
              <Text style={styles.quickLabel}>POPULAR SEARCHES</Text>
              <View style={styles.quickGrid}>
                {[
                  "Jordan 1",
                  "Charizard",
                  "LEGO Technic",
                  "Supreme",
                  "PS5",
                  "Rolex",
                ].map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.quickPill}
                    onPress={() => {
                      setQuery(term);
                    }}
                  >
                    <Text style={styles.quickText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 10 },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: ICE.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 11, color: ICE.textMuted, marginTop: 1 },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ICE.bgCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: ICE.border,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, paddingVertical: 13, color: ICE.textPrimary, fontSize: 14 },
  clearBtn: { color: ICE.textMuted, fontSize: 14, paddingHorizontal: 4 },
  searchButton: {
    backgroundColor: ICE.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchButtonText: { color: "#000", fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  loader: { marginTop: 40 },
  resultsLabel: {
    color: ICE.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ICE.border,
    gap: 12,
  },
  cardImageBox: {
    width: 48,
    height: 48,
    backgroundColor: ICE.bgElement,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageLetter: { color: ICE.border, fontSize: 20, fontWeight: "800" },
  cardContent: { flex: 1 },
  itemName: { color: ICE.textPrimary, fontSize: 14, fontWeight: "600" },
  category: { color: ICE.textMuted, fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: "flex-end", gap: 5 },
  price: { color: ICE.textPrimary, fontSize: 16, fontWeight: "800" },
  changePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  changePillUp: { backgroundColor: ICE.upBg },
  changePillDown: { backgroundColor: ICE.downBg },
  changeText: { fontSize: 11, fontWeight: "700" },
  up: { color: ICE.up },
  down: { color: ICE.down },
  emptyState: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyImage: { width: 120, height: 120, marginBottom: 8 },
  emptyTitle: { color: ICE.textPrimary, fontSize: 18, fontWeight: "700" },
  emptyText: { color: ICE.textMuted, fontSize: 14 },
  quickSearches: { marginTop: 24, width: "100%" },
  quickLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: "center",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  quickPill: {
    backgroundColor: ICE.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: ICE.border,
  },
  quickText: { color: ICE.textSecondary, fontSize: 13, fontWeight: "600" },
});
