"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Settings, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface LacConfig {
  maxChurchesPerSunday: number;
  defaultStartTime: string;
  defaultEndTime: string;
  reminderEmailsEnabled: boolean;
  reminderDaysBefore: number;
}

const defaultConfig: LacConfig = {
  maxChurchesPerSunday: 1,
  defaultStartTime: "11:00",
  defaultEndTime: "14:00",
  reminderEmailsEnabled: true,
  reminderDaysBefore: 3,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<LacConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/lac/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config });
        }
      })
      .catch(() => {
        // Use defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/lac/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Param\u00E8tres enregistr\u00E9s", {
        icon: "\u2705",
        style: {
          borderRadius: "10px",
        },
      });
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast("Param\u00E8tres r\u00E9initialis\u00E9s aux valeurs par d\u00E9faut", {
      icon: "\u21A9\uFE0F",
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Param\u00E8tres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configuration g\u00E9n\u00E9rale de Lunch After Church
        </p>
      </div>

      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950">
            <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Configuration LAC
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Max churches per sunday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre max. d&apos;\u00E9glises par dimanche
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              Limite le nombre d&apos;\u00E9glises pouvant \u00EAtre assign\u00E9es \u00E0 un m\u00EAme dimanche.
            </p>
            <input
              type="number"
              min={1}
              max={10}
              value={config.maxChurchesPerSunday}
              onChange={(e) =>
                setConfig({ ...config, maxChurchesPerSunday: parseInt(e.target.value) || 1 })
              }
              className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de d\u00E9but par d\u00E9faut
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Heure de d\u00E9but des cr\u00E9neaux par d\u00E9faut.
              </p>
              <input
                type="time"
                value={config.defaultStartTime}
                onChange={(e) => setConfig({ ...config, defaultStartTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de fin par d\u00E9faut
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Heure de fin des cr\u00E9neaux par d\u00E9faut.
              </p>
              <input
                type="time"
                value={config.defaultEndTime}
                onChange={(e) => setConfig({ ...config, defaultEndTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reminder emails */}
          <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emails de rappel
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Envoyer des rappels automatiques aux \u00E9glises avant leurs cr\u00E9neaux.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.reminderEmailsEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, reminderEmailsEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600" />
              </label>
            </div>

            {config.reminderEmailsEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jours avant le cr\u00E9neau
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                  Combien de jours avant le cr\u00E9neau envoyer le rappel.
                </p>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={config.reminderDaysBefore}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      reminderDaysBefore: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} />
            R\u00E9initialiser
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
