"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  deadline: string; // ISO string
}

function getTimeLeft(deadline: Date) {
  const now = Date.now();
  const diff = deadline.getTime() - now;
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `Plus que ${hours}h${minutes.toString().padStart(2, "0")} pour commander !`;
  }
  return `Plus que ${minutes} minute${minutes > 1 ? "s" : ""} pour commander !`;
}

export default function LacDeadlineCountdown({ deadline }: Props) {
  const deadlineDate = new Date(deadline);
  const [text, setText] = useState<string | null>(() =>
    getTimeLeft(deadlineDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setText(getTimeLeft(deadlineDate));
    }, 30_000); // update every 30 seconds
    return () => clearInterval(timer);
  }, [deadline]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!text) return null;

  return (
    <div className="bg-orange/10 border border-orange/30 rounded-xl px-4 py-3 flex items-center gap-3 max-w-2xl mx-auto">
      <Clock size={20} className="text-orange shrink-0" />
      <p className="font-sans text-sm font-semibold text-orange">{text}</p>
    </div>
  );
}
