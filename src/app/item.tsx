import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { FONT, ICE } from "../constants/theme";
import { supabase } from "../supabase";

const { width } = Dimensions.get("window");

const PRICE_DATA: Record<string, { date: string; price: number }[]> = {
  "1M": [
    { date: "W1", price: 250 },
    { date: "W2", price: 245 },
    { date: "W3", price: 262 },
    { date: "W4", price: 258 },
    { date: "Now", price: 285 },
  ],
  "6M": [
    { date: "Jul", price: 210 },
    { date: "Aug", price: 218 },
    { date: "Sep", price: 213 },
    { date: "Oct", price: 228 },
    { date: "Nov", price: 222 },
    { date: "Dec", price: 240 },
    { date: "Jan", price: 235 },
    { date: "Feb", price: 255 },
    { date: "Mar", price: 248 },
    { date: "Apr", price: 265 },
    { date: "May", price: 272 },
    { date: "Now", price: 285 },
  ],
  "1Y": [
    { date: "Jan", price: 175 },
    { date: "Feb", price: 182 },
    { date: "Mar", price: 178 },
    { date: "Apr", price: 195 },
    { date: "May", price: 188 },
    { date: "Jun", price: 205 },
    { date: "Jul", price: 210 },
    { date: "Aug", price: 218 },
    { date: "Sep", price: 213 },
    { date: "Oct", price: 235 },
    { date: "Nov", price: 255 },
    { date: "Now", price: 285 },
  ],
  "5Y": [
    { date: "2020", price: 95 },
    { date: "2021", price: 130 },
    { date: "2022", price: 115 },
    { date: "2023", price: 160 },
    { date: "2024", price: 220 },
    { date: "Now", price: 285 },
  ],
  ALL: [
    { date: "2018", price: 60 },
    { date: "2019", price: 75 },
    { date: "2020", price: 95 },
    { date: "2021", price: 130 },
    { date: "2022", price: 115 },
    { date: "2023", price: 160 },
    { date: "2024", price: 220 },
    { date: "Now", price: 285 },
  ],
};

const TIMEFRAMES = ["1M", "6M", "1Y", "5Y", "ALL"];
const CHART_W = width - 40;
const CHART_H = 180;
const PAD = { top: 20, bottom: 10, left: 0, right: 0 };

export default function ItemScreen() {
  const { name, price, change, trend, category, volume } =
    useLocalSearchParams();
  const router = useRouter();
  const [tf, setTf] = useState("6M");
  const [added, setAdded] = useState(false);
  const [priceHistory, setPriceHistory] = useState<
    { date: string; price: number }[]
  >([]);
  const [history1Y, setHistory1Y] = useState<{ date: string; price: number }[]>(
    [],
  );
  const isUp = trend === "up";

  useEffect(() => {
    fetch(
      `https://flipr-backend-production-ac14.up.railway.app/pricehistory?name=${encodeURIComponent(String(name))}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.history6M) setPriceHistory(data.history6M);
        if (data.history1Y) setHistory1Y(data.history1Y);
      })
      .catch(() => {});
  }, [name]);

  const data =
    tf === "6M" && priceHistory.length > 0
      ? priceHistory
      : tf === "1Y" && history1Y.length > 0
        ? history1Y
        : PRICE_DATA[tf];

  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) - 5;
  const maxP = Math.max(...prices) + 5;
  const range = maxP - minP;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const getX = (i: number) => (i / (data.length - 1)) * CHART_W;
  const getY = (p: number) => PAD.top + ((maxP - p) / range) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.price)}`)
    .join(" ");
  const areaPath =
    linePath + ` L ${getX(data.length - 1)} ${CHART_H} L 0 ${CHART_H} Z`;

  const rawChange = parseFloat(
    String(change).replace("%", "").replace("+", ""),
  );
  const diffPct = Math.abs(rawChange).toFixed(2);
  const lineColor = isUp ? ICE.up : ICE.down;
  const flipRisk = isUp ? 28 : 62;
  const gridPrices = [maxP, maxP - range * 0.33, maxP - range * 0.66, minP];

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
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navCategory}>
            {String(category).toUpperCase()}
          </Text>
          <View
            style={[
              styles.signalBadge,
              isUp ? styles.signalUp : styles.signalDown,
            ]}
          >
            <Text style={[styles.signalText, isUp ? styles.up : styles.down]}>
              {isUp ? "BUY" : "AVOID"}
            </Text>
          </View>
        </View>

        {/* Price Hero */}
        <View style={styles.priceHero}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.priceText}>{price}</Text>
          <View style={[styles.changePill, { backgroundColor: lineColor }]}>
            <Text style={styles.changePillText}>
              {isUp ? "+" : "-"}
              {diffPct}%
            </Text>
          </View>
          <Text style={styles.volumeText}>Avg. Listed Price · {volume}</Text>
          <View style={styles.priceRangeRow}>
            <View style={styles.priceRangeItem}>
              <Text style={styles.priceRangeLabel}>LOW</Text>
              <Text style={[styles.priceRangeValue, styles.down]}>
                ${Math.round(parseFloat(String(price).replace("$", "")) * 0.78)}
              </Text>
            </View>
            <View style={styles.priceRangeDivider} />
            <View style={styles.priceRangeItem}>
              <Text style={styles.priceRangeLabel}>AVG</Text>
              <Text style={styles.priceRangeValue}>{price}</Text>
            </View>
            <View style={styles.priceRangeDivider} />
            <View style={styles.priceRangeItem}>
              <Text style={styles.priceRangeLabel}>HIGH</Text>
              <Text style={[styles.priceRangeValue, styles.up]}>
                ${Math.round(parseFloat(String(price).replace("$", "")) * 1.22)}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeframe */}
        <View style={styles.tfRow}>
          {TIMEFRAMES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tfPill, tf === t && styles.tfPillActive]}
              onPress={() => setTf(t)}
            >
              <Text style={[styles.tfText, tf === t && styles.tfTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartWrap}>
          <Svg width={CHART_W} height={CHART_H}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {gridPrices.map((p, i) => (
              <Line
                key={i}
                x1={0}
                y1={getY(p)}
                x2={CHART_W}
                y2={getY(p)}
                stroke={ICE.bgElement}
                strokeWidth={1}
              />
            ))}
            <Path d={areaPath} fill="url(#grad)" />
            <Path
              d={linePath}
              stroke={lineColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <View style={styles.xAxis}>
            {data
              .filter(
                (_, i) =>
                  i === 0 ||
                  i === Math.floor(data.length / 2) ||
                  i === data.length - 1,
              )
              .map((d, i) => (
                <Text key={i} style={styles.xLabel}>
                  {d.date}
                </Text>
              ))}
          </View>
          <Text style={styles.chartNote}>
            Estimated price trend based on current market data
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "Volume", value: String(volume) },
            { label: "Demand", value: isUp ? "High" : "Low", colored: true },
            { label: "Sell Time", value: isUp ? "2.3d" : "8.1d" },
            {
              label: "Sell Through",
              value: isUp ? "78%" : "41%",
              colored: true,
            },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  s.colored && (isUp ? styles.up : styles.down),
                ]}
              >
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

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
              {added ? "Added to Watchlist" : "Add to Watchlist"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flip Risk */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Flip Risk</Text>
            <Text style={[styles.sectionValue, isUp ? styles.up : styles.down]}>
              {flipRisk}%
            </Text>
          </View>
          <View style={styles.riskTrack}>
            <View
              style={[
                styles.riskFill,
                {
                  width: `${flipRisk}%` as any,
                  backgroundColor: isUp ? ICE.up : ICE.down,
                },
              ]}
            />
            <View
              style={[
                styles.riskDot,
                {
                  left: `${flipRisk}%` as any,
                  backgroundColor: isUp ? ICE.up : ICE.down,
                },
              ]}
            />
          </View>
          <View style={styles.riskLabels}>
            <Text style={styles.riskLabel}>LOW</Text>
            <Text style={styles.riskLabel}>AVERAGE</Text>
            <Text style={styles.riskLabel}>MEDIUM</Text>
            <Text style={styles.riskLabel}>HIGH</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Estimated Return */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Estimated Return</Text>
            <Text style={[styles.sectionValue, styles.up]}>
              {isUp ? "72%" : "18%"}
            </Text>
          </View>
          <View style={styles.returnList}>
            {[
              { period: "30 Days", value: isUp ? "+8%" : "-2%" },
              { period: "3 Months", value: isUp ? "+15%" : "-5%" },
              { period: "6 Months", value: isUp ? "+28%" : "-8%" },
              { period: "1 Year", value: isUp ? "+48%" : "-12%" },
              { period: "2 Years", value: isUp ? "+72%" : "+5%" },
            ].map((r, i) => (
              <View key={i} style={styles.returnRow}>
                <Text style={styles.returnPeriod}>{r.period}</Text>
                <View style={styles.returnBarWrap}>
                  <View
                    style={[
                      styles.returnBar,
                      {
                        width: `${Math.abs(parseFloat(r.value))}%` as any,
                        backgroundColor:
                          parseFloat(r.value) >= 0 ? ICE.up : ICE.down,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.returnValue,
                    parseFloat(r.value) >= 0 ? styles.up : styles.down,
                  ]}
                >
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

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

  chartNote: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.regular,
    textAlign: "center",
    marginTop: 6,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: ICE.textPrimary, fontSize: 24, fontFamily: FONT.regular },
  navCategory: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.bold,
    letterSpacing: 2,
  },
  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  signalUp: { backgroundColor: ICE.upBg, borderColor: ICE.upBorder },
  signalDown: { backgroundColor: ICE.downBg, borderColor: ICE.downBorder },
  signalText: { fontSize: 11, fontFamily: FONT.extrabold, letterSpacing: 1 },

  priceHero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 8,
  },
  itemName: { color: ICE.textSecondary, fontSize: 14, fontFamily: FONT.medium },
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

  tfRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tfPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ICE.bgElement,
  },
  tfPillActive: { backgroundColor: ICE.primary },
  tfText: { color: ICE.textMuted, fontSize: 12, fontFamily: FONT.semibold },
  tfTextActive: { color: "#000", fontFamily: FONT.bold },

  chartWrap: { paddingHorizontal: 20, marginBottom: 28 },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  xLabel: { color: ICE.textMuted, fontSize: 10, fontFamily: FONT.regular },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 28,
    justifyContent: "space-between",
  },
  statItem: { alignItems: "center" },
  statValue: {
    color: ICE.textPrimary,
    fontSize: 17,
    fontFamily: FONT.bold,
    marginBottom: 3,
  },
  statLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.semibold,
    letterSpacing: 0.5,
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

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { color: ICE.textPrimary, fontSize: 16, fontFamily: FONT.bold },
  sectionValue: { fontSize: 20, fontFamily: FONT.extrabold },

  riskTrack: {
    height: 6,
    backgroundColor: ICE.bgElement,
    borderRadius: 3,
    marginBottom: 10,
    position: "relative",
  },
  riskFill: { height: 6, borderRadius: 3 },
  riskDot: {
    position: "absolute",
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ICE.bg,
    marginLeft: -8,
  },
  riskLabels: { flexDirection: "row", justifyContent: "space-between" },
  riskLabel: {
    color: ICE.textMuted,
    fontSize: 9,
    fontFamily: FONT.semibold,
    letterSpacing: 0.5,
  },

  returnList: { gap: 14 },
  returnRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  returnPeriod: {
    color: ICE.textSecondary,
    fontSize: 13,
    fontFamily: FONT.regular,
    width: 72,
  },
  returnBarWrap: {
    flex: 1,
    height: 4,
    backgroundColor: ICE.bgElement,
    borderRadius: 2,
    overflow: "hidden",
  },
  returnBar: { height: 4, borderRadius: 2 },
  returnValue: {
    fontSize: 13,
    fontFamily: FONT.bold,
    width: 44,
    textAlign: "right",
  },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
