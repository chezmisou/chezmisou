import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'commandes.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// --- Menu ---

export interface MenuItem {
  nom: string;
  description: string;
  prix: number;
}

export interface Supplement {
  nom: string;
  prix: number;
}

export interface MenuData {
  menu: {
    choix_1: MenuItem;
    choix_2: MenuItem;
    choix_3: MenuItem;
  };
  supplements: {
    piment: Supplement;
    boisson: Supplement;
  };
  devise: string;
}

const DEFAULT_MENU: MenuData = {
  menu: {
    choix_1: { nom: "Banan Peze", description: "Bananes pesées + Pikliz + Poulet frit", prix: 0 },
    choix_2: { nom: "Riz Djondjon Poulet", description: "Riz djondjon + Poulet frit + Pikliz", prix: 0 },
    choix_3: { nom: "Complet Kreyòl", description: "Riz djondjon + Bananes pesées + Poulet frit + Pikliz", prix: 0 },
  },
  supplements: {
    piment: { nom: "Piment", prix: 0 },
    boisson: { nom: "Boisson", prix: 0 },
  },
  devise: "HTG",
};

export function getMenu(): MenuData {
  ensureDataDir();
  if (!fs.existsSync(MENU_FILE)) {
    fs.writeFileSync(MENU_FILE, JSON.stringify(DEFAULT_MENU, null, 2));
    return DEFAULT_MENU;
  }
  const raw = fs.readFileSync(MENU_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function updateMenu(data: MenuData): MenuData {
  ensureDataDir();
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2));
  return data;
}

// --- Commandes ---

export interface Commande {
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

function getOrders(): Commande[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveOrders(orders: Commande[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getAllCommandes(): Commande[] {
  return getOrders();
}

export function createCommande(data: Omit<Commande, 'id' | 'statut' | 'date'>): Commande {
  const orders = getOrders();
  const nextNum = orders.length + 1;
  const commande: Commande = {
    ...data,
    id: `CMD-${String(nextNum).padStart(3, '0')}`,
    statut: 'en_attente',
    date: new Date().toISOString(),
  };
  orders.push(commande);
  saveOrders(orders);
  return commande;
}

export function updateCommandeStatut(id: string, statut: 'en_attente' | 'servie'): Commande | null {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.statut = statut;
  saveOrders(orders);
  return order;
}
