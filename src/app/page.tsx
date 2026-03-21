'use client';

import { useState, useEffect, useCallback } from 'react';

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

const EMOJIS: Record<string, string> = {
  choix_1: '🍌',
  choix_2: '🍚',
  choix_3: '🍗',
};

function formatPrice(prix: number, devise: string) {
  if (devise === 'HTG') return `${prix.toLocaleString()} HTG`;
  return `$${prix.toFixed(2)}`;
}

export default function ClientPage() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [selectedChoix, setSelectedChoix] = useState<string | null>(null);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [quantite, setQuantite] = useState(1);
  const [nomClient, setNomClient] = useState('');
  const [telephone, setTelephone] = useState('');
  const [showRecap, setShowRecap] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const menuNotConfigured = menu && Object.values(menu.menu).every(item => item.prix === 0);

  const toggleSupplement = (key: string) => {
    setSupplements(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const calculateTotal = useCallback(() => {
    if (!menu || !selectedChoix) return 0;
    const choixKey = selectedChoix as keyof typeof menu.menu;
    let total = menu.menu[choixKey].prix * quantite;
    for (const sup of supplements) {
      const supKey = sup as keyof typeof menu.supplements;
      total += menu.supplements[supKey].prix * quantite;
    }
    return total;
  }, [menu, selectedChoix, supplements, quantite]);

  const handleSubmit = async () => {
    if (!menu || !selectedChoix || !nomClient.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_client: nomClient.trim(),
          telephone: telephone.trim(),
          choix: selectedChoix,
          supplements,
          quantite,
          total: calculateTotal(),
        }),
      });
      const data = await res.json();
      setConfirmation(data.id);
      setShowRecap(false);
      setSelectedChoix(null);
      setSupplements([]);
      setQuantite(1);
      setNomClient('');
      setTelephone('');
    } catch {
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4A017] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-[#A0522D] text-white py-6 px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-display font-bold">🍗 Lunch After Church</h1>
          <p className="font-accent text-lg opacity-90 mt-1">Bon manje, bon konpayi</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-display font-bold text-[#3B2314] mb-2">Mèsi anpil!</h2>
            <p className="text-[#3B2314]/70 mb-4">Votre commande a été enregistrée avec succès.</p>
            <div className="bg-[#FFFDF7] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#3B2314]/60">Numéro de commande</p>
              <p className="text-2xl font-bold text-[#D4A017]">{confirmation}</p>
            </div>
            <p className="text-sm text-[#3B2314]/60 mb-6">Présentez ce numéro lors du retrait de votre commande.</p>
            <button
              onClick={() => setConfirmation(null)}
              className="btn-gold w-full"
            >
              Passer une autre commande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#A0522D] text-white py-6 px-4 text-center shadow-lg">
        <h1 className="text-2xl md:text-3xl font-display font-bold">🍗 Lunch After Church</h1>
        <p className="font-accent text-lg opacity-90 mt-1">Bon manje, bon konpayi</p>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6">
        {menuNotConfigured ? (
          <div className="bg-[#FFF3CD] border border-[#D4A017] rounded-2xl p-6 text-center mt-8">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="text-xl font-display font-bold text-[#3B2314] mb-2">Menu pas encore configuré</h2>
            <p className="text-[#3B2314]/70">Les prix n&apos;ont pas encore été définis. Revenez bientôt!</p>
          </div>
        ) : (
          <>
            {/* Menu choices */}
            <h2 className="text-xl font-display font-bold text-[#3B2314] mt-4 mb-3">Choisissez votre plat</h2>
            <div className="space-y-3">
              {menu && Object.entries(menu.menu).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedChoix(key); setShowRecap(false); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedChoix === key
                      ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-md'
                      : 'border-gray-200 bg-white hover:border-[#D4A017]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{EMOJIS[key]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#3B2314]">{item.nom}</h3>
                        <span className="font-bold text-[#D4A017] whitespace-nowrap ml-2">
                          {formatPrice(item.prix, menu.devise)}
                        </span>
                      </div>
                      <p className="text-sm text-[#3B2314]/60 mt-1">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Supplements */}
            {selectedChoix && menu && (
              <div className="mt-6">
                <h2 className="text-xl font-display font-bold text-[#3B2314] mb-3">Suppléments</h2>
                <div className="space-y-2">
                  {Object.entries(menu.supplements).map(([key, sup]) => (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        supplements.includes(key)
                          ? 'border-[#D4A017] bg-[#D4A017]/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          supplements.includes(key)
                            ? 'bg-[#D4A017] border-[#D4A017]'
                            : 'border-gray-300'
                        }`}>
                          {supplements.includes(key) && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-[#3B2314]">
                          {key === 'piment' ? '🌶️' : '🥤'} {sup.nom}
                        </span>
                      </div>
                      <span className="font-bold text-[#D4A017]">
                        +{formatPrice(sup.prix, menu.devise)}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={supplements.includes(key)}
                        onChange={() => toggleSupplement(key)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {selectedChoix && (
              <div className="mt-6">
                <h2 className="text-xl font-display font-bold text-[#3B2314] mb-3">Quantité</h2>
                <div className="flex items-center gap-4 bg-white rounded-xl border-2 border-gray-200 p-3 w-fit">
                  <button
                    onClick={() => setQuantite(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantite}</span>
                  <button
                    onClick={() => setQuantite(q => q + 1)}
                    className="w-10 h-10 rounded-lg bg-[#D4A017] hover:bg-[#b8890f] text-white flex items-center justify-center text-xl font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Customer info */}
            {selectedChoix && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#3B2314] mb-3">Vos informations</h2>
                <div>
                  <label className="block text-sm font-medium text-[#3B2314]/70 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nomClient}
                    onChange={e => setNomClient(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B2314]/70 mb-1">
                    Téléphone <span className="text-[#3B2314]/40">(optionnel)</span>
                  </label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="Numéro de téléphone"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none transition-colors bg-white"
                  />
                </div>
              </div>
            )}

            {/* Recap button */}
            {selectedChoix && nomClient.trim() && !showRecap && (
              <button
                onClick={() => setShowRecap(true)}
                className="btn-gold w-full mt-6 text-lg"
              >
                Voir le récapitulatif
              </button>
            )}

            {/* Recap */}
            {showRecap && menu && selectedChoix && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-[#D4A017] p-5">
                <h3 className="font-display font-bold text-lg text-[#3B2314] mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{EMOJIS[selectedChoix]} {menu.menu[selectedChoix as keyof typeof menu.menu].nom} × {quantite}</span>
                    <span className="font-semibold">
                      {formatPrice(menu.menu[selectedChoix as keyof typeof menu.menu].prix * quantite, menu.devise)}
                    </span>
                  </div>
                  {supplements.map(s => (
                    <div key={s} className="flex justify-between text-[#3B2314]/70">
                      <span>{s === 'piment' ? '🌶️' : '🥤'} {menu.supplements[s as keyof typeof menu.supplements].nom} × {quantite}</span>
                      <span>{formatPrice(menu.supplements[s as keyof typeof menu.supplements].prix * quantite, menu.devise)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-[#D4A017]">{formatPrice(calculateTotal(), menu.devise)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-[#3B2314]/60">
                  <p><strong>Nom:</strong> {nomClient}</p>
                  {telephone && <p><strong>Tél:</strong> {telephone}</p>}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-red w-full mt-4 text-lg disabled:opacity-50"
                >
                  {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-[#3B2314]/40">
        Lunch After Church &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
