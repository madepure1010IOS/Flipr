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
import { FONT, ICE } from "../constants/theme";

const API_URL = "https://flipr-backend-production-ac14.up.railway.app";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

interface SubItem {
  name: string;
  image: string | null;
  activeListings: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  price: string;
  category: string;
}

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

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  const runSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setError(false);

    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToItem = (item: SubItem) => {
    router.push({
      pathname: "/item",
      params: {
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image || "",
        volume: `${item.activeListings} listed`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search any item, e.g. Lego Star Wars"
            placeholderTextColor={ICE.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={runSearch}
          disabled={loading || query.trim().length === 0}
        >
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Empty / pre-search state */}
        {!searched && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Search the market</Text>
            <Text style={styles.emptyBody}>
              Type any item — a brand, a set, a model — and we'll pull every
              real sub-item currently listed on eBay, with how many are on the
              market and what good-condition ones are going for.
            </Text>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={ICE.primary} />
            <Text style={styles.loadingText}>Searching eBay…</Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyBody}>
              Couldn't reach the search service. Try again in a moment.
            </Text>
          </View>
        )}

        {/* No results */}
        {!loading && !error && searched && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyBody}>
              Nothing matched "{query}" on eBay right now. Try a broader search
              term.
            </Text>
          </View>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {results.length} ITEM{results.length !== 1 ? "S" : ""} FOUND
            </Text>
            <View style={styles.grid}>
              {results.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => navigateToItem(item)}
                >
                  <ItemImage
                    uri={item.image}
                    fallbackLetter={item.name?.charAt(0)}
                    style={styles.cardImage}
                    letterStyle={styles.cardImageLetter}
                  />
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <View style={styles.cardPriceRow}>
                    <Text style={styles.cardAvgLabel}>AVG</Text>
                    <Text style={styles.cardAvgPrice}>${item.avgPrice}</Text>
                  </View>
                  <Text style={styles.cardRange}>
                    ${item.minPrice} – ${item.maxPrice}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.listingDot} />
                    <Text style={styles.cardListings}>
                      {item.activeListings} on market
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

  searchBarWrap: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    color: ICE.textPrimary,
    fontSize: 14,
    fontFamily: FONT.medium,
    height: "100%",
  },
  clearIcon: { color: ICE.textMuted, fontSize: 14, padding: 4 },
  searchBtn: {
    backgroundColor: ICE.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: { color: "#000", fontFamily: FONT.bold, fontSize: 14 },

  emptyState: {
    paddingHorizontal: 32,
    marginTop: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: ICE.textPrimary,
    fontSize: 17,
    fontFamily: FONT.bold,
  },
  emptyBody: {
    color: ICE.textMuted,
    fontSize: 13,
    fontFamily: FONT.regular,
    textAlign: "center",
    lineHeight: 19,
  },

  loadingWrap: {
    marginTop: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: ICE.textMuted,
    fontSize: 14,
    fontFamily: FONT.medium,
  },

  resultsSection: { paddingHorizontal: 20, marginTop: 8 },
  resultsLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 2,
    marginBottom: 14,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: ICE.bgCard,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  cardImage: {
    width: "100%",
    height: 90,
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardImageLetter: {
    color: ICE.textMuted,
    fontSize: 32,
    fontFamily: FONT.extrabold,
  },
  fallbackBox: { justifyContent: "center", alignItems: "center" },
  cardCategory: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.semibold,
    letterSpacing: 1,
  },
  cardName: {
    color: ICE.textPrimary,
    fontSize: 13,
    fontFamily: FONT.semibold,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  cardAvgLabel: {
    color: ICE.textMuted,
    fontSize: 9,
    fontFamily: FONT.bold,
    letterSpacing: 1,
  },
  cardAvgPrice: {
    color: ICE.textPrimary,
    fontSize: 17,
    fontFamily: FONT.extrabold,
  },
  cardRange: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.regular,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ICE.bgElement,
  },
  listingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ICE.primary,
  },
  cardListings: {
    color: ICE.textSecondary,
    fontSize: 11,
    fontFamily: FONT.semibold,
  },
});
