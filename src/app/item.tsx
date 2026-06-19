import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

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
const CHART_W = width;
const CHART_H = 220;
const PAD = { top: 30, bottom: 10, left: 0, right: 0 };

export default function ItemScreen() {
  const { name, price, change, trend, category, volume } =
    useLocalSearchParams();
  const router = useRouter();
  const [tf, setTf] = useState("6M");
  const isUp = trend === "up";

  const data = PRICE_DATA[tf];
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) - 5;
  const maxP = Math.max(...prices) + 5;
  const range = maxP - minP;
  const innerW = CHART_W;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const getX = (i: number) => (i / (data.length - 1)) * innerW;
  const getY = (p: number) => PAD.top + ((maxP - p) / range) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.price)}`)
    .join(" ");
  const areaPath =
    linePath + ` L ${getX(data.length - 1)} ${CHART_H} L 0 ${CHART_H} Z`;

  const startP = data[0].price;
  const endP = data[data.length - 1].price;
  const rawChange = parseFloat(
    String(change).replace("%", "").replace("+", ""),
  );
  const diff = endP - startP;
  const diffPct = Math.abs(rawChange).toFixed(2);
  const lineColor = isUp ? "#00e5aa" : "#ff4444";

  const flipRisk = isUp ? 28 : 62;
  const flipRiskPct = flipRisk / 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroName} numberOfLines={2}>
              {name}
            </Text>
            <Text style={styles.heroCategory}>{category}</Text>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroPrice}>{price}</Text>
            <Text style={[styles.heroChange, isUp ? styles.up : styles.down]}>
              {isUp ? "▲" : "▼"} {isUp ? "+" : "-"}
              {diffPct}%
            </Text>
          </View>
        </View>

        {/* Timeframe Pills */}
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

        {/* Chart - full bleed */}
        <View style={styles.chartWrap}>
          <Svg width={CHART_W} height={CHART_H}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
                <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#areaGrad)" />
            <Path
              d={linePath}
              stroke={lineColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>

          {/* X labels */}
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
        </View>

        {/* Content below chart */}
        <View style={styles.content}>
          {/* Flip Risk Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Flip Risk</Text>
              <Text
                style={[
                  styles.cardValue,
                  { color: isUp ? "#00e5aa" : "#ff4444" },
                ]}
              >
                {flipRisk}%
              </Text>
            </View>

            {/* Risk bar */}
            <View style={styles.riskBarTrack}>
              <View style={styles.riskBarFill}>
                <View
                  style={[styles.riskBarActive, { width: `${flipRisk}%` }]}
                />
                <View style={[styles.riskDot, { left: `${flipRisk}%` }]} />
              </View>
            </View>
            <View style={styles.riskLabels}>
              <Text style={styles.riskLabel}>LOW</Text>
              <Text style={styles.riskLabel}>AVERAGE</Text>
              <Text style={styles.riskLabel}>MEDIUM</Text>
              <Text style={styles.riskLabel}>HIGH</Text>
            </View>
          </View>

          {/* Estimated Flip Return */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Estimated Flip Return</Text>
              <Text style={[styles.cardValue, styles.up]}>
                {isUp ? "72%" : "18%"}
              </Text>
            </View>

            {/* Gradient bar */}
            <View style={styles.returnBar} />

            <View style={styles.returnGrid}>
              {[
                { label: "30D", value: isUp ? "+8%" : "-2%" },
                { label: "3M", value: isUp ? "+15%" : "-5%" },
                { label: "6M", value: isUp ? "+28%" : "-8%" },
                { label: "1Y", value: isUp ? "+48%" : "-12%" },
                { label: "2Y", value: isUp ? "+72%" : "+5%" },
              ].map((r, i) => (
                <View key={i} style={styles.returnItem}>
                  <View
                    style={[
                      styles.returnDot,
                      {
                        backgroundColor:
                          i < 2 ? "#c084fc" : i < 4 ? "#60a5fa" : "#00e5aa",
                      },
                    ]}
                  />
                  <Text style={styles.returnLabel}>{r.label} — </Text>
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

          {/* Market Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Market Stats</Text>
            <View style={styles.statsGrid}>
              {[
                { value: String(volume), label: "30d Volume" },
                {
                  value: isUp ? "High" : "Low",
                  label: "Demand",
                  colored: true,
                },
                { value: isUp ? "2.3d" : "8.1d", label: "Avg Sell Time" },
                {
                  value: isUp ? "78%" : "41%",
                  label: "Sell Through",
                  colored: true,
                },
              ].map((s, i) => (
                <View key={i} style={styles.statItem}>
                  <Text
                    style={[
                      styles.statVal,
                      s.colored && (isUp ? styles.up : styles.down),
                    ]}
                  >
                    {s.value}
                  </Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
  },
  nav: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  backArrow: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroLeft: {
    flex: 1,
    marginRight: 12,
  },
  heroName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  heroCategory: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroRight: {
    alignItems: "flex-end",
  },
  heroPrice: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },
  heroChange: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  tfRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tfPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a2e",
  },
  tfPillActive: {
    backgroundColor: "#fff",
  },
  tfText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },
  tfTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  chartWrap: {
    marginBottom: 24,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6,
  },
  xLabel: {
    color: "#444",
    fontSize: 11,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: "#12122a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e1e3a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  riskBarTrack: {
    height: 12,
    backgroundColor: "#1e1e3a",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "visible",
  },
  riskBarFill: {
    flex: 1,
    position: "relative",
  },
  riskBarActive: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f0a500",
  },
  riskDot: {
    position: "absolute",
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f0a500",
    borderWidth: 3,
    borderColor: "#0a0a1a",
    marginLeft: -10,
  },
  riskLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  riskLabel: {
    color: "#444",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  returnBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1e1e3a",
    marginBottom: 16,
    overflow: "hidden",
  },
  returnGrid: {
    gap: 10,
  },
  returnItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  returnLabel: {
    color: "#555",
    fontSize: 13,
  },
  returnValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  statItem: {
    width: "45%",
  },
  statVal: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLbl: {
    color: "#444",
    fontSize: 12,
  },
  up: { color: "#00e5aa" },
  down: { color: "#ff4444" },
});
