"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Plus,
  X,
  Check,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSunday,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
} from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface ChurchData {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface CalendarSlot {
  id?: string;
  date: string;
  churchId: string;
  churchName: string;
  churchColor: string;
  status: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

function getCalendarDays(currentMonth: Date) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  const startDow = getDay(start);
  const paddingBefore = startDow === 0 ? 6 : startDow - 1;
  const paddedStart: (Date | null)[] = Array(paddingBefore).fill(null);

  const allDays = [...paddedStart, ...days];
  const remainder = allDays.length % 7;
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      allDays.push(null);
    }
  }
  return allDays;
}

export default function PlanningPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <PlanningPage />
    </Suspense>
  );
}

function PlanningPage() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date");

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialDate) {
      return startOfMonth(new Date(initialDate));
    }
    return new Date();
  });
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDate || null
  );
  const [assigningChurch, setAssigningChurch] = useState<string | null>(null);

  const monthStr = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/lac/calendar?month=${monthStr}`)
        .then((r) => r.json())
        .catch(() => ({ slots: [] })),
      fetch("/api/lac/churches")
        .then((r) => r.json())
        .catch(() => ({ churches: [] })),
    ])
      .then(([calData, chData]) => {
        setSlots(calData.slots || []);
        setChurches(chData.churches || []);
      })
      .finally(() => setLoading(false));
  }, [monthStr]);

  useEffect(() => {
    if (initialDate && !showAssignModal) {
      setSelectedDate(initialDate);
      setShowAssignModal(true);
    }
  }, []);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const sundaySlotMap = useMemo(() => {
    const map: Record<string, CalendarSlot[]> = {};
    for (const s of slots) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [slots]);

  const activeChurches = churches.filter((c) => c.active);

  const handleAssign = async (churchId: string) => {
    if (!selectedDate) return;
    setAssigningChurch(churchId);
    try {
      const res = await fetch("/api/lac/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, churchId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const church = churches.find((c) => c.id === churchId);
      const newSlot: CalendarSlot = {
        id: data.slot?.id,
        date: selectedDate,
        churchId,
        churchName: church?.name || "",
        churchColor: church?.color || "#6366f1",
        status: "confirmed",
      };
      setSlots((prev) => [...prev, newSlot]);
      toast.success("Cr\u00E9neau assign\u00E9");
    } catch {
      toast.error("Erreur lors de l\u2019assignation");
    } finally {
      setAssigningChurch(null);
    }
  };

  const handleRemove = async (slot: CalendarSlot) => {
    if (!slot.id) return;
    try {
      const res = await fetch(`/api/lac/slots/${slot.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
      toast.success("Cr\u00E9neau retir\u00E9");
    } catch {
      toast.error("Erreur");
    }
  };

  const selectedDateSlots = selectedDate ? sundaySlotMap[selectedDate] || [] : [];
  const assignedChurchIds = new Set(selectedDateSlots.map((s) => s.churchId));

  const sundaySlots = useMemo(() => {
    const allSundays = calendarDays
      .filter((d) => d && isSunday(d) && isSameMonth(d, currentMonth))
      .map((d) => {
        const dateStr = format(d!, "yyyy-MM-dd");
        return {
          date: dateStr,
          dateObj: d!,
          slots: sundaySlotMap[dateStr] || [],
        };
      });
    return allSundays;
  }, [calendarDays, currentMonth, sundaySlotMap]);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planification</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Assignez les \u00E9glises aux dimanches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Calendar size={15} />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <List size={15} />
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </span>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "calendar" ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return (
                      <div
                        key={`pad-${idx}`}
                        className="bg-gray-50 dark:bg-gray-900/50 min-h-[90px] p-2"
                      />
                    );
                  }

                  const dateStr = format(day, "yyyy-MM-dd");
                  const sunday = isSunday(day);
                  const today = isToday(day);
                  const daySlots = sundaySlotMap[dateStr] || [];

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        if (sunday) {
                          setSelectedDate(dateStr);
                          setShowAssignModal(true);
                        }
                      }}
                      className={`min-h-[90px] p-2 transition-colors ${
                        sunday
                          ? "bg-white dark:bg-gray-900 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                          : "bg-gray-50 dark:bg-gray-900/50"
                      } ${today ? "ring-2 ring-inset ring-indigo-500" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            sunday
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-400 dark:text-gray-600"
                          } ${today ? "bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}
                        >
                          {format(day, "d")}
                        </span>
                        {sunday && (
                          <Plus
                            size={14}
                            className="text-indigo-400 opacity-0 group-hover:opacity-100"
                          />
                        )}
                      </div>
                      {sunday && daySlots.length > 0 && (
                        <div className="space-y-1">
                          {daySlots.map((s, si) => (
                            <div
                              key={si}
                              className="text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded-md truncate text-white"
                              style={{ backgroundColor: s.churchColor || "#6366f1" }}
                              title={s.churchName}
                            >
                              {s.churchName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    \u00C9glise
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sundaySlots.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Aucun dimanche ce mois-ci
                    </td>
                  </tr>
                ) : (
                  sundaySlots.flatMap((sunday) =>
                    sunday.slots.length === 0
                      ? [
                          <tr key={sunday.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                              {format(sunday.dateObj, "EEEE d MMMM", { locale: fr })}
                            </td>
                            <td className="px-4 py-3 text-gray-400 italic">\u2014 Non assign\u00E9</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                                Vide
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedDate(sunday.date);
                                  setShowAssignModal(true);
                                }}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Assigner
                              </button>
                            </td>
                          </tr>,
                        ]
                      : sunday.slots.map((slot, si) => (
                          <tr
                            key={`${sunday.date}-${si}`}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                              {si === 0 ? format(sunday.dateObj, "EEEE d MMMM", { locale: fr }) : ""}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: slot.churchColor || "#6366f1" }}
                                />
                                <span className="text-gray-900 dark:text-white">
                                  {slot.churchName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 capitalize">
                                {slot.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedDate(sunday.date);
                                  setShowAssignModal(true);
                                }}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Modifier
                              </button>
                            </td>
                          </tr>
                        ))
                  )
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign/Remove Modal */}
      <AnimatePresence>
        {showAssignModal && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setShowAssignModal(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Assigner des \u00E9glises
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                    {format(new Date(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
                {selectedDateSlots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Assign\u00E9es
                    </p>
                    {selectedDateSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: slot.churchColor || "#6366f1" }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {slot.churchName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemove(slot)}
                          className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  \u00C9glises disponibles
                </p>
                {activeChurches.filter((c) => !assignedChurchIds.has(c.id)).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Toutes les \u00E9glises actives sont d\u00E9j\u00E0 assign\u00E9es
                  </p>
                ) : (
                  activeChurches
                    .filter((c) => !assignedChurchIds.has(c.id))
                    .map((church) => (
                      <button
                        key={church.id}
                        onClick={() => handleAssign(church.id)}
                        disabled={assigningChurch === church.id}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all text-left disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: church.color || "#6366f1" }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {church.name}
                          </span>
                        </div>
                        {assigningChurch === church.id ? (
                          <span className="text-xs text-gray-400">...</span>
                        ) : (
                          <Plus size={16} className="text-indigo-500" />
                        )}
                      </button>
                    ))
                )}
              </div>

              <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <Check size={16} />
                  Termin\u00E9
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
