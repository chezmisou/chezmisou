"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInSeconds, nextSunday, isPast, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Lock,
  CalendarDays,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  History,
  CalendarCheck,
  Timer,
} from "lucide-react";

interface SlotData {
  id: string;
  date: string;
  status: string;
  maxParticipants: number | null;
  notes: string | null;
  church: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
}

interface AccessData {
  hasAccessToday: boolean;
  todaySlot: SlotData | null;
  nextSlot: SlotData | null;
  upcomingSlots: SlotData[];
  pastSlots: SlotData[];
}

export default function ChurchDashboardPage() {
  const { data: session } = useSession();
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [participantCount, setParticipantCount] = useState<string>("");

  const churchId = (session?.user as any)?.churchId;

  const fetchAccess = useCallback(async () => {
    if (!churchId) return;

    try {
      const res = await fetch(`/api/lac/church-access?churchId=${churchId}`);
      if (res.ok) {
        const data = await res.json();
        setAccessData(data);
      } else {
        // If the API doesn't exist yet, build mock data from slots
        const slotsRes = await fetch(
          `/api/lac/slots?churchId=${churchId}&limit=100`
        );
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          const slots: SlotData[] = slotsData.slots || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todaySlot = slots.find((s) => {
            const slotDate = new Date(s.date);
            slotDate.setHours(0, 0, 0, 0);
            return isSameDay(slotDate, today);
          });

          const futureSlots = slots
            .filter((s) => {
              const slotDate = new Date(s.date);
              slotDate.setHours(0, 0, 0, 0);
              return slotDate > today;
            })
            .sort(
              (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          const pastSlots = slots
            .filter((s) => {
              const slotDate = new Date(s.date);
              slotDate.setHours(0, 0, 0, 0);
              return slotDate < today && !isSameDay(slotDate, today);
            })
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

          setAccessData({
            hasAccessToday: !!todaySlot,
            todaySlot: todaySlot || null,
            nextSlot: futureSlots[0] || null,
            upcomingSlots: futureSlots,
            pastSlots: pastSlots.slice(0, 10),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching access:", err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  // Countdown timer
  useEffect(() => {
    if (!accessData || accessData.hasAccessToday) return;

    const targetDate = accessData.nextSlot
      ? new Date(accessData.nextSlot.date)
      : nextSunday(new Date());

    // Set target to 9am on the target Sunday
    targetDate.setHours(9, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = differenceInSeconds(targetDate, now);

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [accessData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </motion.div>

      {/* Access Status */}
      <AnimatePresence mode="wait">
        {accessData?.hasAccessToday ? (
          <ActiveAccessBanner
            key="active"
            slot={accessData.todaySlot}
            participantCount={participantCount}
            onParticipantChange={setParticipantCount}
          />
        ) : (
          <LockedAccessBanner
            key="locked"
            nextSlot={accessData?.nextSlot || null}
            countdown={countdown}
          />
        )}
      </AnimatePresence>

      {/* Calendar Section - Upcoming Sundays */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-50 flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Dimanches assignés
            </h2>
          </div>
          <div className="p-6">
            {accessData?.upcomingSlots && accessData.upcomingSlots.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accessData.upcomingSlots.map((slot, i) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-indigo-100">
                      <span className="text-xs font-medium text-indigo-600 uppercase leading-none">
                        {format(parseISO(slot.date), "MMM", { locale: fr })}
                      </span>
                      <span className="text-lg font-bold text-gray-900 leading-none mt-0.5">
                        {format(parseISO(slot.date), "d")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(slot.date), "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                      {slot.maxParticipants && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Max: {slot.maxParticipants} participants
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Aucun dimanche assigné prochainement
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-50 flex items-center gap-3">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Historique LAC
            </h2>
          </div>
          <div className="p-6">
            {accessData?.pastSlots && accessData.pastSlots.length > 0 ? (
              <div className="space-y-2">
                {accessData.pastSlots.map((slot, i) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-sm text-gray-700">
                        {format(parseISO(slot.date), "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-lg capitalize">
                      {slot.status === "COMPLETED"
                        ? "Terminé"
                        : slot.status === "CANCELLED"
                        ? "Annulé"
                        : "Passé"}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Aucun historique disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============ Sub-components ============

function ActiveAccessBanner({
  slot,
  participantCount,
  onParticipantChange,
}: {
  slot: SlotData | null;
  participantCount: string;
  onParticipantChange: (val: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg shadow-green-200/50 overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Sparkles className="w-8 h-8 text-white/90" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              C&apos;est votre dimanche LAC !
            </h2>
            <p className="text-green-100 mt-2 text-sm sm:text-base">
              Votre église a accès au service Lunch After Church aujourd&apos;hui.
              Préparez un repas inoubliable !
            </p>
          </div>
          <CheckCircle2 className="w-10 h-10 text-white/80 flex-shrink-0 hidden sm:block" />
        </div>

        {/* Action area */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Participant count */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              <Users className="w-4 h-4 inline mr-1.5" />
              Nombre de participants estimé
            </label>
            <input
              type="number"
              min="0"
              value={participantCount}
              onChange={(e) => onParticipantChange(e.target.value)}
              placeholder="Ex: 45"
              className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Info card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm font-medium text-white/90 mb-2">
              <Clock className="w-4 h-4 inline mr-1.5" />
              Détails du créneau
            </p>
            <div className="space-y-1.5">
              <p className="text-sm text-white">
                Date :{" "}
                {slot
                  ? format(parseISO(slot.date), "d MMMM yyyy", { locale: fr })
                  : "Aujourd'hui"}
              </p>
              {slot?.maxParticipants && (
                <p className="text-sm text-white">
                  Capacité max : {slot.maxParticipants} personnes
                </p>
              )}
              {slot?.notes && (
                <p className="text-sm text-white/80 italic">{slot.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="px-5 py-2.5 bg-white text-green-700 font-semibold rounded-xl shadow-sm hover:bg-green-50 transition-all duration-200 text-sm">
            Gérer les commandes
          </button>
          <button className="px-5 py-2.5 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 text-sm border border-white/30">
            Voir le menu du jour
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LockedAccessBanner({
  nextSlot,
  countdown,
}: {
  nextSlot: SlotData | null;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
}) {
  const nextDate = nextSlot
    ? format(parseISO(nextSlot.date), "EEEE d MMMM yyyy", { locale: fr })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-2xl shadow-lg shadow-purple-200/50 overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Lock className="w-7 h-7 text-white/70 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Accès LAC verrouillé
            </h2>
            {nextDate ? (
              <p className="text-purple-200 mt-1 text-sm sm:text-base">
                Votre prochain accès LAC est le{" "}
                <span className="text-white font-semibold">{nextDate}</span>.
                Préparez-vous !
              </p>
            ) : (
              <p className="text-purple-200 mt-1 text-sm">
                Aucun dimanche LAC n&apos;est planifié pour le moment. Contactez
                l&apos;administration pour être assigné.
              </p>
            )}
          </div>
        </div>

        {/* Countdown */}
        {nextSlot && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-purple-300" />
              <p className="text-sm font-medium text-purple-200">
                Compte à rebours
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {[
                { value: countdown.days, label: "jours" },
                { value: countdown.hours, label: "heures" },
                { value: countdown.minutes, label: "min" },
                { value: countdown.seconds, label: "sec" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10"
                >
                  <motion.span
                    key={item.value}
                    initial={{ opacity: 0.5, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-2xl sm:text-3xl font-bold text-white tabular-nums"
                  >
                    {String(item.value).padStart(2, "0")}
                  </motion.span>
                  <span className="text-xs text-purple-300 mt-1 block">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
