import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICE } from "../constants/theme";
import { supabase } from "../supabase";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={require("../../assets/images/penguin.png")}
            style={styles.profileImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.profileName}>Flipr Account</Text>
            <Text style={styles.profileSub}>
              Manage your profile and preferences
            </Text>
          </View>
        </View>

        {/* Upgrade Banner */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => router.push("/paywall")}
        >
          <View>
            <Text style={styles.upgradeBannerTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeBannerSub}>
              Unlimited searches, alerts and more
            </Text>
          </View>
          <Text style={styles.upgradeBannerArrow}>›</Text>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Profile</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Price Alerts</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Watchlist</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Subscription</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Rate Flipr</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Contact Support</Text>
              <Text style={styles.rowSub}>support@flipr.app</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Terms and Conditions</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Privacy Policy</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <View style={styles.versionRow}>
          <Image
            source={require("../../assets/images/penguin.png")}
            style={styles.versionLogo}
            resizeMode="contain"
          />
          <Text style={styles.version}>Flipr v1.0.0</Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  backText: {
    color: ICE.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  title: {
    color: ICE.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },

  profileCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileImage: { width: 52, height: 52, borderRadius: 14 },
  profileName: { color: ICE.textPrimary, fontSize: 16, fontWeight: "700" },
  profileSub: { color: ICE.textMuted, fontSize: 12, marginTop: 3 },

  upgradeBanner: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: ICE.upBg,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: ICE.upBorder,
  },
  upgradeBannerTitle: { color: ICE.up, fontSize: 15, fontWeight: "700" },
  upgradeBannerSub: { color: ICE.textMuted, fontSize: 12, marginTop: 3 },
  upgradeBannerArrow: { color: ICE.up, fontSize: 22 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  card: { backgroundColor: ICE.bgCard, borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 4,
  },
  rowTitle: {
    color: ICE.textPrimary,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  rowSub: { color: ICE.textMuted, fontSize: 12 },
  rowArrow: { color: ICE.textMuted, fontSize: 20 },
  divider: { height: 1, backgroundColor: ICE.bgElement, marginHorizontal: 18 },

  versionRow: { alignItems: "center", marginBottom: 20, gap: 8 },
  versionLogo: { width: 32, height: 32 },
  version: { color: ICE.textMuted, fontSize: 12 },

  signOutBtn: {
    marginHorizontal: 20,
    backgroundColor: ICE.downBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: ICE.downBorder,
  },
  signOutText: { color: ICE.down, fontSize: 16, fontWeight: "700" },
});
