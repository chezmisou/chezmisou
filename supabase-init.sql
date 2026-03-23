-- =============================================================================
-- Chez Misou — Script SQL COMPLET pour Supabase
-- Base PostgreSQL vierge — Compatible Prisma (PascalCase, guillemets)
-- Idempotent : peut être ré-exécuté sans erreur
-- =============================================================================

-- =============================================================================
-- SECTION 1 : CRÉATION DES ENUMS
-- =============================================================================

DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN', 'SUPER_ADMIN', 'CHURCH_MANAGER'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "Category" AS ENUM ('RIZ', 'SAUCES', 'VIANDES', 'BOISSONS', 'EPICES'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "OrderType" AS ENUM ('TRAITEUR', 'LUNCH_AFTER_CHURCH'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "SlotStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY_FIRST', 'MONTHLY_SECOND', 'MONTHLY_THIRD', 'MONTHLY_FOURTH', 'MONTHLY_LAST'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "EpicerieCategory" AS ENUM ('EPIS', 'PIMENT', 'KREMAS'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- SECTION 2 : CRÉATION DES TABLES
-- =============================================================================

-- Table "Church"
CREATE TABLE IF NOT EXISTS "Church" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "logoUrl" TEXT,
  "color" TEXT NOT NULL DEFAULT '#6366f1',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table "User"
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "password" TEXT,
  "role" "Role" NOT NULL DEFAULT 'CLIENT',
  "churchId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table "Address"
CREATE TABLE IF NOT EXISTS "Address" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "label" TEXT,
  "street" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT,
  "zipCode" TEXT,
  "country" TEXT NOT NULL DEFAULT 'Haiti',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table "Product"
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameCreole" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "image" TEXT,
  "category" "Category" NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table "Size"
CREATE TABLE IF NOT EXISTS "Size" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "labelCreole" TEXT NOT NULL,
  "servings" TEXT NOT NULL,
  "priceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "productId" TEXT NOT NULL,
  CONSTRAINT "Size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table "Order"
CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "guestEmail" TEXT,
  "guestPhone" TEXT,
  "guestName" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
  "type" "OrderType" NOT NULL DEFAULT 'TRAITEUR',
  "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'DELIVERY',
  "deliveryAddress" TEXT,
  "addressId" TEXT,
  "deliverySlot" TEXT,
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "stripePaymentId" TEXT,
  "promoCode" TEXT,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table "OrderItem"
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sizeId" TEXT,
  "quantity" INTEGER NOT NULL,
  "customizations" JSONB,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "totalPrice" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table "WeeklyMenu"
CREATE TABLE IF NOT EXISTS "WeeklyMenu" (
  "id" TEXT PRIMARY KEY,
  "weekStartDate" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table "WeeklyMenuItem"
CREATE TABLE IF NOT EXISTS "WeeklyMenuItem" (
  "id" TEXT PRIMARY KEY,
  "weeklyMenuId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "maxQuantity" INTEGER,
  "soldCount" INTEGER NOT NULL DEFAULT 0,
  "available" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "WeeklyMenuItem_weeklyMenuId_fkey" FOREIGN KEY ("weeklyMenuId") REFERENCES "WeeklyMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WeeklyMenuItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table "PromoCode"
CREATE TABLE IF NOT EXISTS "PromoCode" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "discountType" "DiscountType" NOT NULL,
  "discountValue" DOUBLE PRECISION NOT NULL,
  "validUntil" TIMESTAMP(3),
  "maxUses" INTEGER,
  "currentUses" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table "SiteConfig"
CREATE TABLE IF NOT EXISTS "SiteConfig" (
  "id" TEXT PRIMARY KEY,
  "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "freeDeliveryMinimum" DOUBLE PRECISION NOT NULL DEFAULT 50,
  "deliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 15,
  "sundayDeadline" TEXT NOT NULL DEFAULT 'Saturday 20:00',
  "pickupAddress" TEXT NOT NULL DEFAULT '',
  "pickupHours" TEXT NOT NULL DEFAULT ''
);

-- Table "AccessSlot"
CREATE TABLE IF NOT EXISTS "AccessSlot" (
  "id" TEXT PRIMARY KEY,
  "churchId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" "SlotStatus" NOT NULL DEFAULT 'SCHEDULED',
  "maxParticipants" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessSlot_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AccessSlot_churchId_date_key" UNIQUE ("churchId", "date")
);

-- Table "RecurrenceRule"
CREATE TABLE IF NOT EXISTS "RecurrenceRule" (
  "id" TEXT PRIMARY KEY,
  "churchId" TEXT NOT NULL,
  "frequency" "RecurrenceFrequency" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecurrenceRule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table "LacConfig"
CREATE TABLE IF NOT EXISTS "LacConfig" (
  "id" TEXT PRIMARY KEY,
  "maxChurchesPerSunday" INTEGER NOT NULL DEFAULT 1,
  "defaultStartTime" TEXT NOT NULL DEFAULT '12:00',
  "defaultEndTime" TEXT NOT NULL DEFAULT '15:00',
  "reminderEmailsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3
);

-- Table "EpicerieCategoryInfo"
CREATE TABLE IF NOT EXISTS "EpicerieCategoryInfo" (
  "id" TEXT PRIMARY KEY,
  "key" "EpicerieCategory" NOT NULL UNIQUE,
  "labelFr" TEXT NOT NULL,
  "labelCr" TEXT NOT NULL,
  "accentColor" TEXT NOT NULL
);

-- Table "EpicerieProduct"
CREATE TABLE IF NOT EXISTS "EpicerieProduct" (
  "id" TEXT PRIMARY KEY,
  "nameFr" TEXT NOT NULL,
  "nameCr" TEXT NOT NULL,
  "category" "EpicerieCategory" NOT NULL,
  "size" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "defaultPrice" DOUBLE PRECISION NOT NULL,
  "image" TEXT NOT NULL DEFAULT '🫙',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EpicerieProduct_category_fkey" FOREIGN KEY ("category") REFERENCES "EpicerieCategoryInfo"("key") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table "lac_menu" (custom, pas dans Prisma)
CREATE TABLE IF NOT EXISTS "lac_menu" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL CHECK ("type" IN ('menu', 'supplement')),
  "nom" TEXT NOT NULL,
  "description" TEXT,
  "prix" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "devise" TEXT NOT NULL DEFAULT 'HTG',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger auto-update "updated_at" pour lac_menu
CREATE OR REPLACE FUNCTION update_lac_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lac_menu_updated_at ON "lac_menu";
CREATE TRIGGER trigger_lac_menu_updated_at
  BEFORE UPDATE ON "lac_menu"
  FOR EACH ROW
  EXECUTE FUNCTION update_lac_menu_updated_at();

-- =============================================================================
-- SECTION 3 : SEED DATA
-- =============================================================================

-- -------------------------
-- Churches (5 églises)
-- -------------------------
INSERT INTO "Church" ("id", "name", "slug", "contactName", "contactEmail", "color") VALUES
  ('clchurch001', 'Évidence',       'evidence',       'Pasteur Marc',  'contact@evidence-church.fr', '#8b5cf6'),
  ('clchurch002', 'Parole de Vie',  'parole-de-vie',  'Pasteur Jean',  'contact@parolevie.fr',       '#06b6d4'),
  ('clchurch003', 'ICC Paris',      'icc-paris',      'Pasteur David', 'contact@icc-paris.fr',       '#f59e0b'),
  ('clchurch004', 'Hillsong Paris', 'hillsong-paris', 'Pasteur Sarah', 'contact@hillsong.fr',        '#ef4444'),
  ('clchurch005', 'C3 Church',      'c3-church',      'Pasteur Paul',  'contact@c3church.fr',        '#10b981')
ON CONFLICT DO NOTHING;

-- -------------------------
-- LacConfig (config par défaut)
-- -------------------------
INSERT INTO "LacConfig" ("id", "maxChurchesPerSunday", "defaultStartTime", "defaultEndTime", "reminderEmailsEnabled", "reminderDaysBefore") VALUES
  ('lac-config-default', 1, '12:00', '15:00', true, 3)
ON CONFLICT DO NOTHING;

-- -------------------------
-- SiteConfig (config par défaut)
-- -------------------------
INSERT INTO "SiteConfig" ("id", "minOrderAmount", "deliveryFee", "freeDeliveryMinimum", "deliveryRadiusKm", "sundayDeadline", "pickupAddress", "pickupHours") VALUES
  ('site-config-default', 10, 5, 50, 15, 'Saturday 20:00', '', '')
ON CONFLICT DO NOTHING;

-- -------------------------
-- EpicerieCategoryInfo (3 catégories)
-- -------------------------
INSERT INTO "EpicerieCategoryInfo" ("id", "key", "labelFr", "labelCr", "accentColor") VALUES
  ('epicat-epis',   'EPIS',   'Épices',  'Epis',   '#D4A017'),
  ('epicat-piment', 'PIMENT', 'Piments', 'Piman',  '#C0392B'),
  ('epicat-kremas', 'KREMAS', 'Krémas',  'Krémas', '#8E6F47')
ON CONFLICT DO NOTHING;

-- -------------------------
-- EpicerieProduct (7 produits)
-- -------------------------
INSERT INTO "EpicerieProduct" ("id", "nameFr", "nameCr", "category", "size", "price", "defaultPrice", "image") VALUES
  ('epiprod-epis-sm',   'Pot d''Épice Petit',   'Ti Pot Epis',       'EPIS',   '250ml', 8.50,  8.50,  '🫙'),
  ('epiprod-epis-md',   'Pot d''Épice Moyen',   'Pot Epis Mwayen',   'EPIS',   '500ml', 14.00, 14.00, '🫙'),
  ('epiprod-epis-lg',   'Pot d''Épice Grand',   'Gwo Pot Epis',      'EPIS',   '1L',    22.00, 22.00, '🫙'),
  ('epiprod-piment-sm', 'Pot de Piment Petit',  'Ti Pot Piman',      'PIMENT', '150ml', 6.50,  6.50,  '🌶️'),
  ('epiprod-piment-md', 'Pot de Piment Moyen',  'Pot Piman Mwayen',  'PIMENT', '350ml', 11.00, 11.00, '🌶️'),
  ('epiprod-piment-lg', 'Pot de Piment Grand',  'Gwo Pot Piman',     'PIMENT', '500ml', 16.50, 16.50, '🌶️'),
  ('epiprod-kremas',    'Kremas Bouteille',     'Krémas an Boutèy',  'KREMAS', '750ml', 18.00, 18.00, '🥥')
ON CONFLICT DO NOTHING;

-- -------------------------
-- lac_menu (5 items)
-- -------------------------
INSERT INTO "lac_menu" ("id", "key", "type", "nom", "description", "prix", "sort_order") VALUES
  ('lac-menu-001', 'choix_1',            'menu',       'Banan Peze',          'Bananes pesées + Pikliz + Poulet frit',                       500, 1),
  ('lac-menu-002', 'choix_2',            'menu',       'Riz Djondjon Poulet', 'Riz djondjon + Poulet frit + Pikliz',                         500, 2),
  ('lac-menu-003', 'choix_3',            'menu',       'Complet Kreyòl',      'Riz djondjon + Bananes pesées + Poulet frit + Pikliz',        700, 3),
  ('lac-menu-004', 'supplement_piment',  'supplement', 'Piment',              NULL,                                                           50, 10),
  ('lac-menu-005', 'supplement_boisson', 'supplement', 'Boisson',             NULL,                                                          100, 11)
ON CONFLICT DO NOTHING;

-- -------------------------
-- User admin
-- -------------------------
INSERT INTO "User" ("id", "email", "name", "role", "password") VALUES
  ('cladmin001', 'admin@lac.fr', 'Admin LAC', 'SUPER_ADMIN', NULL)
ON CONFLICT DO NOTHING;

-- -------------------------
-- Products traiteur (20 produits)
-- -------------------------

-- RIZ
INSERT INTO "Product" ("id", "name", "nameCreole", "description", "price", "category", "featured") VALUES
  ('diri-djon-djon', 'Diri Djon Djon',   'Diri Djon Djon',   'Riz aux champignons noirs, un classique haïtien', 15, 'RIZ', true),
  ('diri-kole-pwa',  'Diri Kolé ak Pwa', 'Diri Kolé ak Pwa', 'Riz collé aux haricots',                          12, 'RIZ', false),
  ('diri-blan',      'Diri Blan',        'Diri Blan',        'Riz blanc nature',                                  8, 'RIZ', false),
  ('diri-ak-legim',  'Diri ak Legim',    'Diri ak Legim',    'Riz aux légumes',                                  13, 'RIZ', false)
ON CONFLICT DO NOTHING;

-- SAUCES
INSERT INTO "Product" ("id", "name", "nameCreole", "description", "price", "category", "featured") VALUES
  ('sos-pwa-nwa',  'Sos Pwa Nwa',  'Sòs Pwa Nwa',  'Sauce aux haricots noirs',    14, 'SAUCES', false),
  ('sos-pwa-wouj', 'Sos Pwa Wouj', 'Sòs Pwa Wouj', 'Sauce aux haricots rouges',   14, 'SAUCES', false),
  ('sos-keri',     'Sos Kéri',     'Sòs Kéri',     'Sauce au curry créole',        15, 'SAUCES', false),
  ('sos-kreyol',   'Sos Kreyòl',   'Sòs Kreyòl',   'Sauce créole traditionnelle', 13, 'SAUCES', false)
ON CONFLICT DO NOTHING;

-- VIANDES
INSERT INTO "Product" ("id", "name", "nameCreole", "description", "price", "category", "featured") VALUES
  ('griyo',            'Griyo',            'Griyo',           'Porc frit croustillant',    18, 'VIANDES', true),
  ('tasso',            'Tasso',            'Tasso',           'Bœuf séché et frit',        20, 'VIANDES', false),
  ('poulet-creole',    'Poulet Créole',    'Poul Kreyòl',    'Poulet mijoté à la créole', 16, 'VIANDES', false),
  ('poisson-gros-sel', 'Poisson Gros Sel', 'Pwason Gwo Sèl', 'Poisson au gros sel',      22, 'VIANDES', false)
ON CONFLICT DO NOTHING;

-- BOISSONS
INSERT INTO "Product" ("id", "name", "nameCreole", "description", "price", "category", "featured") VALUES
  ('kremas',       'Krémas',          'Krémas',      'Liqueur crémeuse à base de coco', 12, 'BOISSONS', true),
  ('jus-kowosol',  'Jus de Corossol', 'Ji Kowosol',  'Jus de corossol frais',            6, 'BOISSONS', false),
  ('jus-grenadya', 'Jus de Grenadia', 'Ji Grenadya', 'Jus de fruit de la passion',       6, 'BOISSONS', false),
  ('akasan',       'Akasan',          'Akasan',      'Boisson crémeuse à base de maïs',  7, 'BOISSONS', false)
ON CONFLICT DO NOTHING;

-- EPICES
INSERT INTO "Product" ("id", "name", "nameCreole", "description", "price", "category", "featured") VALUES
  ('epis-konple',    'Épice Complet',        'Epis Konplè',     'Mélange d''épices haïtien complet', 8, 'EPICES', false),
  ('pikliz',         'Pikliz',               'Pikliz',          'Condiment piquant haïtien',         7, 'EPICES', false),
  ('beurre-pistach', 'Beurre de Cacahuète',  'Mantèg Pistach',  'Beurre de cacahuète artisanal',    9, 'EPICES', false),
  ('sos-ti-malice',  'Sòs Ti Malice',        'Sòs Ti Malis',    'Sauce piquante traditionnelle',    6, 'EPICES', false)
ON CONFLICT DO NOTHING;

-- -------------------------
-- Sizes — Tailles standard RIZ (4 produits × 3 tailles)
-- -------------------------
INSERT INTO "Size" ("id", "label", "labelCreole", "servings", "priceMultiplier", "productId") VALUES
  ('diri-djon-djon-sm', 'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'diri-djon-djon'),
  ('diri-djon-djon-md', 'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'diri-djon-djon'),
  ('diri-djon-djon-lg', 'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'diri-djon-djon'),

  ('diri-kole-pwa-sm',  'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'diri-kole-pwa'),
  ('diri-kole-pwa-md',  'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'diri-kole-pwa'),
  ('diri-kole-pwa-lg',  'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'diri-kole-pwa'),

  ('diri-blan-sm',      'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'diri-blan'),
  ('diri-blan-md',      'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'diri-blan'),
  ('diri-blan-lg',      'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'diri-blan'),

  ('diri-ak-legim-sm',  'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'diri-ak-legim'),
  ('diri-ak-legim-md',  'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'diri-ak-legim'),
  ('diri-ak-legim-lg',  'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'diri-ak-legim')
ON CONFLICT DO NOTHING;

-- -------------------------
-- Sizes — Tailles standard SAUCES (4 produits × 3 tailles)
-- -------------------------
INSERT INTO "Size" ("id", "label", "labelCreole", "servings", "priceMultiplier", "productId") VALUES
  ('sos-pwa-nwa-sm',  'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'sos-pwa-nwa'),
  ('sos-pwa-nwa-md',  'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'sos-pwa-nwa'),
  ('sos-pwa-nwa-lg',  'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'sos-pwa-nwa'),

  ('sos-pwa-wouj-sm', 'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'sos-pwa-wouj'),
  ('sos-pwa-wouj-md', 'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'sos-pwa-wouj'),
  ('sos-pwa-wouj-lg', 'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'sos-pwa-wouj'),

  ('sos-keri-sm',     'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'sos-keri'),
  ('sos-keri-md',     'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'sos-keri'),
  ('sos-keri-lg',     'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'sos-keri'),

  ('sos-kreyol-sm',   'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'sos-kreyol'),
  ('sos-kreyol-md',   'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'sos-kreyol'),
  ('sos-kreyol-lg',   'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'sos-kreyol')
ON CONFLICT DO NOTHING;

-- -------------------------
-- Sizes — Tailles standard VIANDES (4 produits × 3 tailles)
-- -------------------------
INSERT INTO "Size" ("id", "label", "labelCreole", "servings", "priceMultiplier", "productId") VALUES
  ('griyo-sm',            'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'griyo'),
  ('griyo-md',            'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'griyo'),
  ('griyo-lg',            'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'griyo'),

  ('tasso-sm',            'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'tasso'),
  ('tasso-md',            'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'tasso'),
  ('tasso-lg',            'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'tasso'),

  ('poulet-creole-sm',    'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'poulet-creole'),
  ('poulet-creole-md',    'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'poulet-creole'),
  ('poulet-creole-lg',    'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'poulet-creole'),

  ('poisson-gros-sel-sm', 'Ti Cocotte',           'Ti Cocotte',           '1 personne',    1.0, 'poisson-gros-sel'),
  ('poisson-gros-sel-md', 'Cocotte Mwayen',       'Cocotte Mwayen',       '2-3 personnes', 2.2, 'poisson-gros-sel'),
  ('poisson-gros-sel-lg', 'Gwo Cocotte Familyal', 'Gwo Cocotte Familyal', '5-6 personnes', 3.5, 'poisson-gros-sel')
ON CONFLICT DO NOTHING;

-- -------------------------
-- Sizes — Tailles BOISSONS (4 produits × 2 tailles)
-- -------------------------
INSERT INTO "Size" ("id", "label", "labelCreole", "servings", "priceMultiplier", "productId") VALUES
  ('kremas-bottle-sm', 'Petite bouteille', 'Ti boutèy', '250ml', 1.0, 'kremas'),
  ('kremas-bottle-lg', 'Grande bouteille', 'Gwo boutèy', '750ml', 2.5, 'kremas'),

  ('jus-kowosol-cup',  'Verre',  'Vè',    '350ml', 1.0, 'jus-kowosol'),
  ('jus-kowosol-jug',  'Pichet', 'Pichè', '1L',    2.5, 'jus-kowosol'),

  ('jus-grenadya-cup', 'Verre',  'Vè',    '350ml', 1.0, 'jus-grenadya'),
  ('jus-grenadya-jug', 'Pichet', 'Pichè', '1L',    2.5, 'jus-grenadya'),

  ('akasan-cup',       'Verre',  'Vè',    '350ml', 1.0, 'akasan'),
  ('akasan-jug',       'Pichet', 'Pichè', '1L',    2.5, 'akasan')
ON CONFLICT DO NOTHING;

-- -------------------------
-- Sizes — Tailles EPICES (4 produits × 2 tailles)
-- -------------------------
INSERT INTO "Size" ("id", "label", "labelCreole", "servings", "priceMultiplier", "productId") VALUES
  ('epis-konple-jar-sm',    'Petit pot', 'Ti po',  '200g', 1.0, 'epis-konple'),
  ('epis-konple-jar-lg',    'Grand pot', 'Gwo po', '500g', 2.0, 'epis-konple'),

  ('pikliz-jar-sm',         'Petit pot', 'Ti po',  '200g', 1.0, 'pikliz'),
  ('pikliz-jar-lg',         'Grand pot', 'Gwo po', '500g', 2.0, 'pikliz'),

  ('beurre-pistach-jar-sm', 'Petit pot', 'Ti po',  '200g', 1.0, 'beurre-pistach'),
  ('beurre-pistach-jar-lg', 'Grand pot', 'Gwo po', '500g', 2.0, 'beurre-pistach'),

  ('sos-ti-malice-jar-sm',  'Petit pot', 'Ti po',  '200g', 1.0, 'sos-ti-malice'),
  ('sos-ti-malice-jar-lg',  'Grand pot', 'Gwo po', '500g', 2.0, 'sos-ti-malice')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 4 : INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS "User_churchId_idx" ON "User"("churchId");
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");
CREATE INDEX IF NOT EXISTS "Size_productId_idx" ON "Size"("productId");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_addressId_idx" ON "Order"("addressId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_sizeId_idx" ON "OrderItem"("sizeId");
CREATE INDEX IF NOT EXISTS "WeeklyMenuItem_weeklyMenuId_idx" ON "WeeklyMenuItem"("weeklyMenuId");
CREATE INDEX IF NOT EXISTS "WeeklyMenuItem_productId_idx" ON "WeeklyMenuItem"("productId");
CREATE INDEX IF NOT EXISTS "AccessSlot_churchId_idx" ON "AccessSlot"("churchId");
CREATE INDEX IF NOT EXISTS "RecurrenceRule_churchId_idx" ON "RecurrenceRule"("churchId");
CREATE INDEX IF NOT EXISTS "EpicerieProduct_category_idx" ON "EpicerieProduct"("category");

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================
