function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://bianchiaanna-bit.github.io"
  ];

  return {
    "Access-Control-Allow-Origin":
      allowedOrigins.includes(origin)
        ? origin
        : "null",

    "Access-Control-Allow-Methods":
      "GET, POST, PATCH, DELETE, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",

    "Access-Control-Allow-Credentials":
      "true",

    "Vary":
      "Origin"
  };
}


function json(request, data, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders(request),
  });
}


function unauthorized(request) {
  return json(
    request,
    {
      error:
        "Non autorizzato"
    },
    401
  );
}


/* =========================================================
   SESSIONE
   ========================================================= */

async function createSession(secret) {

  const expiresAt =
    Date.now() + 8 * 60 * 60 * 1000;

  const payload =
    `${expiresAt}`;

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

  const signature =
    Array.from(
      new Uint8Array(signatureBuffer)
    )
      .map(byte =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");

  return `${expiresAt}.${signature}`;
}


async function verifySession(token, secret) {

  if (!token) {
    return false;
  }

  const parts =
    token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const expiresAt =
    Number(parts[0]);

  const signature =
    parts[1];

  if (
    !expiresAt ||
    !signature ||
    Date.now() > expiresAt
  ) {
    return false;
  }

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(String(expiresAt))
    );

  const expectedSignature =
    Array.from(
      new Uint8Array(signatureBuffer)
    )
      .map(byte =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");

  return signature === expectedSignature;
}


function getSession(request) {

  const authorization =
    request.headers.get("Authorization");

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    return authorization.slice(7);
  }


  const cookieHeader =
    request.headers.get("Cookie") || "";

  const cookies =
    cookieHeader.split(";");

  for (const cookie of cookies) {

    const [name, ...rest] =
      cookie.trim().split("=");

    if (name === "genesis_admin") {
      return rest.join("=");
    }

  }

  return null;
}


/* =========================================================
   VERIFICA AUTENTICAZIONE ADMIN
   ========================================================= */

async function requireAdmin(request, env) {

  const session =
    getSession(request);

  return await verifySession(
    session,
    env.SESSION_SECRET
  );
}


/* =========================================================
   FUNZIONI DI SUPPORTO MENU
   ========================================================= */

function normalizeBoolean(value) {
  return value ? 1 : 0;
}


function normalizePriceCents(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return null;
  }

  return Math.round(number);
}


function imageExtension(contentType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return extensions[contentType] || null;
}


function normalizeDateTime(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim().replace("T", " ") + (
    value.trim().length === 16 ? ":00" : ""
  );
}


/* =========================================================
   WORKER
   ========================================================= */

export default {

  async fetch(request, env) {

    const cors =
      corsHeaders(request);


    /* =====================================================
       CORS PREFLIGHT
       ===================================================== */

    if (request.method === "OPTIONS") {

      return new Response(null, {
        status: 204,
        headers: cors
      });

    }


    const url =
      new URL(request.url);


    /* =====================================================
       LOGIN
       ===================================================== */

    if (
      url.pathname === "/api/admin/login" &&
      request.method === "POST"
    ) {

      try {

        const body =
          await request.json();

        const password =
          body.password || "";


        if (
          !env.ADMIN_PASSWORD ||
          password !== env.ADMIN_PASSWORD
        ) {

          return json(
            request,
            {
              error:
                "Password non corretta"
            },
            401
          );

        }


        const session =
          await createSession(
            env.SESSION_SECRET
          );


        return new Response(
          JSON.stringify({
            success: true,
            session
          }),
          {
            status: 200,

            headers: {
              ...cors,

              "Content-Type":
                "application/json",

              "Set-Cookie":
                `genesis_admin=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=28800`
            }
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Richiesta non valida"
          },
          400
        );

      }

    }


    /* =====================================================
       ORARI PUBBLICI
       ===================================================== */

    if (
      url.pathname === "/api/opening-hours" &&
      request.method === "GET"
    ) {

      try {

        const { results } =
          await env.DB
            .prepare(`
              SELECT
                id,
                day_label,
                open_time,
                close_time,
                is_closed,
                sort_order
              FROM opening_hours
              ORDER BY sort_order, id
            `)
            .all();


        return json(
          request,
          results
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento degli orari"
          },
          500
        );

      }

    }


    /* =====================================================
       AGGIUNGI NUOVO ORARIO
       ===================================================== */

    if (
      url.pathname === "/api/admin/opening-hours" &&
      request.method === "POST"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        const dayLabel =
          typeof body.day_label === "string"
            ? body.day_label.trim()
            : "";

        const openTime =
          body.open_time || null;

        const closeTime =
          body.close_time || null;

        const isClosed =
          body.is_closed ? 1 : 0;


        const maxOrder =
          await env.DB
            .prepare(`
              SELECT
                COALESCE(
                  MAX(sort_order),
                  0
                ) AS max_order
              FROM opening_hours
            `)
            .first();


        const sortOrder =
          Number(
            maxOrder?.max_order || 0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO opening_hours (
                day_label,
                open_time,
                close_time,
                is_closed,
                sort_order
              )
              VALUES (?, ?, ?, ?, ?)
            `)
            .bind(
              dayLabel,
              openTime,
              closeTime,
              isClosed,
              sortOrder
            )
            .run();


        return json(
          request,
          {
            success: true,
            id:
              result.meta.last_row_id
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la creazione dell'orario"
          },
          500
        );

      }

    }


    /* =====================================================
       MODIFICA ORARI ADMIN
       ===================================================== */

    if (
      url.pathname === "/api/admin/opening-hours" &&
      request.method === "PATCH"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        if (!Array.isArray(body)) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (const item of body) {

          if (!item.id) {
            continue;
          }


          await env.DB
            .prepare(`
              UPDATE opening_hours
              SET
                day_label = ?,
                open_time = ?,
                close_time = ?,
                is_closed = ?
              WHERE id = ?
            `)
            .bind(
              item.day_label || "",
              item.open_time || null,
              item.close_time || null,
              item.is_closed ? 1 : 0,
              item.id
            )
            .run();

        }


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il salvataggio"
          },
          500
        );

      }

    }


    /* =====================================================
       ELIMINA ORARIO ADMIN
       ===================================================== */

    if (
      url.pathname === "/api/admin/opening-hours" &&
      request.method === "DELETE"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const id =
          Number(
            url.searchParams.get("id")
          );


        if (!id) {

          return json(
            request,
            {
              error:
                "ID non valido"
            },
            400
          );

        }


        await env.DB
          .prepare(`
            DELETE FROM opening_hours
            WHERE id = ?
          `)
          .bind(id)
          .run();


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione"
          },
          500
        );

      }

    }


    /* =====================================================
       IMMAGINI PUBBLICHE
       ===================================================== */

    if (
      url.pathname.startsWith("/api/images/") &&
      request.method === "GET"
    ) {

      const key =
        decodeURIComponent(
          url.pathname.slice("/api/images/".length)
        );

      if (!key) {
        return new Response("Immagine non trovata", { status: 404 });
      }

      const object =
        await env.IMAGES.get(key);

      if (!object) {
        return new Response("Immagine non trovata", { status: 404 });
      }

      const headers = new Headers(cors);
      object.writeHttpMetadata(headers);
      headers.set("ETag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new Response(object.body, { headers });
    }


    /* =====================================================
       POP-UP PUBBLICO
       ===================================================== */

    if (
      url.pathname === "/api/popup" &&
      request.method === "GET"
    ) {

      try {

        const popup =
          await env.DB
            .prepare(`
              SELECT
                id,
                title_es, title_en, title_it,
                text_es, text_en, text_it,
                button_text_es, button_text_en, button_text_it,
                button_url
              FROM popups
              WHERE
                published = 1
                AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
                AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP)
              ORDER BY id DESC
              LIMIT 1
            `)
            .first();

        return json(request, popup || null);

      } catch (error) {

        console.error(error);

        return json(
          request,
          { error: "Errore durante il caricamento del pop-up" },
          500
        );

      }

    }


    /* =====================================================
       MENU PUBBLICO
       ===================================================== */

    if (
      url.pathname === "/api/menu" &&
      request.method === "GET"
    ) {

      try {

        const { results } =
          await env.DB
            .prepare(`
              SELECT
                dishes.id,
                dishes.category_id,
                categories.slug AS category_slug,

                dishes.name_es,
                dishes.name_en,
                dishes.name_it,

                dishes.description_es,
                dishes.description_en,
                dishes.description_it,

                dishes.price_cents,
                dishes.image_key,

                dishes.vegetarian,
                dishes.vegan,
                dishes.available,

                dishes.sort_order

              FROM dishes

              LEFT JOIN categories
                ON categories.id =
                   dishes.category_id

              WHERE dishes.available = 1

              ORDER BY
                categories.sort_order,
                categories.id,
                dishes.sort_order,
                dishes.id
            `)
            .all();


        return json(
          request,
          results
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento del menu"
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname === "/api/admin/categories" &&
      request.method === "GET"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const { results } =
          await env.DB
            .prepare(`
              SELECT
                id,
                slug,
                sort_order
              FROM categories
              ORDER BY
                sort_order,
                id
            `)
            .all();


        return json(
          request,
          results
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento delle categorie"
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — CREA
       ===================================================== */

    if (
      url.pathname === "/api/admin/categories" &&
      request.method === "POST"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        const slug =
          typeof body.slug === "string"
            ? body.slug.trim()
            : "";


        if (!slug) {

          return json(
            request,
            {
              error:
                "Il nome della categoria è obbligatorio"
            },
            400
          );

        }


        const existing =
          await env.DB
            .prepare(`
              SELECT id
              FROM categories
              WHERE slug = ?
            `)
            .bind(slug)
            .first();


        if (existing) {

          return json(
            request,
            {
              error:
                "Categoria già esistente"
            },
            409
          );

        }


        const maxOrder =
          await env.DB
            .prepare(`
              SELECT
                COALESCE(
                  MAX(sort_order),
                  0
                ) AS max_order
              FROM categories
            `)
            .first();


        const sortOrder =
          Number(
            maxOrder?.max_order || 0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO categories (
                slug,
                sort_order
              )
              VALUES (?, ?)
            `)
            .bind(
              slug,
              sortOrder
            )
            .run();


        return json(
          request,
          {
            success: true,
            id:
              result.meta.last_row_id
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la creazione della categoria"
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — MODIFICA
       ===================================================== */

    if (
      url.pathname === "/api/admin/categories" &&
      request.method === "PATCH"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        if (!Array.isArray(body)) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (const item of body) {

          if (!item.id) {
            continue;
          }


          const slug =
            typeof item.slug === "string"
              ? item.slug.trim()
              : "";


          if (!slug) {
            continue;
          }


          await env.DB
            .prepare(`
              UPDATE categories
              SET
                slug = ?,
                sort_order = ?
              WHERE id = ?
            `)
            .bind(
              slug,
              Number(
                item.sort_order || 0
              ),
              item.id
            )
            .run();

        }


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la modifica delle categorie"
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — ELIMINA
       ===================================================== */

    if (
      url.pathname === "/api/admin/categories" &&
      request.method === "DELETE"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const id =
          Number(
            url.searchParams.get("id")
          );


        if (!id) {

          return json(
            request,
            {
              error:
                "ID non valido"
            },
            400
          );

        }


        const dishes =
          await env.DB
            .prepare(`
              SELECT
                COUNT(*) AS total
              FROM dishes
              WHERE category_id = ?
            `)
            .bind(id)
            .first();


        if (
          Number(
            dishes?.total || 0
          ) > 0
        ) {

          return json(
            request,
            {
              error:
                "Impossibile eliminare una categoria che contiene piatti."
            },
            409
          );

        }


        await env.DB
          .prepare(`
            DELETE FROM categories
            WHERE id = ?
          `)
          .bind(id)
          .run();


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione della categoria"
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname === "/api/admin/dishes" &&
      request.method === "GET"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const { results } =
          await env.DB
            .prepare(`
              SELECT

                dishes.id,
                dishes.category_id,

                categories.slug AS category_slug,

                dishes.name_es,
                dishes.name_en,
                dishes.name_it,

                dishes.description_es,
                dishes.description_en,
                dishes.description_it,

                dishes.price_cents,
                dishes.image_key,

                dishes.vegetarian,
                dishes.vegan,
                dishes.available,

                dishes.sort_order,

                dishes.created_at,
                dishes.updated_at

              FROM dishes

              LEFT JOIN categories
                ON categories.id =
                   dishes.category_id

              ORDER BY
                categories.sort_order,
                categories.id,
                dishes.sort_order,
                dishes.id
            `)
            .all();


        return json(
          request,
          results
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento dei piatti"
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — CREA
       ===================================================== */

    if (
      url.pathname === "/api/admin/dishes" &&
      request.method === "POST"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        const nameEs =
          typeof body.name_es === "string"
            ? body.name_es.trim()
            : "";

        const nameEn =
          typeof body.name_en === "string"
            ? body.name_en.trim()
            : "";

        const nameIt =
          typeof body.name_it === "string"
            ? body.name_it.trim()
            : "";


        if (
          !nameEs ||
          !nameEn ||
          !nameIt
        ) {

          return json(
            request,
            {
              error:
                "Il nome del piatto è obbligatorio in tutte le lingue."
            },
            400
          );

        }


        const categoryId =
          body.category_id
            ? Number(body.category_id)
            : null;


        const descriptionEs =
          body.description_es || null;

        const descriptionEn =
          body.description_en || null;

        const descriptionIt =
          body.description_it || null;


        const priceCents =
          normalizePriceCents(
            body.price_cents
          );


        const imageKey =
          body.image_key || null;


        const vegetarian =
          normalizeBoolean(
            body.vegetarian
          );

        const vegan =
          normalizeBoolean(
            body.vegan
          );

        const available =
          body.available === undefined
            ? 1
            : normalizeBoolean(
                body.available
              );


        const maxOrder =
          await env.DB
            .prepare(`
              SELECT
                COALESCE(
                  MAX(sort_order),
                  0
                ) AS max_order
              FROM dishes
              WHERE
                category_id = ?
            `)
            .bind(categoryId)
            .first();


        const sortOrder =
          Number(
            maxOrder?.max_order || 0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO dishes (
                category_id,

                name_es,
                name_en,
                name_it,

                description_es,
                description_en,
                description_it,

                price_cents,
                image_key,

                vegetarian,
                vegan,
                available,

                sort_order
              )

              VALUES (
                ?,

                ?,
                ?,
                ?,

                ?,
                ?,
                ?,

                ?,
                ?,

                ?,
                ?,
                ?,

                ?
              )
            `)
            .bind(

              categoryId,

              nameEs,
              nameEn,
              nameIt,

              descriptionEs,
              descriptionEn,
              descriptionIt,

              priceCents,
              imageKey,

              vegetarian,
              vegan,
              available,

              sortOrder

            )
            .run();


        return json(
          request,
          {
            success: true,
            id:
              result.meta.last_row_id
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la creazione del piatto"
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — MODIFICA
       ===================================================== */

    if (
      url.pathname === "/api/admin/dishes" &&
      request.method === "PATCH"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        if (!Array.isArray(body)) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (const item of body) {

          if (!item.id) {
            continue;
          }


          const nameEs =
            typeof item.name_es === "string"
              ? item.name_es.trim()
              : "";

          const nameEn =
            typeof item.name_en === "string"
              ? item.name_en.trim()
              : "";

          const nameIt =
            typeof item.name_it === "string"
              ? item.name_it.trim()
              : "";


          if (
            !nameEs ||
            !nameEn ||
            !nameIt
          ) {
            continue;
          }


          const categoryId =
            item.category_id
              ? Number(item.category_id)
              : null;


          const descriptionEs =
            item.description_es || null;

          const descriptionEn =
            item.description_en || null;

          const descriptionIt =
            item.description_it || null;


          const priceCents =
            normalizePriceCents(
              item.price_cents
            );


          const imageKey =
            item.image_key || null;


          const vegetarian =
            normalizeBoolean(
              item.vegetarian
            );

          const vegan =
            normalizeBoolean(
              item.vegan
            );

          const available =
            normalizeBoolean(
              item.available
            );


          await env.DB
            .prepare(`
              UPDATE dishes

              SET
                category_id = ?,

                name_es = ?,
                name_en = ?,
                name_it = ?,

                description_es = ?,
                description_en = ?,
                description_it = ?,

                price_cents = ?,
                image_key = ?,

                vegetarian = ?,
                vegan = ?,
                available = ?,

                sort_order = ?,

                updated_at = CURRENT_TIMESTAMP

              WHERE id = ?
            `)
            .bind(

              categoryId,

              nameEs,
              nameEn,
              nameIt,

              descriptionEs,
              descriptionEn,
              descriptionIt,

              priceCents,
              imageKey,

              vegetarian,
              vegan,
              available,

              Number(
                item.sort_order || 0
              ),

              item.id

            )
            .run();

        }


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la modifica dei piatti"
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — ELIMINA
       ===================================================== */

    if (
      url.pathname === "/api/admin/dishes" &&
      request.method === "DELETE"
    ) {

      const validSession =
        await requireAdmin(
          request,
          env
        );


      if (!validSession) {

        return unauthorized(
          request
        );

      }


      try {

        const id =
          Number(
            url.searchParams.get("id")
          );


        if (!id) {

          return json(
            request,
            {
              error:
                "ID non valido"
            },
            400
          );

        }


        await env.DB
          .prepare(`
            DELETE FROM dishes
            WHERE id = ?
          `)
          .bind(id)
          .run();


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione del piatto"
          },
          500
        );

      }

    }


    /* =====================================================
       IMMAGINI ADMIN
       ===================================================== */

    if (
      url.pathname === "/api/admin/images" &&
      request.method === "POST"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const contentType =
        request.headers
          .get("Content-Type")
          ?.split(";")[0]
          .trim()
          .toLowerCase();

      const extension =
        imageExtension(contentType);

      const size =
        Number(request.headers.get("Content-Length") || 0);

      if (!extension) {
        return json(
          request,
          { error: "Usa un'immagine JPG, PNG o WebP." },
          400
        );
      }

      if (size > 8 * 1024 * 1024) {
        return json(
          request,
          { error: "L'immagine non può superare 8 MB." },
          400
        );
      }

      try {

        const key =
          `dishes/${crypto.randomUUID()}.${extension}`;

        await env.IMAGES.put(
          key,
          await request.arrayBuffer(),
          {
            httpMetadata: {
              contentType
            }
          }
        );

        return json(
          request,
          {
            success: true,
            key,
            url: `${url.origin}/api/images/${encodeURIComponent(key)}`
          }
        );

      } catch (error) {

        console.error(error);

        return json(
          request,
          { error: "Errore durante il caricamento dell'immagine" },
          500
        );

      }

    }


    if (
      url.pathname === "/api/admin/images" &&
      request.method === "DELETE"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const key =
        url.searchParams.get("key");

      if (!key || !key.startsWith("dishes/")) {
        return json(request, { error: "Immagine non valida" }, 400);
      }

      await env.IMAGES.delete(key);

      return json(request, { success: true });
    }


    /* =====================================================
       POP-UP ADMIN
       ===================================================== */

    if (
      url.pathname === "/api/admin/popups" &&
      request.method === "GET"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const { results } =
        await env.DB
          .prepare(`
            SELECT *
            FROM popups
            ORDER BY id DESC
          `)
          .all();

      return json(request, results);
    }


    if (
      url.pathname === "/api/admin/popups" &&
      request.method === "POST"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const body = await request.json();
      const titles = ["es", "en", "it"].map(
        language =>
          typeof body[`title_${language}`] === "string"
            ? body[`title_${language}`].trim()
            : ""
      );

      if (titles.some(title => !title)) {
        return json(
          request,
          { error: "Il titolo è obbligatorio in tutte le lingue." },
          400
        );
      }

      const result =
        await env.DB
          .prepare(`
            INSERT INTO popups (
              title_es, title_en, title_it,
              text_es, text_en, text_it,
              button_text_es, button_text_en, button_text_it,
              button_url, starts_at, ends_at, published
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            titles[0], titles[1], titles[2],
            body.text_es || null, body.text_en || null, body.text_it || null,
            body.button_text_es || null, body.button_text_en || null, body.button_text_it || null,
            body.button_url || null,
            normalizeDateTime(body.starts_at),
            normalizeDateTime(body.ends_at),
            normalizeBoolean(body.published)
          )
          .run();

      return json(
        request,
        { success: true, id: result.meta.last_row_id }
      );
    }


    if (
      url.pathname === "/api/admin/popups" &&
      request.method === "PATCH"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const body = await request.json();

      if (!Array.isArray(body)) {
        return json(request, { error: "Dati non validi" }, 400);
      }

      for (const item of body) {

        if (!item.id) {
          continue;
        }

        const titles = ["es", "en", "it"].map(
          language =>
            typeof item[`title_${language}`] === "string"
              ? item[`title_${language}`].trim()
              : ""
        );

        if (titles.some(title => !title)) {
          continue;
        }

        await env.DB
          .prepare(`
            UPDATE popups
            SET
              title_es = ?, title_en = ?, title_it = ?,
              text_es = ?, text_en = ?, text_it = ?,
              button_text_es = ?, button_text_en = ?, button_text_it = ?,
              button_url = ?, starts_at = ?, ends_at = ?, published = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .bind(
            titles[0], titles[1], titles[2],
            item.text_es || null, item.text_en || null, item.text_it || null,
            item.button_text_es || null, item.button_text_en || null, item.button_text_it || null,
            item.button_url || null,
            normalizeDateTime(item.starts_at),
            normalizeDateTime(item.ends_at),
            normalizeBoolean(item.published), item.id
          )
          .run();
      }

      return json(request, { success: true });
    }


    if (
      url.pathname === "/api/admin/popups" &&
      request.method === "DELETE"
    ) {

      if (!await requireAdmin(request, env)) {
        return unauthorized(request);
      }

      const id = Number(url.searchParams.get("id"));

      if (!id) {
        return json(request, { error: "ID non valido" }, 400);
      }

      await env.DB
        .prepare("DELETE FROM popups WHERE id = ?")
        .bind(id)
        .run();

      return json(request, { success: true });
    }


    /* =====================================================
       DEFAULT
       ===================================================== */

    return new Response(
      "Génesis API online",
      {
        status: 200,

        headers: {
          ...cors,

          "content-type":
            "text/plain; charset=utf-8"
        }
      }
    );

  }

};
