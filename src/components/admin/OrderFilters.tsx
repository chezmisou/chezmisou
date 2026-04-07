"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const statuses = [
  { value: "ALL", label: "Toutes" },
  { value: "new", label: "Nouvelles" },
  { value: "paid", label: "Payées" },
  { value: "preparing", label: "En préparation" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
  { value: "refunded", label: "Remboursées" },
];

const types = [
  { value: "ALL", label: "Tous les types" },
  { value: "epicerie", label: "Épicerie" },
  { value: "lac", label: "LAC" },
];

interface Props {
  currentStatus: string;
  currentType: string;
  currentQuery: string;
}

export default function OrderFilters({
  currentStatus,
  currentType,
  currentQuery,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/commandes?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("q", query);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => updateFilter("status", s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentStatus === s.value
                ? "bg-orange text-blanc"
                : "bg-blanc text-text-body border border-marron-doux/20 hover:border-orange"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 sm:ml-auto">
        <select
          value={currentType}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-marron-doux/20 bg-blanc text-sm text-marron-profond focus:border-orange focus:outline-none"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="N° ou email…"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-marron-doux/20 bg-blanc text-sm text-marron-profond focus:border-orange focus:outline-none w-40"
            />
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gris-chaud"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
