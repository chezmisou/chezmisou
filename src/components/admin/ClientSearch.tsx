"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function ClientSearch({
  currentQuery,
}: {
  currentQuery: string;
}) {
  const [query, setQuery] = useState(currentQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/admin/clients?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-chaud"
        />
        <input
          type="text"
          placeholder="Rechercher par nom ou email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc text-marron-profond placeholder:text-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange text-sm"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-orange text-blanc px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-vif transition-colors"
      >
        Rechercher
      </button>
    </div>
  );
}
