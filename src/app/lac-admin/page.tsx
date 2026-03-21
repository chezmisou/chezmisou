"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Church,
  CalendarDays,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
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
import Link from "next/link";

interface ChurchData {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface CalendarSlot {
  date: string;
  churchId: string;
  churchName: string;
  churchColor: string;
  status: string;
}

interface CalendarResponse {
  slots: CalendarSlot[];
}

interface ChurchesResponse {
  churches: ChurchData[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
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

export default function LacAdminDashboard() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

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
      .then(([calData, chData]: [CalendarResponse, ChurchesResponse]) => {
        setSlots(calData.slots || []);
        setChurches(chData.churches || []);
      })
      .finally(() => setLoading(false));
  }, [monthStr]);

  const activeChurches = churches.filter((c) => c.active);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const sundaySlotMap = useMemo(() => {
    const map: Record<string, CalendarSlot[]> = {};
    for (const s of slots) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [slots]);

  const sundays = calendarDays.filter((d) => d && isSunday(d) && isSameMonth(d, currentMonth));
  const sundaysWithoutSlots = sundays.filter((d) => {
    const key = format(d!, "yyyy-MM-dd");
    return !sundaySlotMap[key] || sundaySlotMap[key].length === 0;
  });

  const slotsThisMonth = slots.length;

  const stats = [
    {
      label: "\u00C9glises actives",
      value: activeChurches.length,
      icon: Church,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      label: "Cr\u00E9neaux ce mois",
      value: slotsThisMonth,
      icon: CalendarDays,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
    {
      label: "Dimanches sans cr\u00E9neau",
      value: sundaysWithoutSlots.length,
      icon: AlertTriangle,
      color: sundaysWithoutSlots.length > 0
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400",
      bg: sundaysWithoutSlots.length > 0
        ? "bg-amber-50 dark:bg-amber-950"
        : "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vue d&apos;ensemble de la planification LAC
          </p>
        </div>
        <Link
          href="/lac-admin/planning"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Planifier
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "\u2014" : stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calendrier mensuel
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Week headers */}
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

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="bg-gray-50 dark:bg-gray-900/50 min-h-[80px] p-2"
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
                  className={`min-h-[80px] p-2 transition-colors ${
                    sunday
                      ? "bg-white dark:bg-gray-900"
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
                    {sunday && daySlots.length === 0 && (
                      <Link
                        href={`/lac-admin/planning?date=${dateStr}`}
                        className="p-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-500"
                        title="Assigner rapidement"
                      >
                        <Plus size={14} />
                      </Link>
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
    </div>
  );
}
