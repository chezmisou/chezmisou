import { useEffect, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { Button, Card, ErrorBox, Field, Loading, Muted, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { api, absoluteUrl, uploadImage } from "@/lib/api";
import type { LacPrep } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

interface DishForm {
  key: string;
  name: string;
  description: string;
  price: string;
  maxQuantity: string;
  photoUrl: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toFrDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const toTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function parseFrDate(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

function parseTime(s: string): [number, number] | null {
  const m = s.trim().match(/^(\d{1,2})[:hH](\d{2})$/);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return [Number(m[1]), Number(m[2])];
}

/** Prochain dimanche (ou dimanche suivant si on est dimanche). */
function nextSunday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return d;
}

let keySeq = 0;
const newDish = (): DishForm => ({ key: `d${keySeq++}`, name: "", description: "", price: "", maxQuantity: "", photoUrl: "" });

function MenuForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sunday = nextSunday();
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() - 1);

  const [serviceDate, setServiceDate] = useState(toFrDate(sunday));
  const [deadlineDate, setDeadlineDate] = useState(toFrDate(saturday));
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [info, setInfo] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [dishes, setDishes] = useState<DishForm[]>([newDish()]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Édition : on recharge le menu existant
  useEffect(() => {
    if (!id) return;
    api<LacPrep>(`/api/mobile/admin/lac/${id}`)
      .then((d) => {
        const deadline = new Date(d.menu.orderDeadline);
        // serviceDate est enregistrée à minuit UTC : on lit le jour en UTC
        const s = new Date(d.menu.serviceDate);
        setServiceDate(`${pad(s.getUTCDate())}/${pad(s.getUTCMonth() + 1)}/${s.getUTCFullYear()}`);
        setDeadlineDate(toFrDate(deadline));
        setDeadlineTime(toTime(deadline));
        setInfo(d.menu.info ?? "");
        setIsPublished(d.menu.isPublished);
        setDishes(
          d.dishes.map((x) => ({
            key: `d${keySeq++}`,
            name: x.name,
            description: x.description ?? "",
            price: String(x.price).replace(".", ","),
            maxQuantity: x.maxQuantity != null ? String(x.maxQuantity) : "",
            photoUrl: x.photoUrl ?? "",
          }))
        );
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Menu introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (loadError) return <Screen><ErrorBox message={loadError} /></Screen>;

  function updateDish(key: string, field: keyof DishForm, value: string) {
    setDishes((p) => p.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  }

  function moveDish(index: number, dir: -1 | 1) {
    setDishes((p) => {
      const next = [...p];
      const j = index + dir;
      if (j < 0 || j >= next.length) return p;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function pickPhoto(key: string) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Accès aux photos refusé", "Autorisez l’accès aux photos dans les réglages du téléphone.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(key);
    try {
      const url = await uploadImage("/api/admin/lac/upload-dish-image", res.assets[0].uri, res.assets[0].mimeType);
      updateDish(key, "photoUrl", url);
    } catch (e) {
      Alert.alert("Photo non envoyée", e instanceof Error ? e.message : "Réessayez.");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setError(null);
    const service = parseFrDate(serviceDate);
    if (!service) return setError("Date du dimanche : format JJ/MM/AAAA.");
    if (service.getDay() !== 0) return setError("La date de service doit tomber un dimanche.");
    const dDate = parseFrDate(deadlineDate);
    const dTime = parseTime(deadlineTime);
    if (!dDate || !dTime) return setError("Deadline : date JJ/MM/AAAA et heure HH:MM.");
    const deadline = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate(), dTime[0], dTime[1]);
    const serviceEnd = new Date(service.getFullYear(), service.getMonth(), service.getDate(), 23, 59);
    if (deadline >= serviceEnd) return setError("La deadline doit être avant le dimanche.");
    if (dishes.length === 0) return setError("Ajoutez au moins un plat.");
    if (dishes.some((d) => !d.name.trim())) return setError("Chaque plat doit avoir un nom.");
    const prices = dishes.map((d) => parseFloat(d.price.replace(",", ".")));
    if (prices.some((p) => !Number.isFinite(p) || p <= 0)) return setError("Chaque plat doit avoir un prix valide.");

    setSaving(true);
    try {
      const body = {
        // Même format que le site : jour du dimanche, deadline à l'heure du téléphone
        serviceDate: `${service.getFullYear()}-${pad(service.getMonth() + 1)}-${pad(service.getDate())}`,
        orderDeadline: deadline.toISOString(),
        deliveryZoneText: info.trim(),
        isPublished,
        dishes: dishes.map((d, i) => ({
          name: d.name.trim(),
          description: d.description.trim() || undefined,
          photoUrl: d.photoUrl || undefined,
          price: prices[i],
          maxQuantity: d.maxQuantity ? parseInt(d.maxQuantity, 10) : undefined,
        })),
      };
      const saved = await api<{ id: string }>(isEdit ? `/api/admin/lac/${id}` : "/api/admin/lac", {
        method: isEdit ? "PATCH" : "POST",
        body,
      });
      if (isEdit) router.back();
      else router.replace(`/admin/lac/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "Modifier le menu" : "Nouveau menu" }} />
      <Screen footer={<Button label="Enregistrer le menu" icon="checkmark" onPress={save} loading={saving} />}>
        {error ? <ErrorBox message={error} /> : null}

        <Card>
          <SectionTitle>Le dimanche</SectionTitle>
          <Field label="Date du service (dimanche)" value={serviceDate} onChangeText={setServiceDate} placeholder="JJ/MM/AAAA" keyboardType="numbers-and-punctuation" />
          <View style={{ flexDirection: "row", gap: space.md }}>
            <View style={{ flex: 3 }}>
              <Field label="Fin des commandes" value={deadlineDate} onChangeText={setDeadlineDate} placeholder="JJ/MM/AAAA" keyboardType="numbers-and-punctuation" />
            </View>
            <View style={{ flex: 2 }}>
              <Field label="à" value={deadlineTime} onChangeText={setDeadlineTime} placeholder="18:00" keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <Field
            label="Info récupération (optionnel)"
            value={info}
            onChangeText={setInfo}
            placeholder="ex : Retrait possible jusqu’à 14h"
            hint="Les églises et les prix de livraison se règlent dans Paramètres."
          />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[ui.body, { fontFamily: fonts.sansBold }]}>Publier tout de suite</Text>
            <Switch value={isPublished} onValueChange={setIsPublished} trackColor={{ true: colors.orange, false: colors.border }} thumbColor={colors.blanc} />
          </View>
        </Card>

        <Text style={ui.sectionTitle}>Les plats</Text>
        {dishes.map((d, i) => (
          <Card key={d.key}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
              <Text style={[ui.eyebrow, { flex: 1, marginBottom: 0 }]}>Plat {i + 1}</Text>
              <Pressable onPress={() => moveDish(i, -1)} disabled={i === 0} hitSlop={8} accessibilityLabel="Monter" style={{ opacity: i === 0 ? 0.3 : 1, padding: 4 }}>
                <Ionicons name="arrow-up" size={20} color={colors.marronProfond} />
              </Pressable>
              <Pressable onPress={() => moveDish(i, 1)} disabled={i === dishes.length - 1} hitSlop={8} accessibilityLabel="Descendre" style={{ opacity: i === dishes.length - 1 ? 0.3 : 1, padding: 4 }}>
                <Ionicons name="arrow-down" size={20} color={colors.marronProfond} />
              </Pressable>
              <Pressable onPress={() => setDishes((p) => p.filter((x) => x.key !== d.key))} hitSlop={8} accessibilityLabel="Supprimer le plat" style={{ padding: 4, marginLeft: space.sm }}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => pickPhoto(d.key)}
              accessibilityRole="button"
              accessibilityLabel={d.photoUrl ? "Changer la photo" : "Ajouter une photo"}
              style={{
                borderRadius: radius.md,
                overflow: "hidden",
                backgroundColor: colors.orangeBg,
                aspectRatio: 16 / 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: space.md,
              }}
            >
              {d.photoUrl ? (
                <Image source={{ uri: absoluteUrl(d.photoUrl) }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              ) : (
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Ionicons name="camera-outline" size={28} color={colors.orange} />
                  <Muted>{uploading === d.key ? "Envoi…" : "Ajouter une photo"}</Muted>
                </View>
              )}
              {uploading === d.key && d.photoUrl ? (
                <View style={{ position: "absolute", backgroundColor: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 8 }}>
                  <Text style={{ color: colors.blanc }}>Envoi…</Text>
                </View>
              ) : null}
            </Pressable>

            <Field label="Nom *" value={d.name} onChangeText={(t) => updateDish(d.key, "name", t)} placeholder="Diri ak djon djon" />
            <Field label="Description" value={d.description} onChangeText={(t) => updateDish(d.key, "description", t)} multiline />
            <View style={{ flexDirection: "row", gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Field label="Prix (€) *" value={d.price} onChangeText={(t) => updateDish(d.key, "price", t)} keyboardType="decimal-pad" placeholder="12,50" />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Quantité max."
                  value={d.maxQuantity}
                  onChangeText={(t) => updateDish(d.key, "maxQuantity", t.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  placeholder="Illimitée"
                />
              </View>
            </View>
          </Card>
        ))}
        <Button label="Ajouter un plat" icon="add" variant="secondary" onPress={() => setDishes((p) => [...p, newDish()])} />
        {isEdit ? (
          <Muted style={{ textAlign: "center" }}>
            Attention : modifier les plats d’un menu qui a déjà des commandes peut fausser la préparation.
          </Muted>
        ) : null}
      </Screen>
    </>
  );
}

export default function AdminLacMenuScreen() {
  return (
    <AdminGuard>
      <MenuForm />
    </AdminGuard>
  );
}
