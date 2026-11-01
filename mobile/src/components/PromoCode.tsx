import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { AppliedPromo } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";
import { styles as ui } from "./ui";

interface PromoItem {
  variantId?: string;
  lacDishId?: string;
  productId?: string;
  quantity: number;
  price: number;
}

/** Saisie d'un code promo, validé par le site (même règles que le web). */
export function PromoCode({
  type,
  items,
  subtotal,
  email,
  applied,
  onChange,
}: {
  type: "epicerie" | "lac";
  items: PromoItem[];
  subtotal: number;
  email?: string;
  applied: AppliedPromo | null;
  onChange: (promo: AppliedPromo | null) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api<{
        valid: boolean;
        error?: string;
        code?: string;
        promoCodeId?: string;
        discountAmount?: number;
      }>("/api/promos/validate", {
        body: { code: code.trim(), type, items, subtotal, customerEmail: email || undefined },
        auth: false,
      });
      if (r.valid && r.promoCodeId && r.code) {
        onChange({ code: r.code, promoCodeId: r.promoCodeId, discountAmount: r.discountAmount ?? 0 });
        setCode("");
      } else {
        setError(r.error || "Code promo invalide");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code promo invalide");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.successBg,
          borderRadius: radius.md,
          padding: space.md,
        }}
      >
        <Text style={[ui.body, { color: colors.success, fontFamily: fonts.sansBold }]}>
          {applied.code} · –{formatPrice(applied.discountAmount)}
        </Text>
        <Pressable onPress={() => onChange(null)} accessibilityRole="button">
          <Text style={[ui.body, { color: colors.success, textDecorationLine: "underline" }]}>Retirer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t.toUpperCase());
            setError(null);
          }}
          placeholder="Code promo"
          placeholderTextColor={colors.grisChaud}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[ui.input, { flex: 1 }]}
          onSubmitEditing={apply}
          returnKeyType="done"
        />
        <Pressable
          onPress={apply}
          disabled={loading || !code.trim()}
          style={{
            paddingHorizontal: space.lg,
            borderRadius: radius.md,
            justifyContent: "center",
            backgroundColor: colors.marronProfond,
            opacity: loading || !code.trim() ? 0.5 : 1,
          }}
          accessibilityRole="button"
        >
          <Text style={{ color: colors.blanc, fontFamily: fonts.sansBold }}>{loading ? "…" : "Appliquer"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={ui.errorText}>{error}</Text> : null}
    </View>
  );
}
