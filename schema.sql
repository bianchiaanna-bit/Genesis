-- Génesis · esquema D1 (genesis-db). Seguro de ejecutar varias veces.
-- Si ya tienes categories / dishes / specials con estos nombres de columna, no se tocan.

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL, slug TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  name_en TEXT, name_it TEXT
);
CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL, name_en TEXT, name_it TEXT,
  description_es TEXT, description_en TEXT, description_it TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_max_cents INTEGER DEFAULT 0,
  allergens TEXT,
  vegetarian INTEGER NOT NULL DEFAULT 0,
  vegan INTEGER NOT NULL DEFAULT 0,
  image_key TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS specials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL, title_en TEXT NOT NULL, title_it TEXT NOT NULL,
  description_es TEXT, description_en TEXT, description_it TEXT,
  price_cents INTEGER, image_key TEXT,
  starts_at TEXT, ends_at TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- NUEVO: novedades (posts, invitaciones, platos nuevos, eventos)
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'post',            -- post | invite | dish | event
  title_es TEXT NOT NULL, title_en TEXT NOT NULL, title_it TEXT NOT NULL,
  body_es TEXT, body_en TEXT, body_it TEXT,
  image_key TEXT,
  published_at TEXT NOT NULL DEFAULT (date('now')),
  published INTEGER NOT NULL DEFAULT 1,
  pinned INTEGER NOT NULL DEFAULT 0
);
-- NUEVO: ajustes del sitio (textos, fotos, hero, horario, popup). Una fila por clave, valor en JSON.
CREATE TABLE IF NOT EXISTS site_kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dishes_cat ON dishes(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_pub ON news(published, published_at);


-- NUEVO: platos destacados de la sección Dalla cucina
CREATE TABLE IF NOT EXISTS home_featured_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT,
  title_it TEXT,
  description_es TEXT,
  description_en TEXT,
  description_it TEXT,
  image_key TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_home_featured_cards_order
ON home_featured_cards(published, sort_order, id);
