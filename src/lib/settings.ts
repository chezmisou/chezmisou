import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  SHIPPING_COST_FRANCE: { key: "shipping_cost_france", type: "number", default: 6.9 },
  FREE_SHIPPING_THRESHOLD: { key: "free_shipping_threshold", type: "number", default: 60 },
  LAC_DELIVERY_FEE: { key: "lac_delivery_fee", type: "number", default: 5.0 },
  LAC_DEFAULT_DEADLINE_DAY: { key: "lac_default_deadline_day", type: "string", default: "saturday" },
  LAC_DEFAULT_DEADLINE_TIME: { key: "lac_default_deadline_time", type: "string", default: "18:00" },
  CONTACT_EMAIL: { key: "contact_email", type: "string", default: "contact@chezmisou.com" },
  CONTACT_PHONE: { key: "contact_phone", type: "string", default: "" },
  PICKUP_ADDRESS: { key: "pickup_address", type: "string", default: "" },
} as const;

const VALID_KEYS: Set<string> = new Set(Object.values(SETTING_KEYS).map((s) => s.key));

export function isValidSettingKey(key: string): boolean {
  return VALID_KEYS.has(key);
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getNumberSetting(key: string, fallback: number): Promise<number> {
  const raw = await getSetting(key);
  if (raw === null) return fallback;
  const num = parseFloat(raw);
  return isNaN(num) ? fallback : num;
}

export async function getStringSetting(key: string, fallback: string): Promise<string> {
  const raw = await getSetting(key);
  return raw ?? fallback;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
