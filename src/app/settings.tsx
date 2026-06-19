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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
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
            <Text style={styles.profileSub}>Manage your profile below</Text>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>👤</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Profile</Text>
                <Text style={styles.rowSubtitle}>Manage your account</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>🔔</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Price Alerts</Text>
                <Text style={styles.rowSubtitle}>Manage your alerts</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>❤️</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Watchlist</Text>
                <Text style={styles.rowSubtitle}>Your saved items</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#1a1a0a" }]}>
                <Text style={styles.rowIcon}>⭐</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Rate Flipr</Text>
                <Text style={styles.rowSubtitle}>Leave us a review</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>📨</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Contact Support</Text>
                <Text style={styles.rowSubtitle}>support@flipr.app</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>📄</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms & Conditions</Text>
                <Text style={styles.rowSubtitle}>Read our terms</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: "#0a1f35" }]}>
                <Text style={styles.rowIcon}>🔒</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
                <Text style={styles.rowSubtitle}>How we use your data</Text>
              </View>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  backBtn: { marginBottom: 16 },
  backText: { color: ICE.primary, fontSize: 16, fontWeight: "600" },
  title: {
    color: ICE.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: ICE.border,
  },
  profileImage: { width: 52, height: 52, borderRadius: 12 },
  profileName: { color: ICE.textPrimary, fontSize: 16, fontWeight: "700" },
  profileSub: { color: ICE.textMuted, fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    color: ICE.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: ICE.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ICE.border,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowIcon: { fontSize: 17 },
  rowContent: { flex: 1 },
  rowTitle: { color: ICE.textPrimary, fontSize: 15, fontWeight: "600" },
  rowSubtitle: { color: ICE.textMuted, fontSize: 12, marginTop: 2 },
  rowArrow: { color: ICE.textMuted, fontSize: 20 },
  divider: { height: 1, backgroundColor: ICE.border, marginLeft: 60 },
  versionRow: { alignItems: "center", marginBottom: 16, gap: 6 },
  versionLogo: { width: 36, height: 36 },
  version: { color: ICE.textMuted, fontSize: 12 },
  signOutBtn: {
    marginHorizontal: 20,
    backgroundColor: ICE.downBg,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: ICE.downBorder,
  },
  signOutText: { color: ICE.down, fontSize: 16, fontWeight: "700" },
});
