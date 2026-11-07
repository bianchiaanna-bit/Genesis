# Génesis Restaurante · sito + pannello (v2)

## Cartelle
- Pagine: `index.html, menu.html, genesis.html, como-llegar.html, novedades.html, privacy.html, cookies.html`
- `css/site.css` · `js/` (content.js, defaults.js = testi/novità/carta di esempio, app.js, home.js, menu.js, news.js, visit.js)
- `admin/` pannello · `worker.js` API · `schema.sql` + `seed.sql` database · `wrangler.toml`
- `immagini/logo/` → METTI QUI i due loghi, con questi nomi ESATTI (minuscolo, Cloudflare distingue maiuscole/minuscole):
  `logo-genesis.png` (scritta bianca) e `logo_black.png` (scritta nera) — già inclusi
- `immagini/fotos/` foto · `immagini/texture/` legno scuro/chiaro e muro verde

## Messa online (una volta sola)
1. `npx wrangler d1 execute genesis-db --remote --file=schema.sql`
2. (facoltativo, UNA volta) `npx wrangler d1 execute genesis-db --remote --file=seed.sql` → solo 5 novità di partenza. La carta NON viene toccata.
3. ID del database in `wrangler.toml`; crea il bucket R2 `genesis-images`
4. `npx wrangler secret put ADMIN_PASSWORD` e `npx wrangler secret put SESSION_SECRET`
5. `npx wrangler deploy`  → poi entra da `tuodominio/admin/`

Senza i passi 3-5 il pannello non può fare login: apri `admin/` e usa "modalità demo" per provarlo.
