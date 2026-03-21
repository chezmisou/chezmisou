"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Church } from "lucide-react";

interface SlotData {
  id: string;
  date: string;
  status: string;
  maxParticipants: number | null;
  notes: string | null;
}

export default function ChurchCalendarPage() {
  const { data: session } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);

  const churchId = (session?.user as any)?.churchId;

  const fetchSlots = useCallback(async () => {
    if (!churchId) return;

    try {
      const res = await fetch(
        `/api/lac/slots?churchId=${churchId}&limit=200`
      );
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const slotDates = useMemo(() => {
    const map = new Map<string, SlotData>();
    slots.forEach((slot) => {
      const key = format(parseISO(slot.date), "yyyy-MM-dd");
      map.set(key, slot);
    });
    return map;
  }, [slots]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Start week on Monday (locale: fr)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement du calendrier...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Calendrier LAC</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vos dimanches assignés pour le service Lunch After Church
        </p>
      </motion.div>

      {/* Calendar card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden"
      >
        {/* Month navigation */}
        <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-4 sm:p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const slot = slotDates.get(dateKey);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const isSunday = day.getDay() === 0;
              const hasSlot = !!slot;

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005, duration: 0.2 }}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isCurrentDay && !hasSlot ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}
                    ${hasSlot ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-purple-200/50 cursor-default" : ""}
                    ${!hasSlot && isCurrentMonth && isSunday ? "bg-purple-50 text-purple-700 font-medium" : ""}
                    ${!hasSlot && isCurrentMonth && !isSunday ? "text-gray-700 hover:bg-gray-50" : ""}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium
                      ${hasSlot ? "text-white" : ""}
                      ${isCurrentDay && !hasSlot ? "text-indigo-700 font-bold" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {hasSlot && (
                    <Church className="w-3 h-3 mt-0.5 text-white/80" />
                  )}
                  {isCurrentDay && (
                    <div
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        hasSlot ? "bg-white/80" : "bg-indigo-500"
                      }`}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-purple-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="text-xs text-gray-600">Dimanche LAC assigné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-50 border border-purple-200" />
            <span className="text-xs text-gray-600">Dimanche (non assigné)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-indigo-300 bg-indigo-50" />
            <span className="text-xs text-gray-600">Aujourd&apos;hui</span>
          </div>
        </div>
      </motion.div>

      {/* Upcoming list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-purple-50 flex items-center gap-3">
          <Church className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Tous vos dimanches LAC
          </h2>
        </div>
        <div className="p-6">
          {slots.length > 0 ? (
            <div className="space-y-2">
              {slots
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map((slot, i) => {
                  const slotDate = parseISO(slot.date);
                  const isPastDate = slotDate < new Date() && !isToday(slotDate);

                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i, duration: 0.3 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isPastDate
                          ? "bg-gray-50 text-gray-400"
                          : isToday(slotDate)
                          ? "bg-green-50 border border-green-200"
                          : "bg-indigo-50 border border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isPastDate
                              ? "bg-gray-300"
                              : isToday(slotDate)
                              ? "bg-green-500"
                              : "bg-indigo-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium capitalize ${
                            isPastDate ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {format(slotDate, "EEEE d MMMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                      {isToday(slotDate) && (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                          Aujourd&apos;hui
                        </span>
                      )}
                      {isPastDate && (
                        <span className="text-xs text-gray-400">Passé</span>
                      )}
                      {!isPastDate && !isToday(slotDate) && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
                          A venir
                        </span>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Aucun dimanche LAC assigné
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
