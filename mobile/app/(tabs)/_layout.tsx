import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { colors, fonts } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

/** Icône d'onglet : pleine sur une pastille orange quand l'onglet est actif. */
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icon = (focused ? name : `${name}-outline`) as IconName;
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Ionicons name={icon} size={22} color={focused ? colors.orange : colors.grisChaud} />
    </View>
  );
}

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  const { lacCount } = useCart();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.blancCreme },
        headerShadowVisible: false,
        headerTransparent: false,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 20, color: colors.marronProfond },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.grisChaud,
        tabBarStyle: {
          backgroundColor: colors.blanc,
          borderTopWidth: 0,
          height: 64 + bottom,
          paddingTop: 8,
          paddingBottom: bottom,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          ...Platform.select({
            ios: {
              shadowColor: colors.marronProfond,
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -2 },
            },
            default: { elevation: 12 },
          }),
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11, marginTop: 2 },
        tabBarBadgeStyle: {
          backgroundColor: colors.orange,
          color: colors.blanc,
          fontFamily: fonts.sansBold,
          fontSize: 10,
        },
        sceneStyle: { backgroundColor: colors.blancCreme },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerTitle: "Chez Misou",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lac"
        options={{
          title: "LAC",
          headerTitle: "Lunch After Church",
          tabBarBadge: lacCount > 0 ? lacCount : undefined,
          tabBarIcon: ({ focused }) => <TabIcon name="restaurant" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="epicerie"
        options={{
          title: "Épicerie",
          headerTitle: "Épicerie fine",
          tabBarIcon: ({ focused }) => <TabIcon name="basket" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="traiteur"
        options={{
          title: "Traiteur",
          tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: "Compte",
          headerTitle: "Mon compte",
          tabBarIcon: ({ focused }) => <TabIcon name="person-circle" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: "Admin",
          headerTitle: "Administration",
          href: isAdmin ? "/gestion" : null,
          tabBarIcon: ({ focused }) => <TabIcon name="speedometer" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: colors.orangeBg },
});
