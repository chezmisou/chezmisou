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

const CHOIX_NAMES: Record<string, string> = {
  choix_1: 'Banan Peze',
  choix_2: 'Riz Djondjon Poulet',
  choix_3: 'Complet Kreyòl',
};

function formatPrice(prix: number, devise: string) {
  if (devise === 'HTG') return `${prix.toLocaleString()} HTG`;
  return `$${prix.toFixed(2)}`;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const storedPassword = useRef('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderCount = useRef(0);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': storedPassword.current,
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
    if (!authenticated) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [authenticated, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    storedPassword.current = password;
    try {
      const res = await fetch('/api/commandes', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Mot de passe incorrect');
      }
    } catch {
      setAuthError('Erreur de connexion');
    }
  };

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

  // Count per choice
  const countPerChoix: Record<string, number> = {};
  commandes.forEach(c => {
    countPerChoix[c.choix] = (countPerChoix[c.choix] || 0) + c.quantite;
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1210] p-4">
        <div className="bg-[#2a2018] rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <h1 className="text-2xl font-bold text-[#D4A017] text-center mb-2">🔒 Admin</h1>
          <p className="text-[#a89080] text-center text-sm mb-6">Lunch After Church</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 rounded-xl bg-[#3d3028] border border-[#5a4838] text-[#f5e6d3] placeholder-[#a89080] focus:border-[#D4A017] focus:outline-none mb-4"
            />
            {authError && <p className="text-red-400 text-sm mb-3 text-center">{authError}</p>}
            <button type="submit" className="w-full bg-[#D4A017] text-white py-3 rounded-xl font-semibold hover:bg-[#b8890f] transition-colors">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const bg = darkMode ? 'bg-[#1a1210]' : 'bg-gray-50';
  const surface = darkMode ? 'bg-[#2a2018]' : 'bg-white';
  const border = darkMode ? 'border-[#3d3028]' : 'border-gray-200';
  const text = darkMode ? 'text-[#f5e6d3]' : 'text-[#3B2314]';
  const textMuted = darkMode ? 'text-[#a89080]' : 'text-[#3B2314]/60';
  const inputBg = darkMode ? 'bg-[#3d3028] border-[#5a4838] text-[#f5e6d3]' : 'bg-white border-gray-200 text-[#3B2314]';

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Notification sound */}
      <audio ref={audioRef} preload="none">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczFTyS2NzJcjgnPITW1s1/NxYtgdfVzoo3DyWA2NXPkTsMH4DZ1dCXPgkcgNnV0J1CDRqB2dXPoUQPG4HZ1dChRBAbgtnV0KFEEQ==" type="audio/wav" />
      </audio>

      {/* Header */}
      <header className={`${surface} border-b ${border} py-4 px-4 md:px-8 flex items-center justify-between`}>
        <div>
          <h1 className="text-xl font-bold">🍗 Admin — Lunch After Church</h1>
          <p className={`text-sm ${textMuted}`}>Gestion des prix et commandes</p>
        </div>
        <div className="flex items-center gap-3">
          {enAttente.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              {enAttente.length} en attente
            </span>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-[#3d3028]' : 'bg-gray-100'} transition-colors`}
            title="Mode sombre"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`${surface} border ${border} rounded-xl p-4`}>
            <p className={`text-xs ${textMuted}`}>Total commandes</p>
            <p className="text-2xl font-bold">{commandes.length}</p>
          </div>
          <div className={`${surface} border ${border} rounded-xl p-4`}>
            <p className={`text-xs ${textMuted}`}>En attente</p>
            <p className="text-2xl font-bold text-orange-500">{enAttente.length}</p>
          </div>
          <div className={`${surface} border ${border} rounded-xl p-4`}>
            <p className={`text-xs ${textMuted}`}>Servies</p>
            <p className="text-2xl font-bold text-green-500">{commandes.length - enAttente.length}</p>
          </div>
          <div className={`${surface} border ${border} rounded-xl p-4`}>
            <p className={`text-xs ${textMuted}`}>Total ventes</p>
            <p className="text-2xl font-bold text-[#D4A017]">{formatPrice(totalVentes, devise)}</p>
          </div>
        </div>

        {/* Plats vendus par choix */}
        <div className={`${surface} border ${border} rounded-xl p-5`}>
          <h3 className="font-bold mb-3">Plats vendus par choix</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(CHOIX_NAMES).map(([key, name]) => (
              <div key={key} className={`${darkMode ? 'bg-[#3d3028]' : 'bg-gray-50'} rounded-lg p-3 text-center`}>
                <p className={`text-xs ${textMuted}`}>{name}</p>
                <p className="text-xl font-bold">{countPerChoix[key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price management */}
        <div className={`${surface} border ${border} rounded-xl p-5`}>
          <h2 className="text-lg font-bold mb-4">💰 Gestion des prix</h2>
          {menu && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Plats</h3>
                <div className="space-y-3">
                  {Object.entries(menu.menu).map(([key, item]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className={`flex-1 text-sm ${textMuted}`}>{item.nom}</label>
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
                          className={`w-28 px-3 py-2 rounded-lg border ${inputBg} focus:border-[#D4A017] focus:outline-none text-right`}
                        />
                        <span className={`text-xs ${textMuted}`}>{devise}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Suppléments</h3>
                <div className="space-y-3">
                  {Object.entries(menu.supplements).map(([key, sup]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className={`flex-1 text-sm ${textMuted}`}>{sup.nom}</label>
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
                          className={`w-28 px-3 py-2 rounded-lg border ${inputBg} focus:border-[#D4A017] focus:outline-none text-right`}
                        />
                        <span className={`text-xs ${textMuted}`}>{devise}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Devise</h3>
                <select
                  value={menu.devise}
                  onChange={e => setMenu({ ...menu, devise: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${inputBg} focus:border-[#D4A017] focus:outline-none`}
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
        <div className={`${surface} border ${border} rounded-xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">📋 Commandes</h2>
            <button
              onClick={exportCSV}
              className={`text-sm px-4 py-2 rounded-lg ${darkMode ? 'bg-[#3d3028] hover:bg-[#4d4038]' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              📥 Export CSV
            </button>
          </div>

          {commandes.length === 0 ? (
            <p className={`text-center py-8 ${textMuted}`}>Aucune commande pour le moment</p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${border}`}>
                    <th className="text-left py-2 pr-3 font-semibold">#</th>
                    <th className="text-left py-2 pr-3 font-semibold">Client</th>
                    <th className="text-left py-2 pr-3 font-semibold hidden md:table-cell">Tél</th>
                    <th className="text-left py-2 pr-3 font-semibold">Choix</th>
                    <th className="text-left py-2 pr-3 font-semibold hidden md:table-cell">Suppl.</th>
                    <th className="text-center py-2 pr-3 font-semibold">Qté</th>
                    <th className="text-right py-2 pr-3 font-semibold">Total</th>
                    <th className="text-center py-2 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {[...commandes].reverse().map(c => (
                    <tr key={c.id} className={`border-b ${border} ${c.statut === 'en_attente' ? (darkMode ? 'bg-orange-900/10' : 'bg-orange-50') : ''}`}>
                      <td className="py-3 pr-3 font-mono text-xs">{c.id}</td>
                      <td className="py-3 pr-3 font-medium">{c.nom_client}</td>
                      <td className={`py-3 pr-3 hidden md:table-cell ${textMuted}`}>{c.telephone || '—'}</td>
                      <td className="py-3 pr-3">{CHOIX_NAMES[c.choix] || c.choix}</td>
                      <td className={`py-3 pr-3 hidden md:table-cell ${textMuted}`}>
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
            <div className={`mt-4 pt-4 border-t ${border} flex justify-between items-center font-bold`}>
              <span>Total des ventes</span>
              <span className="text-[#D4A017] text-lg">{formatPrice(totalVentes, devise)}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
