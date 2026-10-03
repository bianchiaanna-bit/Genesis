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

CREATE TABLE IF NOT EXISTS opening_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_label TEXT NOT NULL,
  open_time TEXT,
  close_time TEXT,
  is_closed INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS popups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_it TEXT NOT NULL,
  text_es TEXT,
  text_en TEXT,
  text_it TEXT,
  button_text_es TEXT,
  button_text_en TEXT,
  button_text_it TEXT,
  button_url TEXT,
  starts_at TEXT,
  ends_at TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_it TEXT NOT NULL,
  text_es TEXT,
  text_en TEXT,
  text_it TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(section_id) REFERENCES featured_sections(id),
  FOREIGN KEY(dish_id) REFERENCES dishes(id)
);