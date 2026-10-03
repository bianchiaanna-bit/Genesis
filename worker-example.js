// Cloudflare Worker — production skeleton to be implemented next.
// Do NOT expose an unauthenticated admin API.
// Planned endpoints:
// GET  /api/menu?lang=es
// GET  /api/specials?lang=es
// GET  /api/settings?lang=es
// POST /api/admin/login
// POST /api/admin/menu
// PATCH /api/admin/menu/:id
// DELETE /api/admin/menu/:id
// Image uploads -> R2
//
// Bindings: DB (D1), BUCKET (R2), SESSION_SECRET
export default {
  async fetch(request, env) {
    return new Response("Génesis API skeleton — admin/auth not enabled yet.", {
      status: 501,
      headers: {"content-type":"text/plain; charset=utf-8"}
    });
  }
};
