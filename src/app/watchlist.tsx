import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { FONT, ICE } from "../constants/theme";
import { supabase } from "../supabase";

export default function WatchlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, []),
  );

  const loadWatchlist = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  const navigateToItem = (item: any) => {
    router.push({
      pathname: "/item",
      params: {
        name: item.item_name,
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
            <Text style={styles.subtitle}>Your Watchlist</Text>
          </View>
        </View>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={ICE.primary}
          style={{ marginTop: 60 }}
        />
      )}

      {!loading && items.length === 0 && (
        <View style={styles.emptyState}>
          <Image
            source={require("../../assets/images/penguin.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptyText}>
            Tap any item and press Add to Watchlist to start tracking it
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push("/")}
          >
            <Text style={styles.browseBtnText}>Browse Trending</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {!loading && items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {items.length} ITEMS TRACKED
            </Text>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.row,
                  index < items.length - 1 && styles.rowBorder,
                ]}
                onPress={() => navigateToItem(item)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rowImageBox}>
                    <Text style={styles.rowImageLetter}>
                      {item.item_name?.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {item.item_name}
                    </Text>
                    <Text style={styles.rowCategory}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowPrice}>{item.price}</Text>
                  <Text
                    style={[
                      styles.rowChange,
                      item.trend === "up" ? styles.up : styles.down,
                    ]}
                  >
                    {item.trend === "up" ? "▲" : "▼"} {item.change}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
  appName: { fontSize: 20, fontFamily: FONT.bold, color: ICE.textPrimary },
  subtitle: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: ICE.textMuted,
    marginTop: 1,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 80,
    gap: 12,
  },
  emptyImage: { width: 100, height: 100, marginBottom: 8 },
  emptyTitle: { color: ICE.textPrimary, fontSize: 20, fontFamily: FONT.bold },
  emptyText: {
    color: ICE.textMuted,
    fontSize: 14,
    fontFamily: FONT.regular,
    textAlign: "center",
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: ICE.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  browseBtnText: { color: "#000", fontSize: 15, fontFamily: FONT.bold },

  section: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 2,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: ICE.bgElement },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rowImageBox: {
    width: 44,
    height: 44,
    backgroundColor: ICE.bgElement,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rowImageLetter: { color: ICE.textMuted, fontSize: 18, fontFamily: FONT.bold },
  rowName: { color: ICE.textPrimary, fontSize: 14, fontFamily: FONT.semibold },
  rowCategory: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.regular,
    marginTop: 2,
  },
  rowRight: { alignItems: "flex-end", gap: 3 },
  rowPrice: { color: ICE.textPrimary, fontSize: 15, fontFamily: FONT.bold },
  rowChange: { fontSize: 12, fontFamily: FONT.semibold },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: ICE.downBg,
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: { color: ICE.down, fontSize: 12, fontFamily: FONT.bold },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
