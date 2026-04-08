import { NextResponse } from "next/server";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const [shippingCost, freeThreshold, lacDeliveryFee] = await Promise.all([
    getNumberSetting(SETTING_KEYS.SHIPPING_COST_FRANCE.key, SETTING_KEYS.SHIPPING_COST_FRANCE.default),
    getNumberSetting(SETTING_KEYS.FREE_SHIPPING_THRESHOLD.key, SETTING_KEYS.FREE_SHIPPING_THRESHOLD.default),
    getNumberSetting(SETTING_KEYS.LAC_DELIVERY_FEE.key, SETTING_KEYS.LAC_DELIVERY_FEE.default),
  ]);

  return NextResponse.json({ shippingCost, freeThreshold, lacDeliveryFee });
}
