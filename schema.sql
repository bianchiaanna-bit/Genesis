CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_it TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  description_it TEXT,
  price_cents INTEGER,
  image_key TEXT,
  vegetarian INTEGER NOT NULL DEFAULT 0,
  vegan INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS specials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_it TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  description_it TEXT,
  image_key TEXT,
  price_cents INTEGER,
  starts_at TEXT,
  ends_at TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_es TEXT,
  value_en TEXT,
  value_it TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
