"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface Product {
  id: string;
  nameFr: string;
  nameCr: string;
  category: string;
  size: string;
  price: number;
  defaultPrice: number;
  image: string;
  isActive: boolean;
  categoryInfo: {
    labelFr: string;
    labelCr: string;
    accentColor: string;
  };
}

interface NewProductForm {
  nameFr: string;
  nameCr: string;
  category: string;
  size: string;
  price: string;
  image: string;
}

const CATEGORY_ORDER = ["EPIS", "PIMENT", "KREMAS"];
const CATEGORY_LABELS: Record<string, { fr: string; cr: string; color: string }> = {
  EPIS: { fr: "Épices", cr: "Epis", color: "#D4A017" },
  PIMENT: { fr: "Piments", cr: "Piman", color: "#C0392B" },
  KREMAS: { fr: "Krémas", cr: "Krémas", color: "#8E6F47" },
};

export default function AdminEpicerieFinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [editedActive, setEditedActive] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    nameFr: "",
    nameCr: "",
    category: "EPIS",
    size: "",
    price: "",
    image: "🫙",
  });

  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/epicerie-fine/products?all=true");
      const data = await res.json();
      setProducts(data);
      setEditedPrices({});
      setEditedActive({});
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    fetchProducts();
  }, [status, isAdmin, router, fetchProducts]);

  const handlePriceChange = (id: string, value: number) => {
    setEditedPrices((prev) => ({ ...prev, [id]: value }));
  };

  const handleActiveToggle = (id: string, isActive: boolean) => {
    setEditedActive((prev) => ({ ...prev, [id]: isActive }));
  };

  const hasChanges = Object.keys(editedPrices).length > 0 || Object.keys(editedActive).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: { id: string; price?: number; isActive?: boolean }[] = [];

      for (const [id, price] of Object.entries(editedPrices)) {
        updates.push({ id, price });
      }
      for (const [id, isActive] of Object.entries(editedActive)) {
        const existing = updates.find((u) => u.id === id);
        if (existing) {
          existing.isActive = isActive;
        } else {
          updates.push({ id, isActive });
        }
      }

      const res = await fetch("/api/epicerie-fine/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        toast.success("Prix enregistrés avec succès !");
        await fetchProducts();
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const updates = products.map((p) => ({
        id: p.id,
        price: p.defaultPrice,
      }));

      const res = await fetch("/api/epicerie-fine/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        toast.success("Prix réinitialisés !");
        await fetchProducts();
      } else {
        toast.error("Erreur lors de la réinitialisation");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.nameFr || !newProduct.nameCr || !newProduct.size || !newProduct.price) {
      toast.error("Remplissez tous les champs");
      return;
    }
    try {
      const res = await fetch("/api/epicerie-fine/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
        }),
      });
      if (res.ok) {
        toast.success("Produit créé !");
        setShowNewForm(false);
        setNewProduct({ nameFr: "", nameCr: "", category: "EPIS", size: "", price: "", image: "🫙" });
        await fetchProducts();
      } else {
        toast.error("Erreur lors de la création");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const getDisplayPrice = (product: Product) => {
    return editedPrices[product.id] ?? product.price;
  };

  const getDisplayActive = (product: Product) => {
    return editedActive[product.id] ?? product.isActive;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF6F0" }}>
        <div className="text-xl" style={{ color: "#2C1810" }}>Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const groupedProducts = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    ...CATEGORY_LABELS[cat],
    products: products.filter((p) => p.category === cat),
  }));

  return (
    <div className="min-h-screen" style={{ background: "#FAF6F0" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: "#2C1810" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
              Admin — Épicerie Fine
            </h1>
            <p className="text-sm" style={{ color: "#D4A017" }}>
              Gestion des prix et des produits
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#D4A017", color: "#2C1810" }}
            >
              + Nouveau produit
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
              style={{ borderColor: "#D4A017", color: "#D4A017" }}
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: hasChanges ? "#D4A017" : "#8E6F47",
                color: "#2C1810",
                opacity: hasChanges ? 1 : 0.5,
              }}
            >
              {saving ? "Sauvegarde..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* New Product Form */}
        {showNewForm && (
          <div
            className="mb-8 p-6 rounded-2xl shadow-lg"
            style={{ background: "white", border: "2px solid #D4A017" }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "#2C1810", fontFamily: "Playfair Display, Georgia, serif" }}>
              Nouveau produit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Nom français"
                value={newProduct.nameFr}
                onChange={(e) => setNewProduct({ ...newProduct, nameFr: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              />
              <input
                placeholder="Nom créole"
                value={newProduct.nameCr}
                onChange={(e) => setNewProduct({ ...newProduct, nameCr: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              >
                <option value="EPIS">Épices / Epis</option>
                <option value="PIMENT">Piments / Piman</option>
                <option value="KREMAS">Krémas</option>
              </select>
              <input
                placeholder="Taille (ex: 250ml)"
                value={newProduct.size}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              />
              <input
                placeholder="Prix (€)"
                type="number"
                step="0.50"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              />
              <input
                placeholder="Emoji/Image"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                style={{ borderColor: "#8E6F47" }}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCreateProduct}
                className="px-6 py-2 rounded-lg font-medium"
                style={{ background: "#D4A017", color: "#2C1810" }}
              >
                Créer le produit
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-6 py-2 rounded-lg font-medium border"
                style={{ borderColor: "#8E6F47", color: "#5C3A28" }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Products grouped by category */}
        {groupedProducts.map((group) => (
          <section key={group.key} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: group.color }}
              />
              <h2
                className="text-xl font-bold"
                style={{ color: "#2C1810", fontFamily: "Playfair Display, Georgia, serif" }}
              >
                {group.fr}{" "}
                <span className="font-normal italic" style={{ color: "#5C3A28" }}>
                  / {group.cr}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {group.products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl shadow-sm transition-all"
                  style={{
                    background: "white",
                    borderLeft: `4px solid ${group.color}`,
                    opacity: getDisplayActive(product) ? 1 : 0.5,
                  }}
                >
                  {/* Emoji */}
                  <span className="text-3xl">{product.image}</span>

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold" style={{ color: "#2C1810" }}>
                      {product.nameFr}
                    </p>
                    <p className="italic text-sm" style={{ color: "#5C3A28" }}>
                      {product.nameCr}
                    </p>
                  </div>

                  {/* Size */}
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: `${group.color}20`, color: group.color }}
                  >
                    {product.size}
                  </span>

                  {/* Price input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={getDisplayPrice(product)}
                      onChange={(e) =>
                        handlePriceChange(product.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-3 py-2 border rounded-lg text-right font-mono font-bold"
                      style={{ borderColor: "#8E6F47", color: "#2C1810" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "#5C3A28" }}>
                      €
                    </span>
                  </div>

                  {/* Default price indicator */}
                  {getDisplayPrice(product) !== product.defaultPrice && (
                    <span className="text-xs" style={{ color: "#8E6F47" }}>
                      (défaut: {product.defaultPrice.toFixed(2)}€)
                    </span>
                  )}

                  {/* Active toggle */}
                  <button
                    onClick={() => handleActiveToggle(product.id, !getDisplayActive(product))}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{
                      background: getDisplayActive(product) ? group.color : "#ccc",
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{
                        left: getDisplayActive(product) ? "26px" : "2px",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
