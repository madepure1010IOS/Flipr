import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    InputAccessoryView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT, ICE } from "../constants/theme";
import { supabase } from "../supabase";

export default function AlertScreen() {
  const router = useRouter();
  const { item_name, current_price, category } = useLocalSearchParams();
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const currentPriceNum = parseFloat(String(current_price).replace("$", ""));

  const handleSave = async () => {
    const target = parseFloat(targetPrice);

    if (!targetPrice || isNaN(target)) {
      setError("Please enter a valid price");
      return;
    }

    if (target <= 0) {
      setError("Price must be greater than zero");
      return;
    }

    if (direction === "above" && target <= currentPriceNum) {
      setError(
        `Target must be above the current price of $${currentPriceNum.toFixed(2)}`,
      );
      return;
    }

    if (direction === "below" && target >= currentPriceNum) {
      setError(
        `Target must be below the current price of $${currentPriceNum.toFixed(2)}`,
      );
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to set alerts");
      setLoading(false);
      return;
    }

    await supabase
      .from("alerts")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", item_name);

    const { error: insertError } = await supabase.from("alerts").insert({
      user_id: user.id,
      item_name: item_name,
      target_price: target,
      direction,
    });

    if (insertError) {
      setError("Failed to save alert. Please try again.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.back(), 1200);
  };

  const target = parseFloat(targetPrice);
  const isInvalid =
    !isNaN(target) &&
    ((direction === "above" && target <= currentPriceNum) ||
      (direction === "below" && target >= currentPriceNum) ||
      target === currentPriceNum);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Price Alert</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Item Info */}
        <View style={styles.itemCard}>
          <View style={styles.itemImageBox}>
            <Text style={styles.itemImageLetter}>
              {String(item_name).charAt(0)}
            </Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemCategory}>
              {String(category).toUpperCase()}
            </Text>
            <Text style={styles.itemName} numberOfLines={2}>
              {item_name}
            </Text>
            <Text style={styles.currentPrice}>
              Current price: {current_price}
            </Text>
          </View>
        </View>

        {/* Direction Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ALERT ME WHEN PRICE IS</Text>
          <View style={styles.directionRow}>
            <TouchableOpacity
              style={[
                styles.directionBtn,
                direction === "above" && styles.directionBtnActive,
              ]}
              onPress={() => {
                setDirection("above");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.directionText,
                  direction === "above" && styles.directionTextActive,
                ]}
              >
                Above
              </Text>
              <Text
                style={[
                  styles.directionSub,
                  direction === "above" && styles.directionSubActive,
                ]}
              >
                Notify when price rises
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.directionBtn,
                direction === "below" && styles.directionBtnActiveDown,
              ]}
              onPress={() => {
                setDirection("below");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.directionText,
                  direction === "below" && styles.directionTextActiveDown,
                ]}
              >
                Below
              </Text>
              <Text
                style={[
                  styles.directionSub,
                  direction === "below" && styles.directionSubActiveDown,
                ]}
              >
                Notify when price drops
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Price */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TARGET PRICE</Text>
          <View
            style={[
              styles.priceInputRow,
              isInvalid && styles.priceInputRowInvalid,
            ]}
          >
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor={ICE.textMuted}
              value={targetPrice}
              onChangeText={(val) => {
                setTargetPrice(val);
                setError("");
              }}
              keyboardType="decimal-pad"
              autoFocus
              inputAccessoryViewID="doneButton"
            />
          </View>

          {/* Price diff hint */}
          {currentPriceNum > 0 && targetPrice && !isNaN(target) && (
            <Text
              style={[styles.priceDiff, isInvalid ? styles.down : styles.up]}
            >
              {target > currentPriceNum
                ? `▲ $${(target - currentPriceNum).toFixed(2)} above current price`
                : target < currentPriceNum
                  ? `▼ $${(currentPriceNum - target).toFixed(2)} below current price`
                  : `Same as current price`}
              {isInvalid ? "  — alert would trigger immediately" : ""}
            </Text>
          )}
        </View>

        {/* Summary */}
        {targetPrice && !isNaN(target) && !isInvalid && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              You will be notified when{" "}
              <Text style={styles.summaryBold}>{item_name}</Text> goes{" "}
              <Text style={direction === "above" ? styles.up : styles.down}>
                {direction}
              </Text>{" "}
              ${target.toFixed(2)}
            </Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Save Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (loading || saved || isInvalid) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={loading || saved || isInvalid}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveBtnText}>
                {saved ? "Alert Saved" : "Set Alert"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Done button above keyboard */}
        <InputAccessoryView nativeID="doneButton">
          <View style={styles.keyboardToolbar}>
            <TouchableOpacity
              onPress={() => Keyboard.dismiss()}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },
  inner: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: ICE.textPrimary, fontSize: 24, fontFamily: FONT.regular },
  headerTitle: { color: ICE.textPrimary, fontSize: 17, fontFamily: FONT.bold },

  itemCard: {
    marginHorizontal: 20,
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  itemImageBox: {
    width: 52,
    height: 52,
    backgroundColor: ICE.bgElement,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImageLetter: {
    color: ICE.textMuted,
    fontSize: 22,
    fontFamily: FONT.bold,
  },
  itemInfo: { flex: 1, gap: 3 },
  itemCategory: {
    color: ICE.primary,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 1.5,
  },
  itemName: {
    color: ICE.textPrimary,
    fontSize: 15,
    fontFamily: FONT.bold,
    lineHeight: 20,
  },
  currentPrice: {
    color: ICE.textMuted,
    fontSize: 12,
    fontFamily: FONT.regular,
  },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontFamily: FONT.bold,
    letterSpacing: 2,
    marginBottom: 12,
  },

  directionRow: { flexDirection: "row", gap: 10 },
  directionBtn: {
    flex: 1,
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  directionBtnActive: { borderColor: ICE.up, backgroundColor: ICE.upBg },
  directionBtnActiveDown: {
    borderColor: ICE.down,
    backgroundColor: ICE.downBg,
  },
  directionText: {
    color: ICE.textPrimary,
    fontSize: 15,
    fontFamily: FONT.bold,
  },
  directionTextActive: { color: ICE.up },
  directionTextActiveDown: { color: ICE.down },
  directionSub: {
    color: ICE.textMuted,
    fontSize: 11,
    fontFamily: FONT.regular,
  },
  directionSubActive: { color: ICE.up },
  directionSubActiveDown: { color: ICE.down },

  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: ICE.border,
    gap: 4,
  },
  priceInputRowInvalid: { borderColor: ICE.down },
  dollarSign: { color: ICE.textSecondary, fontSize: 28, fontFamily: FONT.bold },
  priceInput: {
    flex: 1,
    color: ICE.textPrimary,
    fontSize: 32,
    fontFamily: FONT.extrabold,
    paddingVertical: 16,
    letterSpacing: -1,
  },
  priceDiff: { fontSize: 12, fontFamily: FONT.regular, marginTop: 8 },

  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: ICE.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryText: {
    color: ICE.textSecondary,
    fontSize: 14,
    fontFamily: FONT.regular,
    lineHeight: 22,
  },
  summaryBold: { color: ICE.textPrimary, fontFamily: FONT.bold },

  error: {
    color: ICE.down,
    fontSize: 13,
    fontFamily: FONT.medium,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  ctaSection: {
    paddingHorizontal: 20,
    marginTop: "auto" as any,
    paddingBottom: 20,
  },
  saveBtn: {
    backgroundColor: ICE.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#000", fontSize: 16, fontFamily: FONT.extrabold },

  keyboardToolbar: {
    backgroundColor: ICE.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: ICE.border,
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: ICE.primary,
    borderRadius: 8,
  },
  doneBtnText: { color: "#000", fontSize: 14, fontFamily: FONT.bold },

  up: { color: ICE.up },
  down: { color: ICE.down },
});
