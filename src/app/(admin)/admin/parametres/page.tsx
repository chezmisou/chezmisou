import { getAllSettings, SETTING_KEYS } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const saved = await getAllSettings();

  // Merge defaults with saved values
  const initialData: Record<string, string> = {};
  for (const setting of Object.values(SETTING_KEYS)) {
    initialData[setting.key] = saved[setting.key] ?? String(setting.default);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Paramètres
        </h1>
        <p className="text-text-body mt-1">
          Configurez les réglages généraux du site.
        </p>
      </div>

      <SettingsForm initialData={initialData} />
    </div>
  );
}
