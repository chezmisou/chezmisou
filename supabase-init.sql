-- =============================================
-- Chez Misou — Supabase Init Script
-- Application de traiteur haïtien
-- Modules : Traiteur, Lunch After Church (LAC), Épicerie Fine
-- =============================================
-- Ce script est IDEMPOTENT : il peut être ré-exécuté sans erreur.
-- =============================================

-- =============================================
-- Section 1 : Création de la table lac_menu
-- =============================================

CREATE TABLE IF NOT EXISTS lac_menu (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key         TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('menu', 'supplement')),
  nom         TEXT NOT NULL,
  description TEXT,
  prix        DECIMAL(10,2) NOT NULL DEFAULT 0,
  devise      TEXT DEFAULT 'HTG',
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Section 2 : Trigger updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lac_menu_updated_at ON lac_menu;
CREATE TRIGGER trigger_lac_menu_updated_at
  BEFORE UPDATE ON lac_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Section 3 : Seed lac_menu
-- =============================================

INSERT INTO lac_menu (key, type, nom, description, prix, devise, sort_order) VALUES
  ('choix_1',           'menu',       'Banan Peze',           'Bananes pesées + Pikliz + Poulet frit',                              0, 'HTG', 1),
  ('choix_2',           'menu',       'Riz Djondjon Poulet',  'Riz djondjon + Poulet frit + Pikliz',                                0, 'HTG', 2),
  ('choix_3',           'menu',       'Complet Kreyòl',       'Riz djondjon + Bananes pesées + Poulet frit + Pikliz',               0, 'HTG', 3),
  ('supplement_piment', 'supplement', 'Piment',               NULL,                                                                  0, 'HTG', 1),
  ('supplement_boisson','supplement', 'Boisson',              NULL,                                                                  0, 'HTG', 2)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Section 4 : Seed Churches
-- =============================================
-- Note : Prisma crée les tables en PascalCase avec guillemets

INSERT INTO "Church" (id, name, slug, "contactName", "contactEmail", color, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::TEXT, 'Évidence',       'evidence',       'Pasteur Marc',  'contact@evidence-church.fr', '#8b5cf6', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Parole de Vie',  'parole-de-vie',  'Pasteur Jean',  'contact@parolevie.fr',       '#06b6d4', true, now(), now()),
  (gen_random_uuid()::TEXT, 'ICC Paris',      'icc-paris',      'Pasteur David', 'contact@icc-paris.fr',       '#f59e0b', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Hillsong Paris', 'hillsong-paris', 'Pasteur Sarah', 'contact@hillsong.fr',        '#ef4444', true, now(), now()),
  (gen_random_uuid()::TEXT, 'C3 Church',      'c3-church',      'Pasteur Paul',  'contact@c3church.fr',        '#10b981', true, now(), now())
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Section 5 : Seed LacConfig
-- =============================================

INSERT INTO "LacConfig" (id, "maxChurchesPerSunday", "defaultStartTime", "defaultEndTime", "reminderEmailsEnabled", "reminderDaysBefore")
SELECT gen_random_uuid()::TEXT, 1, '12:00', '15:00', true, 3
WHERE NOT EXISTS (SELECT 1 FROM "LacConfig" LIMIT 1);

-- =============================================
-- Section 6 : Seed EpicerieCategoryInfo
-- =============================================

INSERT INTO "EpicerieCategoryInfo" (id, key, "labelFr", "labelCr", "accentColor") VALUES
  (gen_random_uuid()::TEXT, 'EPIS',   'Épices',  'Epis',   '#D4A017'),
  (gen_random_uuid()::TEXT, 'PIMENT', 'Piments', 'Piman',  '#C0392B'),
  (gen_random_uuid()::TEXT, 'KREMAS', 'Krémas',  'Krémas', '#8E6F47')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Section 7 : Seed EpicerieProduct
-- =============================================

-- Épices (EPIS)
INSERT INTO "EpicerieProduct" (id, "nameFr", "nameCr", category, size, price, "defaultPrice", image, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::TEXT, 'Pot d''Épice Petit',  'Ti Pot Epis',    'EPIS',   '250ml', 8.50,  8.50,  '🫙', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Pot d''Épice Moyen',  'Pot Epis Mwayen','EPIS',   '500ml', 14.00, 14.00, '🫙', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Pot d''Épice Grand',  'Gwo Pot Epis',   'EPIS',   '1L',    22.00, 22.00, '🫙', true, now(), now())
ON CONFLICT DO NOTHING;

-- Piments (PIMENT)
INSERT INTO "EpicerieProduct" (id, "nameFr", "nameCr", category, size, price, "defaultPrice", image, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::TEXT, 'Pot de Piment Petit', 'Ti Pot Piman',    'PIMENT', '150ml', 6.50,  6.50,  '🌶️', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Pot de Piment Moyen', 'Pot Piman Mwayen','PIMENT', '350ml', 11.00, 11.00, '🌶️', true, now(), now()),
  (gen_random_uuid()::TEXT, 'Pot de Piment Grand', 'Gwo Pot Piman',   'PIMENT', '500ml', 16.50, 16.50, '🌶️', true, now(), now())
ON CONFLICT DO NOTHING;

-- Krémas
INSERT INTO "EpicerieProduct" (id, "nameFr", "nameCr", category, size, price, "defaultPrice", image, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::TEXT, 'Kremas Bouteille', 'Boutèy Krémas', 'KREMAS', '750ml', 18.00, 18.00, '🥥', true, now(), now())
ON CONFLICT DO NOTHING;

-- =============================================
-- Section 8 : Seed SiteConfig
-- =============================================

INSERT INTO "SiteConfig" (id, "minOrderAmount", "deliveryFee", "freeDeliveryMinimum", "deliveryRadiusKm", "sundayDeadline", "pickupAddress", "pickupHours")
SELECT gen_random_uuid()::TEXT, 10, 5, 50, 15, 'Saturday 20:00', '', ''
WHERE NOT EXISTS (SELECT 1 FROM "SiteConfig" LIMIT 1);

-- =============================================
-- Section 9 : Seed User admin
-- =============================================
-- Note : le mot de passe sera géré via Prisma seed (bcrypt).
-- On insère un placeholder pour le password.

INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::TEXT, 'Admin LAC', 'admin@lac.fr', 'SUPER_ADMIN', now(), now())
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Section 10 : RLS Policies
-- =============================================

-- Activer RLS sur toutes les tables concernées
ALTER TABLE lac_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Church" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EpicerieProduct" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- Helper : fonction pour vérifier le rôle admin
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::TEXT
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------
-- lac_menu : lecture publique, écriture admin
-- -----------------------------------------------

DROP POLICY IF EXISTS "lac_menu_select_public" ON lac_menu;
CREATE POLICY "lac_menu_select_public" ON lac_menu
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "lac_menu_insert_admin" ON lac_menu;
CREATE POLICY "lac_menu_insert_admin" ON lac_menu
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "lac_menu_update_admin" ON lac_menu;
CREATE POLICY "lac_menu_update_admin" ON lac_menu
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "lac_menu_delete_admin" ON lac_menu;
CREATE POLICY "lac_menu_delete_admin" ON lac_menu
  FOR DELETE USING (is_admin());

-- -----------------------------------------------
-- Church : lecture publique, écriture admin
-- -----------------------------------------------

DROP POLICY IF EXISTS "church_select_public" ON "Church";
CREATE POLICY "church_select_public" ON "Church"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "church_insert_admin" ON "Church";
CREATE POLICY "church_insert_admin" ON "Church"
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "church_update_admin" ON "Church";
CREATE POLICY "church_update_admin" ON "Church"
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "church_delete_admin" ON "Church";
CREATE POLICY "church_delete_admin" ON "Church"
  FOR DELETE USING (is_admin());

-- -----------------------------------------------
-- EpicerieProduct : lecture publique, écriture admin
-- -----------------------------------------------

DROP POLICY IF EXISTS "epicerie_product_select_public" ON "EpicerieProduct";
CREATE POLICY "epicerie_product_select_public" ON "EpicerieProduct"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "epicerie_product_insert_admin" ON "EpicerieProduct";
CREATE POLICY "epicerie_product_insert_admin" ON "EpicerieProduct"
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "epicerie_product_update_admin" ON "EpicerieProduct";
CREATE POLICY "epicerie_product_update_admin" ON "EpicerieProduct"
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "epicerie_product_delete_admin" ON "EpicerieProduct";
CREATE POLICY "epicerie_product_delete_admin" ON "EpicerieProduct"
  FOR DELETE USING (is_admin());

-- -----------------------------------------------
-- Order : users voient leurs commandes, admins voient tout
-- -----------------------------------------------

DROP POLICY IF EXISTS "order_select_own_or_admin" ON "Order";
CREATE POLICY "order_select_own_or_admin" ON "Order"
  FOR SELECT USING (
    "userId" = auth.uid()::TEXT
    OR is_admin()
  );

DROP POLICY IF EXISTS "order_insert_authenticated" ON "Order";
CREATE POLICY "order_insert_authenticated" ON "Order"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "order_update_admin" ON "Order";
CREATE POLICY "order_update_admin" ON "Order"
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "order_delete_admin" ON "Order";
CREATE POLICY "order_delete_admin" ON "Order"
  FOR DELETE USING (is_admin());

-- -----------------------------------------------
-- User : chaque user voit son profil, admins voient tout
-- -----------------------------------------------

DROP POLICY IF EXISTS "user_select_own_or_admin" ON "User";
CREATE POLICY "user_select_own_or_admin" ON "User"
  FOR SELECT USING (
    id = auth.uid()::TEXT
    OR is_admin()
  );

DROP POLICY IF EXISTS "user_update_own_or_admin" ON "User";
CREATE POLICY "user_update_own_or_admin" ON "User"
  FOR UPDATE USING (
    id = auth.uid()::TEXT
    OR is_admin()
  );

DROP POLICY IF EXISTS "user_insert_admin" ON "User";
CREATE POLICY "user_insert_admin" ON "User"
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "user_delete_admin" ON "User";
CREATE POLICY "user_delete_admin" ON "User"
  FOR DELETE USING (is_admin());

-- =============================================
-- FIN DU SCRIPT
-- =============================================
