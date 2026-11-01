import { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { Button, Card, ErrorBox, Field, Loading, Muted, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { LacChurch, LacDeliveryTier } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

const DEFAULT_TIERS: LacDeliveryTier[] = [
  { upToKm: 10, price: 5 },
  { upToKm: 20, price: 8 },
  { upToKm: 30, price: 11 },
  { upToKm: 40, price: 14 },
  { upToKm: null, price: 17 },
];

const DAYS = [
  ["monday", "Lun"],
  ["tuesday", "Mar"],
  ["wednesday", "Mer"],
  ["thursday", "Jeu"],
  ["friday", "Ven"],
  ["saturday", "Sam"],
  ["sunday", "Dim"],
] as const;

function parseJson<T>(raw: string | undefined, fallback: T): T {
  try {
    const v = raw ? JSON.parse(raw) : null;
    return Array.isArray(v) && v.length ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

const toInput = (n: number) => String(n).replace(".", ",");
const toNum = (s: string) => parseFloat(s.replace(",", "."));

function Settings() {
  const { data, error, loading, refresh } = useApi<{ settings: Record<string, string> }>("/api/mobile/admin/settings");
  const [values, setValues] = useState<Record<string, string>>({});
  const [churches, setChurches] = useState<LacChurch[]>([]);
  const [tiers, setTiers] = useState<{ upToKm: string; price: string }[]>([]);
  const [beyond, setBeyond] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [initialised, setInitialised] = useState(false);

  // Copie les réglages reçus dans le formulaire (une seule fois)
  useEffect(() => {
    if (!data || initialised) return;
    const s = data.settings;
    const parsedTiers = parseJson<LacDeliveryTier[]>(s.lac_delivery_tiers, DEFAULT_TIERS);
    const bounded = parsedTiers.filter((t) => t.upToKm !== null);
    const open = parsedTiers.find((t) => t.upToKm === null);
    Promise.resolve().then(() => {
      setValues({
        ...s,
        shipping_cost_france: (s.shipping_cost_france ?? "").replace(".", ","),
        free_shipping_threshold: (s.free_shipping_threshold ?? "").replace(".", ","),
      });
      setChurches(parseJson<LacChurch[]>(s.lac_churches, []));
      setTiers(bounded.map((t) => ({ upToKm: String(t.upToKm), price: toInput(t.price) })));
      setBeyond(toInput(open?.price ?? bounded[bounded.length - 1]?.price ?? 0));
      setInitialised(true);
    });
  }, [data, initialised]);

  if (loading || (data && !initialised)) return <Loading />;
  if (error || !data) return <Screen><ErrorBox message={error || "Erreur"} onRetry={refresh} /></Screen>;

  const set = (key: string, v: string) => {
    setValues((p) => ({ ...p, [key]: v }));
    setSaved(false);
  };

  async function save() {
    setSaveError(null);
    setSaved(false);
    const cleanChurches = churches
      .map((c) => ({ ...c, name: c.name.trim(), address: c.address.trim() }))
      .filter((c) => c.name || c.address);
    if (cleanChurches.some((c) => !c.name)) return setSaveError("Chaque église doit avoir un nom.");
    const rows = tiers.map((t) => ({ upToKm: toNum(t.upToKm), price: toNum(t.price) }));
    if (rows.some((t) => !Number.isFinite(t.upToKm) || t.upToKm <= 0)) return setSaveError("Chaque palier doit avoir une distance.");
    if (rows.some((t) => !Number.isFinite(t.price) || t.price < 0)) return setSaveError("Chaque palier doit avoir un prix.");
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].upToKm <= rows[i - 1].upToKm) return setSaveError("Les distances des paliers doivent être croissantes.");
    }
    const beyondPrice = toNum(beyond);
    if (!Number.isFinite(beyondPrice) || beyondPrice < 0) return setSaveError("Indiquez le prix au-delà du dernier palier.");
    for (const k of ["shipping_cost_france", "free_shipping_threshold"]) {
      if (!Number.isFinite(toNum(values[k] ?? ""))) return setSaveError("Vérifiez les montants de l’épicerie.");
    }

    setSaving(true);
    try {
      await api("/api/admin/settings", {
        body: {
          ...values,
          shipping_cost_france: String(toNum(values.shipping_cost_france)),
          free_shipping_threshold: String(toNum(values.free_shipping_threshold)),
          lac_churches: JSON.stringify(cleanChurches),
          lac_delivery_tiers: JSON.stringify([...rows, { upToKm: null, price: beyondPrice }]),
        },
      });
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      footer={
        <Button label={saved ? "Enregistré ✓" : "Enregistrer"} icon={saved ? undefined : "save-outline"} onPress={save} loading={saving} />
      }
    >
      {saveError ? <ErrorBox message={saveError} /> : null}

      {/* LAC : églises */}
      <Card>
        <SectionTitle hint="Le client choisit où récupérer sa commande, gratuitement.">Églises de retrait</SectionTitle>
        {churches.length === 0 ? (
          <Muted style={{ marginBottom: space.md }}>Aucune église : le client verra « Retrait sur place ».</Muted>
        ) : null}
        {churches.map((c) => (
          <View key={c.id} style={{ padding: space.md, borderRadius: radius.md, backgroundColor: colors.blancCreme, marginBottom: space.md }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable
                onPress={() => {
                  setChurches((p) => p.filter((x) => x.id !== c.id));
                  setSaved(false);
                }}
                hitSlop={8}
                accessibilityLabel={`Supprimer ${c.name || "cette église"}`}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
            <Field
              label="Nom"
              value={c.name}
              onChangeText={(t) => {
                setChurches((p) => p.map((x) => (x.id === c.id ? { ...x, name: t } : x)));
                setSaved(false);
              }}
              placeholder="Nom de l’église"
            />
            <Field
              label="Adresse"
              value={c.address}
              onChangeText={(t) => {
                setChurches((p) => p.map((x) => (x.id === c.id ? { ...x, address: t } : x)));
                setSaved(false);
              }}
              placeholder="Adresse"
            />
          </View>
        ))}
        <Button
          label="Ajouter une église"
          icon="add"
          variant="secondary"
          onPress={() => {
            setChurches((p) => [...p, { id: `eg_${Math.random().toString(36).slice(2, 10)}`, name: "", address: "" }]);
            setSaved(false);
          }}
        />
      </Card>

      {/* LAC : livraison */}
      <Card>
        <SectionTitle hint="Prix calculé automatiquement selon la distance à vol d’oiseau.">Livraison LAC (Île-de-France)</SectionTitle>
        <Field
          label="Adresse de départ"
          value={values.lac_delivery_origin ?? ""}
          onChangeText={(t) => set("lac_delivery_origin", t)}
          placeholder="Chelles 77500"
          hint="Vide = centre de Chelles."
        />
        <Text style={ui.label}>Grille de prix</Text>
        {tiers.map((t, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.sm }}>
            <Text style={[ui.body, { width: 64 }]}>{i === 0 ? "0" : tiers[i - 1].upToKm || "…"} à</Text>
            <View style={{ flex: 1 }}>
              <Field
                label="km"
                value={t.upToKm}
                onChangeText={(v) => {
                  setTiers((p) => p.map((x, j) => (j === i ? { ...x, upToKm: v.replace(/[^\d]/g, "") } : x)));
                  setSaved(false);
                }}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="€"
                value={t.price}
                onChangeText={(v) => {
                  setTiers((p) => p.map((x, j) => (j === i ? { ...x, price: v } : x)));
                  setSaved(false);
                }}
                keyboardType="decimal-pad"
              />
            </View>
            <Pressable
              onPress={() => {
                setTiers((p) => p.filter((_, j) => j !== i));
                setSaved(false);
              }}
              hitSlop={8}
              accessibilityLabel={`Supprimer le palier ${i + 1}`}
            >
              <Ionicons name="close-circle-outline" size={22} color={colors.grisChaud} />
            </Pressable>
          </View>
        ))}
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <Text style={[ui.body, { flex: 1 }]}>
            {tiers.length ? `Plus de ${tiers[tiers.length - 1].upToKm || "…"} km` : "Toute distance"}
          </Text>
          <View style={{ width: 110 }}>
            <Field label="€" value={beyond} onChangeText={(v) => { setBeyond(v); setSaved(false); }} keyboardType="decimal-pad" />
          </View>
        </View>
        <Button
          label="Ajouter un palier"
          icon="add"
          variant="ghost"
          onPress={() => {
            const last = tiers[tiers.length - 1];
            setTiers((p) => [...p, { upToKm: String(last ? Number(last.upToKm) + 10 : 10), price: beyond }]);
            setSaved(false);
          }}
        />
      </Card>

      {/* LAC : deadline par défaut */}
      <Card>
        <SectionTitle hint="Proposée à la création d’un menu sur le site.">Deadline par défaut</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space.md }}>
          {DAYS.map(([value, label]) => {
            const on = (values.lac_default_deadline_day ?? "saturday") === value;
            return (
              <Pressable
                key={value}
                onPress={() => set("lac_default_deadline_day", value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: on ? colors.orange : colors.border,
                  backgroundColor: on ? colors.orange : colors.blanc,
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
              >
                <Text style={{ fontFamily: fonts.sansMedium, color: on ? colors.blanc : colors.textBody }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Field
          label="Heure"
          value={values.lac_default_deadline_time ?? "18:00"}
          onChangeText={(t) => set("lac_default_deadline_time", t)}
          placeholder="18:00"
          keyboardType="numbers-and-punctuation"
        />
      </Card>

      {/* Épicerie */}
      <Card>
        <SectionTitle>Épicerie fine</SectionTitle>
        <Field
          label="Frais de port France (€)"
          value={values.shipping_cost_france ?? ""}
          onChangeText={(t) => set("shipping_cost_france", t)}
          keyboardType="decimal-pad"
        />
        <Field
          label="Livraison offerte dès (€)"
          value={values.free_shipping_threshold ?? ""}
          onChangeText={(t) => set("free_shipping_threshold", t)}
          keyboardType="decimal-pad"
        />
      </Card>

      {/* Traiteur */}
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text style={ui.sectionTitle}>Traiteur ouvert au public</Text>
            <Muted>Sinon, le site et l’app affichent « Bientôt disponible ».</Muted>
          </View>
          <Switch
            value={values.traiteur_enabled === "true"}
            onValueChange={(v) => set("traiteur_enabled", v ? "true" : "false")}
            trackColor={{ true: colors.orange, false: colors.border }}
            thumbColor={colors.blanc}
          />
        </View>
      </Card>

      {/* Contact */}
      <Card>
        <SectionTitle>Contact public</SectionTitle>
        <Field label="Email" value={values.contact_email ?? ""} onChangeText={(t) => set("contact_email", t)} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Téléphone" value={values.contact_phone ?? ""} onChangeText={(t) => set("contact_phone", t)} keyboardType="phone-pad" />
      </Card>
    </Screen>
  );
}

export default function AdminSettingsScreen() {
  return (
    <AdminGuard>
      <Settings />
    </AdminGuard>
  );
}
