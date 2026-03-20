"use client";

import { useState } from "react";
import {
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  ChefHat,
  Truck,
} from "lucide-react";
import { SAMPLE_PRODUCTS, CATEGORIES } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Tab = "overview" | "orders" | "products" | "menu";

// Simulated order data
const MOCK_ORDERS = [
  {
    id: "CM-ABC123",
    customer: "Marie Jean-Baptiste",
    phone: "+509 3456-7890",
    items: "2x Griyo, 1x Diri Djon Djon",
    total: 51,
    status: "RECEIVED" as const,
    type: "TRAITEUR" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "CM-DEF456",
    customer: "Pierre Louis",
    phone: "+509 4567-8901",
    items: "1x Poulet Créole, 1x Sos Pwa Nwa, 1x Diri Kolé",
    total: 42,
    status: "PREPARING" as const,
    type: "LUNCH_AFTER_CHURCH" as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "CM-GHI789",
    customer: "Sophia Duvivier",
    phone: "+509 5678-9012",
    items: "3x Krémas (Gwo boutèy)",
    total: 90,
    status: "READY" as const,
    type: "TRAITEUR" as const,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const STATUS_CONFIG = {
  RECEIVED: { label: "Resevwa", color: "bg-blue-100 text-blue-700", icon: Clock },
  PREPARING: { label: "Ap prepare", color: "bg-yellow-100 text-yellow-700", icon: ChefHat },
  READY: { label: "Pare", color: "bg-green-100 text-green-700", icon: Package },
  DELIVERING: { label: "Ap livre", color: "bg-purple-100 text-purple-700", icon: Truck },
  DELIVERED: { label: "Livre", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
  CANCELLED: { label: "Anile", color: "bg-red-100 text-red-700", icon: Clock },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview" as Tab, label: "Apèsi", icon: BarChart3 },
    { id: "orders" as Tab, label: "Kòmand", icon: ShoppingBag },
    { id: "products" as Tab, label: "Pwodwi", icon: Package },
    { id: "menu" as Tab, label: "Menu Dimanche", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Dashboard Admin</h1>
          <p className="text-brand-brown/60 text-sm mt-1">Byenvini, Misou!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-brand-blue text-white"
                : "bg-white text-brand-brown border border-brand-brown/20 hover:border-brand-blue"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "menu" && <MenuTab />}
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: "Kòmand Jodi a", value: "12", icon: ShoppingBag, color: "bg-brand-blue" },
    { label: "Revni Jodi a", value: "$486", icon: BarChart3, color: "bg-brand-green" },
    { label: "Kòmand an atant", value: "5", icon: Clock, color: "bg-brand-gold" },
    { label: "Kliyan Total", value: "89", icon: Users, color: "bg-brand-red" },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-brand-brown/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 className="font-semibold text-lg mb-4">Dènye Kòmand</h2>
      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status];
          const StatusIcon = statusConfig.icon;
          return (
            <div key={order.id} className="card p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  {order.type === "LUNCH_AFTER_CHURCH" && (
                    <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">
                      ⛪ Dimanche
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-brown/70">{order.customer}</p>
                <p className="text-xs text-brand-brown/50">{order.items}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-red">{formatPrice(order.total)}</p>
                <button className="text-xs text-brand-blue hover:underline mt-1">
                  Detay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredOrders =
    filter === "ALL"
      ? MOCK_ORDERS
      : MOCK_ORDERS.filter((o) => o.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === "ALL" ? "bg-brand-blue text-white" : "bg-white border border-gray-200"
          }`}
        >
          Tout ({MOCK_ORDERS.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              filter === key ? "bg-brand-blue text-white" : `${config.color}`
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status];
          return (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold">{order.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-brand-brown/50">Kliyan:</span> {order.customer}
                </div>
                <div>
                  <span className="text-brand-brown/50">Tel:</span> {order.phone}
                </div>
                <div className="col-span-2">
                  <span className="text-brand-brown/50">Atik:</span> {order.items}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-red">{formatPrice(order.total)}</span>
                <div className="flex gap-2">
                  <button className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                    Pwochen etap
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">Tout Pwodwi</h2>
        <button className="btn-primary text-sm flex items-center gap-1">
          <Plus size={16} />
          Nouvo Pwodwi
        </button>
      </div>

      {CATEGORIES.map((cat) => {
        const products = SAMPLE_PRODUCTS.filter((p) => p.category === cat.id);
        if (products.length === 0) return null;
        return (
          <div key={cat.id} className="mb-8">
            <h3 className="font-semibold text-sm text-brand-brown/50 uppercase tracking-wider mb-3">
              {cat.emoji} {cat.label}
            </h3>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                        product.available ? "bg-brand-green" : "bg-gray-400"
                      }`}
                    >
                      {product.nameCreole.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{product.nameCreole}</p>
                      <p className="text-xs text-brand-brown/50">{product.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        product.available ? "bg-brand-green" : "bg-gray-400"
                      }`}
                    />
                    <button className="text-brand-blue hover:underline text-xs">
                      Modifye
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MenuTab() {
  const sundayProducts = SAMPLE_PRODUCTS.filter((p) =>
    ["poulet-creole", "diri-kole-pwa", "sos-pwa-nwa", "griyo", "kremas", "pikliz"].includes(p.id)
  );

  return (
    <div>
      <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-4 mb-6">
        <h2 className="font-semibold text-brand-green mb-1">Menu Lunch After Church</h2>
        <p className="text-sm text-brand-brown/60">
          Gérez le menu hebdomadaire du dimanche. Les changements seront visibles immédiatement.
        </p>
      </div>

      <div className="space-y-3">
        {SAMPLE_PRODUCTS.map((product) => {
          const isInMenu = sundayProducts.some((p) => p.id === product.id);
          return (
            <div
              key={product.id}
              className={`card p-3 flex items-center justify-between ${
                isInMenu ? "ring-2 ring-brand-green" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-sm">{product.nameCreole}</p>
                  <p className="text-xs text-brand-brown/50">{formatPrice(product.price)}</p>
                </div>
              </div>
              <button
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isInMenu
                    ? "bg-brand-green text-white"
                    : "bg-gray-100 text-brand-brown/50 hover:bg-gray-200"
                }`}
              >
                {isInMenu ? "Nan Menu" : "Ajoute"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
