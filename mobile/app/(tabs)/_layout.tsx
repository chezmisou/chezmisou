import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { colors, fonts } from "@/lib/theme";

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  const { lacCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.blancCreme },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 20, color: colors.marronProfond },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.grisChaud,
        tabBarStyle: { backgroundColor: colors.blanc, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerTitle: "Chez Misou",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="lac"
        options={{
          title: "LAC",
          headerTitle: "Lunch After Church",
          tabBarBadge: lacCount > 0 ? lacCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.orange },
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="epicerie"
        options={{
          title: "Épicerie",
          headerTitle: "Épicerie fine",
          tabBarIcon: ({ color, size }) => <Ionicons name="basket-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="traiteur"
        options={{
          title: "Traiteur",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: "Compte",
          headerTitle: "Mon compte",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: "Admin",
          headerTitle: "Administration",
          href: isAdmin ? "/gestion" : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
