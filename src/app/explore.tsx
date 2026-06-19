import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockSearch = (query: string) => {
  return [
    {
      id: 1,
      name: query,
      category: "Sneakers",
      price: "$285",
      change: "+12%",
      trend: "up",
      volume: "342 sold",
    },
    {
      id: 2,
      name: `${query} (Used)`,
      category: "Sneakers",
      price: "$210",
      change: "-3%",
      trend: "down",
      volume: "89 sold",
    },
    {
      id: 3,
      name: `${query} (DS)`,
      category: "Sneakers",
      price: "$320",
      change: "+18%",
      trend: "up",
      volume: "156 sold",
    },
  ];
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    setTimeout(() => {
      setResults(mockSearch(query));
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FlipTracker</Text>
        <Text style={styles.subtitle}>Search any item</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search items... (e.g. Jordan 1, Charizard)"
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#00ff88"
            style={styles.loader}
          />
        )}

        {!loading && searched && results.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Results for "{query}"</Text>
            {results.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.category}>
                    {item.category} · {item.volume}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text
                    style={[
                      styles.change,
                      item.trend === "up" ? styles.up : styles.down,
                    ]}
                  >
                    {item.trend === "up" ? "📈" : "📉"} {item.change}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!loading && !searched && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              Search any item to see{"\n"}its flip potential
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00ff88",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchButton: {
    backgroundColor: "#00ff88",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#888",
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  itemName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  category: {
    color: "#666",
    fontSize: 12,
    marginTop: 3,
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  change: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },
  up: {
    color: "#00ff88",
  },
  down: {
    color: "#ff4444",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
