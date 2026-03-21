'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MenuItem {
  nom: string;
  description: string;
  prix: number;
}

interface MenuData {
  menu: { choix_1: MenuItem; choix_2: MenuItem; choix_3: MenuItem };
  supplements: { piment: { nom: string; prix: number }; boisson: { nom: string; prix: number } };
  devise: string;
}

interface Commande {
  id: string;
  nom_client: string;
  telephone: string;
  choix: string;
  supplements: string[];
  quantite: number;
  total: number;
  statut: 'en_attente' | 'servie';
  date: string;
}

const ADMIN_PASSWORD = 'churchlunch2024';

const CHOIX_NAMES: Record<string, string> = {
  choix_1: 'Banan Peze',
  choix_2: 'Riz Djondjon Poulet',
  choix_3: 'Complet Kreyòl',
};

function formatPrice(prix: number, devise: string) {
  if (devise === 'HTG') return `${prix.toLocaleString()} HTG`;
  return `$${prix.toFixed(2)}`;
}

export default function AdminDashboard() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderCount = useRef(0);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': ADMIN_PASSWORD,
  }), []);

  const loadData = useCallback(async () => {
    try {
      const [menuRes, ordersRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/commandes', { headers: headers() }),
      ]);
      const menuData = await menuRes.json();
      const ordersData = await ordersRes.json();
      setMenu(menuData);

      if (Array.isArray(ordersData)) {
        if (prevOrderCount.current > 0 && ordersData.length > prevOrderCount.current && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        prevOrderCount.current = ordersData.length;
        setCommandes(ordersData);
      }
    } catch {
      // ignore
    }
  }, [headers]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const savePrices = async () => {
    if (!menu) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(menu),
      });
      setSaveMsg('Prix enregistrés!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const markAsServie = async (id: string) => {
    try {
      await fetch(`/api/commandes/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ statut: 'servie' }),
      });
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut: 'servie' } : c));
    } catch {
      // ignore
    }
  };

  const exportCSV = () => {
    const csvHeaders = 'Numéro,Nom,Téléphone,Choix,Suppléments,Quantité,Total,Statut,Date';
    const rows = commandes.map(c =>
      `${c.id},${c.nom_client},${c.telephone},${CHOIX_NAMES[c.choix] || c.choix},"${c.supplements.join(', ')}",${c.quantite},${c.total},${c.statut},${c.date}`
    );
    const csv = [csvHeaders, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enAttente = commandes.filter(c => c.statut === 'en_attente');
  const totalVentes = commandes.reduce((sum, c) => sum + c.total, 0);
  const devise = menu?.devise || 'HTG';

  const countPerChoix: Record<string, number> = {};
  commandes.forEach(c => {
    countPerChoix[c.choix] = (countPerChoix[c.choix] || 0) + c.quantite;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Notification sound */}
      <audio ref={audioRef} preload="none">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczFTyS2NzJcjgnPITW1s1/NxYtgdfVzoo3DyWA2NXPkTsMH4DZ1dCXPgkcgNnV0J1CDRqB2dXPoUQPG4HZ1dChRBAbgtnV0KFEEQ==" type="audio/wav" />
      </audio>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestion des prix et commandes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total commandes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{commandes.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">En attente</p>
          <p className="text-2xl font-bold text-orange-500">{enAttente.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Servies</p>
          <p className="text-2xl font-bold text-green-500">{commandes.length - enAttente.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total ventes</p>
          <p className="text-2xl font-bold text-[#D4A017]">{formatPrice(totalVentes, devise)}</p>
        </div>
      </div>

      {/* Plats vendus par choix */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Plats vendus par choix</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(CHOIX_NAMES).map(([key, name]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{name}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{countPerChoix[key] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price management */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Gestion des prix</h2>
        {menu && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Plats</h3>
              <div className="space-y-3">
                {Object.entries(menu.menu).map(([key, item]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-600 dark:text-gray-400">{item.nom}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.prix}
                        onChange={e => setMenu({
                          ...menu,
                          menu: { ...menu.menu, [key]: { ...item, prix: Number(e.target.value) || 0 } },
                        })}
                        className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#D4A017] focus:outline-none text-right"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{devise}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Suppléments</h3>
              <div className="space-y-3">
                {Object.entries(menu.supplements).map(([key, sup]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-600 dark:text-gray-400">{sup.nom}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={sup.prix}
                        onChange={e => setMenu({
                          ...menu,
                          supplements: { ...menu.supplements, [key]: { ...sup, prix: Number(e.target.value) || 0 } },
                        })}
                        className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#D4A017] focus:outline-none text-right"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{devise}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Devise</h3>
              <select
                value={menu.devise}
                onChange={e => setMenu({ ...menu, devise: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#D4A017] focus:outline-none"
              >
                <option value="HTG">HTG (Gourde haïtienne)</option>
                <option value="USD">$ (Dollar US)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={savePrices}
                disabled={saving}
                className="bg-[#D4A017] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#b8890f] transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les prix'}
              </button>
              {saveMsg && <span className="text-sm text-green-500 font-medium">{saveMsg}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Commandes</h2>
          <button
            onClick={exportCSV}
            className="text-sm px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Export CSV
          </button>
        </div>

        {commandes.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune commande pour le moment</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                  <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Tél</th>
                  <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Choix</th>
                  <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Suppl.</th>
                  <th className="text-center py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Qté</th>
                  <th className="text-right py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                  <th className="text-center py-2 font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                </tr>
              </thead>
              <tbody>
                {[...commandes].reverse().map(c => (
                  <tr key={c.id} className={`border-b border-gray-200 dark:border-gray-700 ${c.statut === 'en_attente' ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                    <td className="py-3 pr-3 font-mono text-xs">{c.id}</td>
                    <td className="py-3 pr-3 font-medium">{c.nom_client}</td>
                    <td className="py-3 pr-3 hidden md:table-cell text-gray-500 dark:text-gray-400">{c.telephone || '—'}</td>
                    <td className="py-3 pr-3">{CHOIX_NAMES[c.choix] || c.choix}</td>
                    <td className="py-3 pr-3 hidden md:table-cell text-gray-500 dark:text-gray-400">
                      {c.supplements.length > 0 ? c.supplements.map(s => s === 'piment' ? '🌶️' : '🥤').join(' ') : '—'}
                    </td>
                    <td className="py-3 pr-3 text-center">{c.quantite}</td>
                    <td className="py-3 pr-3 text-right font-semibold">{formatPrice(c.total, devise)}</td>
                    <td className="py-3 text-center">
                      {c.statut === 'servie' ? (
                        <span className="text-green-500 text-lg" title="Servie">✅</span>
                      ) : (
                        <button
                          onClick={() => markAsServie(c.id)}
                          className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Servir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {commandes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-bold">
            <span>Total des ventes</span>
            <span className="text-[#D4A017] text-lg">{formatPrice(totalVentes, devise)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
