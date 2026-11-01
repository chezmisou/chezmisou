import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { colors, fonts } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const headerOptions = {
  headerStyle: { backgroundColor: colors.blancCreme },
  headerShadowVisible: false,
  // iOS 26+ : en-tête opaque, sinon le contenu passe dessous (Liquid Glass)
  headerTransparent: false,
  headerTintColor: colors.marronProfond,
  headerTitleStyle: { fontFamily: fonts.serif, fontSize: 18, color: colors.marronProfond },
  headerBackTitle: "Retour",
  contentStyle: { backgroundColor: colors.blancCreme },
} as const;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={headerOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
            <Stack.Screen name="produit/[slug]" options={{ title: "" }} />
            <Stack.Screen name="panier" options={{ title: "Mon panier" }} />
            <Stack.Screen name="checkout/epicerie" options={{ title: "Commande épicerie" }} />
            <Stack.Screen name="checkout/lac" options={{ title: "Commande LAC" }} />
            <Stack.Screen name="confirmation" options={{ title: "Merci !", headerBackVisible: false, gestureEnabled: false }} />
            <Stack.Screen name="devis" options={{ title: "Demande de devis" }} />
            <Stack.Screen name="admin/commandes" options={{ title: "Commandes" }} />
            <Stack.Screen name="admin/commande/[id]" options={{ title: "Commande" }} />
            <Stack.Screen name="admin/lac/index" options={{ title: "Menus LAC" }} />
            <Stack.Screen name="admin/lac/[id]" options={{ title: "Préparation" }} />
            <Stack.Screen name="admin/lac/menu" options={{ title: "Menu" }} />
            <Stack.Screen name="admin/devis" options={{ title: "Devis traiteur" }} />
            <Stack.Screen name="admin/parametres" options={{ title: "Paramètres" }} />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
