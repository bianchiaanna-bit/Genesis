function corsHeaders(request) {

  const origin =
    request.headers.get("Origin");

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
// 
}


function json(request, data, status = 200) {

  return Response.json(
    data,
    {
      status,
      headers:
        corsHeaders(request)
    }
  );

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
    Date.now() +
    8 * 60 * 60 * 1000;

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
      new Uint8Array(
        signatureBuffer
      )
    )
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

  return `${expiresAt}.${signature}`;

}


async function verifySession(
  token,
  secret
) {

  if (!token) {
    return false;
  }

  const parts =
    token.split(".");

  if (
    parts.length !== 2
  ) {
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
      encoder.encode(
        String(expiresAt)
      )
    );

  const expectedSignature =
    Array.from(
      new Uint8Array(
        signatureBuffer
      )
    )
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

  return (
    signature ===
    expectedSignature
  );

}


function getSession(request) {

  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {

    return authorization.slice(7);

  }

  const cookieHeader =
    request.headers.get(
      "Cookie"
    ) || "";

  const cookies =
    cookieHeader.split(";");

  for (
    const cookie of cookies
  ) {

    const [
      name,
      ...rest
    ] =
      cookie
        .trim()
        .split("=");

    if (
      name ===
      "genesis_admin"
    ) {

      return rest.join("=");

    }

  }

  return null;

}


/* =========================================================
   VERIFICA AUTENTICAZIONE ADMIN
   ========================================================= */

async function requireAdmin(
  request,
  env
) {

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

function normalizeBoolean(
  value
) {

  return value ? 1 : 0;

}


function normalizePriceCents(
  value
) {

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


function imageExtension(
  contentType
) {

  const extensions = {

    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp"

  };

  return (
    extensions[contentType] ||
    null
  );

}


function normalizeDateTime(
  value
) {

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {

    return null;

  }

  const trimmed =
    value.trim();

  return (
    trimmed.replace(
      "T",
      " "
    ) +
    (
      trimmed.length === 16
        ? ":00"
        : ""
    )
  );

}


/* =========================================================
   CREA SLUG
   ========================================================= */

function createSlug(value) {

  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

}


/* =========================================================
   CREA SLUG UNIVOCO
   ========================================================= */

async function createUniqueSlug(
  env,
  value,
  currentId = null
) {

  const base =
    createSlug(value) ||
    "categoria";

  let slug =
    base;

  let counter =
    2;

  while (true) {

    const query =
      currentId
        ? `
          SELECT id
          FROM categories
          WHERE slug = ?
          AND id != ?
          LIMIT 1
        `
        : `
          SELECT id
          FROM categories
          WHERE slug = ?
          LIMIT 1
        `;

    const statement =
      env.DB.prepare(query);

    const existing =
      currentId
        ? await statement
            .bind(
              slug,
              currentId
            )
            .first()
        : await statement
            .bind(slug)
            .first();

    if (!existing) {

      return slug;

    }

    slug =
      `${base}-${counter}`;

    counter++;

  }

}


/* =========================================================
   WORKER
   ========================================================= */

export default {

  async fetch(
    request,
    env
  ) {

    const cors =
      corsHeaders(request);


    /* =====================================================
       CORS PREFLIGHT
       ===================================================== */

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(
        null,
        {
          status: 204,
          headers: cors
        }
      );

    }


    const url =
      new URL(request.url);


    /* =====================================================
       LOGIN
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/login" &&
      request.method === "POST"
    ) {

      try {

        const body =
          await request.json();

        const password =
          body.password || "";


        if (
          !env.ADMIN_PASSWORD ||
          password !==
            env.ADMIN_PASSWORD
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
      url.pathname ===
        "/api/opening-hours" &&
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
      url.pathname ===
        "/api/admin/opening-hours" &&
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
          typeof body.day_label ===
          "string"
            ? body.day_label.trim()
            : "";

        const openTime =
          body.open_time || null;

        const closeTime =
          body.close_time || null;

        const isClosed =
          body.is_closed
            ? 1
            : 0;


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
            maxOrder?.max_order ||
            0
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
      url.pathname ===
        "/api/admin/opening-hours" &&
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


        if (
          !Array.isArray(body)
        ) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (
          const item of body
        ) {

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
              item.is_closed
                ? 1
                : 0,
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
      url.pathname ===
        "/api/admin/opening-hours" &&
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
            url.searchParams.get(
              "id"
            )
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
      url.pathname.startsWith(
        "/api/images/"
      ) &&
      request.method === "GET"
    ) {

      const key =
        decodeURIComponent(
          url.pathname.slice(
            "/api/images/".length
          )
        );


      if (!key) {

        return new Response(
          "Immagine non trovata",
          {
            status: 404
          }
        );

      }


      const object =
        await env.IMAGES.get(
          key
        );


      if (!object) {

        return new Response(
          "Immagine non trovata",
          {
            status: 404
          }
        );

      }


      const headers =
        new Headers(cors);

      object.writeHttpMetadata(
        headers
      );

      headers.set(
        "ETag",
        object.httpEtag
      );

      headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );


      return new Response(
        object.body,
        {
          headers
        }
      );

    }


    /* =====================================================
        PUBBLICO
       ===================================================== */

    if (
      url.pathname ===
        "/api/popup" &&
      request.method === "GET"
    ) {

      try {

        const popup =
          await env.DB
            .prepare(`
              SELECT
                id,
                title_es,
                text_es,
                button_text_es,
                button_url,
                tab_text
                FROM popups
              WHERE
                published = 1
                AND (
                  starts_at IS NULL
                  OR starts_at <= CURRENT_TIMESTAMP
                )
                AND (
                  ends_at IS NULL
                  OR ends_at >= CURRENT_TIMESTAMP
                )
              ORDER BY
                id DESC
              LIMIT 1
            `)
            .first();


        return json(
          request,
          popup || null
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento del "
          },
          500
        );

      }

    }


    /* =====================================================
       POP-UP ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/popups" &&
      request.method === "GET"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

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
            title_es,
            text_es,
            button_text_es,
            button_url,
            tab_text,
            starts_at,
            ends_at,
            published
            FROM popups
              ORDER BY
                id DESC
            `)
            .all();


        return json(
          request,
          results
        );


      } catch (error) {

        console.error(
          "Errore caricamento pop-up:",
          error
        );

        return json(
          request,
          {
            error:
              "Errore durante il caricamento dei pop-up"
          },
          500
        );

      }

    }


    /* =====================================================
       POP-UP ADMIN — CREA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/popups" &&
      request.method === "POST"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        const titleEs =
          typeof body.title_es ===
          "string"
            ? body.title_es.trim()
            : "";


        const textEs =
          typeof body.text_es ===
          "string"
            ? body.text_es.trim()
            : "";


        const buttonTextEs =
          typeof body.button_text_es ===
          "string"
            ? body.button_text_es.trim()
            : "";


        const buttonUrl =
          typeof body.button_url ===
          "string" &&
          body.button_url.trim()
            ? body.button_url.trim()
            : null;

        const tabText =
          typeof body.tab_text ===
          "string"
            ? body.tab_text.trim()
            : "";

        const startsAt =
          normalizeDateTime(
            body.starts_at
          );


        const endsAt =
          normalizeDateTime(
            body.ends_at
          );


        const published =
          body.published
            ? 1
            : 0;


        if (!titleEs) {

          return json(
            request,
            {
              error:
                "Il titolo del pop-up è obbligatorio"
            },
            400
          );

        }


        if (
          startsAt &&
          endsAt &&
          new Date(
            startsAt.replace(
              " ",
              "T"
            )
          ) >
          new Date(
            endsAt.replace(
              " ",
              "T"
            )
          )
        ) {

          return json(
            request,
            {
              error:
                "La data di fine non può essere precedente alla data di inizio"
            },
            400
          );

        }


        /*
          La tabella richiede title_en
          e title_it come NOT NULL.

          I pop-up sono gestiti solo
          in spagnolo nell'admin, quindi
          usiamo lo stesso titolo spagnolo
          anche nei campi obbligatori
          EN e IT.
        */

        const result =
          await env.DB
            .prepare(`
              INSERT INTO popups (
                title_es,
                title_en,
                title_it,
                text_es,
                button_text_es,
                button_url,
                tab_text,
                starts_at,
                ends_at,
                published
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              titleEs,
              titleEs,
              titleEs,
              textEs || null,
              buttonTextEs || null,
              buttonUrl,
              tabText || null,
              startsAt,
              endsAt,
              published
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

        console.error(
          "Errore creazione pop-up:",
          error
        );

        return json(
          request,
          {
            error:
              "Errore durante la creazione del pop-up",

            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       POP-UP ADMIN — MODIFICA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/popups" &&
      request.method === "PATCH"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        /*
          PATCH riceve UN SOLO pop-up,
          non un array.
        */

        if (
          !body ||
          Array.isArray(body) ||
          typeof body !== "object"
        ) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        const id =
          Number(body.id);


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {

          return json(
            request,
            {
              error:
                "ID del pop-up non valido"
            },
            400
          );

        }


        const titleEs =
          typeof body.title_es ===
          "string"
            ? body.title_es.trim()
            : "";


        const textEs =
          typeof body.text_es ===
          "string"
            ? body.text_es.trim()
            : "";


        const buttonTextEs =
          typeof body.button_text_es ===
          "string"
            ? body.button_text_es.trim()
            : "";


        const buttonUrl =
        typeof body.button_url ===
        "string" &&
        body.button_url.trim()
            ? body.button_url.trim()
            : null;


        const tabText =
        typeof body.tab_text ===
        "string"
            ? body.tab_text.trim()
            : "";


        const startsAt =
        normalizeDateTime(
            body.starts_at
        );

        const endsAt =
          normalizeDateTime(
            body.ends_at
          );


        const published =
          body.published
            ? 1
            : 0;


        if (!titleEs) {

          return json(
            request,
            {
              error:
                "Il titolo del pop-up è obbligatorio"
            },
            400
          );

        }


        if (
          startsAt &&
          endsAt &&
          new Date(
            startsAt.replace(
              " ",
              "T"
            )
          ) >
          new Date(
            endsAt.replace(
              " ",
              "T"
            )
          )
        ) {

          return json(
            request,
            {
              error:
                "La data di fine non può essere precedente alla data di inizio"
            },
            400
          );

        }


        const result =
          await env.DB
            .prepare(`
              UPDATE popups
              SET
                title_es = ?,
                title_en = ?,
                title_it = ?,
                text_es = ?,
                button_text_es = ?,
                button_url = ?,
                tab_text = ?,
                starts_at = ?,
                ends_at = ?,
                published = ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE id = ?
            `)
            .bind(
              titleEs,
              titleEs,
              titleEs,
              textEs || null,
              buttonTextEs || null,
              buttonUrl,
              tabText || null,
              startsAt,
              endsAt,
              published,
              id
            )
            .run();


        if (
          !result.meta.changes
        ) {

          return json(
            request,
            {
              error:
                "Pop-up non trovato"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(
          "Errore modifica pop-up:",
          error
        );

        return json(
          request,
          {
            error:
              "Errore durante il salvataggio del pop-up",

            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       POP-UP ADMIN — ELIMINA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/popups" &&
      request.method === "DELETE"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const id =
          Number(
            url.searchParams.get(
              "id"
            )
          );


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {

          return json(
            request,
            {
              error:
                "ID del pop-up non valido"
            },
            400
          );

        }


        const result =
          await env.DB
            .prepare(`
              DELETE FROM popups
              WHERE id = ?
            `)
            .bind(id)
            .run();


        if (
          !result.meta.changes
        ) {

          return json(
            request,
            {
              error:
                "Pop-up non trovato"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true
          }
        );


      } catch (error) {

        console.error(
          "Errore eliminazione pop-up:",
          error
        );

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione del pop-up",

            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       MENU PUBBLICO
       ===================================================== */

    if (
      url.pathname ===
        "/api/menu" &&
      request.method === "GET"
    ) {

      try {

        const {
          results: dishes
        } =
          await env.DB
            .prepare(`
              SELECT
                dishes.id,
                dishes.category_id,

                categories.name_es
                  AS category_name_es,

                categories.slug
                  AS category_slug,

                dishes.name_es,
                dishes.description_es,

                dishes.price_cents,
                dishes.price_max_cents,

                dishes.allergens,

                dishes.image_key,

                dishes.vegetarian,
                dishes.vegan,
                dishes.available,

                dishes.sort_order

              FROM dishes

              LEFT JOIN categories
                ON categories.id =
                   dishes.category_id

              WHERE
                dishes.available = 1

              ORDER BY
                categories.sort_order,
                categories.id,
                dishes.sort_order,
                dishes.id
            `)
            .all();


        const {
          results: notes
        } =
          await env.DB
            .prepare(`
              SELECT
                category_notes.id,
                category_notes.category_id,

                category_notes.text_es,

                category_notes.sort_order

              FROM category_notes

              ORDER BY
                category_notes.category_id,
                category_notes.sort_order,
                category_notes.id
            `)
            .all();


        return json(
          request,
          {
            dishes,
            notes
          }
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
      url.pathname ===
        "/api/admin/categories" &&
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
                name_es,
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
      url.pathname ===
        "/api/admin/categories" &&
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
          typeof body.name_es ===
          "string"
            ? body.name_es.trim()
            : "";


        if (!nameEs) {

          return json(
            request,
            {
              error:
                "Il nome della categoria è obbligatorio"
            },
            400
          );

        }


        const slug =
          await createUniqueSlug(
            env,
            body.slug ||
              nameEs
          );


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
            maxOrder?.max_order ||
            0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO categories (
                name_es,
                slug,
                sort_order
              )
              VALUES (?, ?, ?)
            `)
            .bind(
              nameEs,
              slug,
              sortOrder
            )
            .run();


        return json(
          request,
          {
            success: true,
            id:
              result.meta.last_row_id,
            slug
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
      url.pathname ===
        "/api/admin/categories" &&
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


        if (
          !Array.isArray(body)
        ) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (
          const item of body
        ) {

          if (!item.id) {
            continue;
          }


          const nameEs =
            typeof item.name_es ===
            "string"
              ? item.name_es.trim()
              : "";


          if (!nameEs) {
            continue;
          }


          const slug =
            await createUniqueSlug(
              env,
              item.slug ||
                nameEs,
              item.id
            );


          await env.DB
            .prepare(`
              UPDATE categories
              SET
                name_es = ?,
                slug = ?,
                sort_order = ?
              WHERE id = ?
            `)
            .bind(
              nameEs,
              slug,
              Number(
                item.sort_order ||
                0
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
      url.pathname ===
        "/api/admin/categories" &&
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
            url.searchParams.get(
              "id"
            )
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
            DELETE FROM category_notes
            WHERE category_id = ?
          `)
          .bind(id)
          .run();


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
       NOTE CATEGORIE ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/category-notes" &&
      request.method === "GET"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

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
                category_id,
                text_es,
                sort_order
              FROM category_notes
              ORDER BY
                category_id,
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
              "Errore durante il caricamento delle note"
          },
          500
        );

      }

    }


    /* =====================================================
       NOTE CATEGORIE ADMIN — CREA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/category-notes" &&
      request.method === "POST"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        const categoryId =
          Number(
            body.category_id
          );


        const textEs =
          typeof body.text_es ===
          "string"
            ? body.text_es.trim()
            : "";


        if (
          !categoryId ||
          !textEs
        ) {

          return json(
            request,
            {
              error:
                "Categoria e testo sono obbligatori"
            },
            400
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
              FROM category_notes
              WHERE category_id = ?
            `)
            .bind(categoryId)
            .first();


        const sortOrder =
          Number(
            maxOrder?.max_order ||
            0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO category_notes (
                category_id,
                text_es,
                sort_order
              )
              VALUES (?, ?, ?)
            `)
            .bind(
              categoryId,
              textEs,
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
              "Errore durante la creazione della nota"
          },
          500
        );

      }

    }


    /* =====================================================
       NOTE CATEGORIE ADMIN — MODIFICA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/category-notes" &&
      request.method === "PATCH"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const body =
          await request.json();


        if (
          !Array.isArray(body)
        ) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (
          const item of body
        ) {

          if (!item.id) {
            continue;
          }


          const categoryId =
            Number(
              item.category_id
            );


          const textEs =
            typeof item.text_es ===
            "string"
              ? item.text_es.trim()
              : "";


          if (
            !categoryId ||
            !textEs
          ) {

            continue;

          }


          await env.DB
            .prepare(`
              UPDATE category_notes
              SET
                category_id = ?,
                text_es = ?,
                sort_order = ?
              WHERE id = ?
            `)
            .bind(
              categoryId,
              textEs,
              Number(
                item.sort_order ||
                0
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
              "Errore durante la modifica delle note"
          },
          500
        );

      }

    }


    /* =====================================================
       NOTE CATEGORIE ADMIN — ELIMINA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/category-notes" &&
      request.method === "DELETE"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      try {

        const id =
          Number(
            url.searchParams.get(
              "id"
            )
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
            DELETE FROM category_notes
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
              "Errore durante l'eliminazione della nota"
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/dishes" &&
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

                categories.name_es
                  AS category_name_es,

                categories.slug
                  AS category_slug,

                dishes.name_es,
                dishes.description_es,

                dishes.price_cents,
                dishes.price_max_cents,

                dishes.allergens,

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
      url.pathname ===
        "/api/admin/dishes" &&
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
          typeof body.name_es ===
          "string"
            ? body.name_es.trim()
            : "";


        if (!nameEs) {

          return json(
            request,
            {
              error:
                "Il nome del piatto è obbligatorio."
            },
            400
          );

        }


        const categoryId =
          body.category_id
            ? Number(
                body.category_id
              )
            : null;


        const descriptionEs =
          body.description_es
            ? String(
                body.description_es
              ).trim()
            : null;


        const priceCents =
          normalizePriceCents(
            body.price_cents
          );


        const priceMaxCents =
          normalizePriceCents(
            body.price_max_cents
          );


        const allergens =
          body.allergens
            ? String(
                body.allergens
              ).trim()
            : null;


        const imageKey =
          body.image_key ||
          null;


        const vegetarian =
          normalizeBoolean(
            body.vegetarian
          );


        const vegan =
          normalizeBoolean(
            body.vegan
          );


        const available =
          body.available ===
          undefined
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
              WHERE category_id = ?
            `)
            .bind(categoryId)
            .first();


        const sortOrder =
          Number(
            maxOrder?.max_order ||
            0
          ) + 1;


        const result =
          await env.DB
            .prepare(`
              INSERT INTO dishes (

                category_id,

                name_es,
                description_es,

                price_cents,
                price_max_cents,

                allergens,

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
                ?
              )
            `)
            .bind(

              categoryId,

              nameEs,
              descriptionEs,

              priceCents,
              priceMaxCents,

              allergens,

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
      url.pathname ===
        "/api/admin/dishes" &&
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


        if (
          !Array.isArray(body)
        ) {

          return json(
            request,
            {
              error:
                "Dati non validi"
            },
            400
          );

        }


        for (
          const item of body
        ) {

          if (!item.id) {
            continue;
          }


          const nameEs =
            typeof item.name_es ===
            "string"
              ? item.name_es.trim()
              : "";


          if (!nameEs) {
            continue;
          }


          const categoryId =
            item.category_id
              ? Number(
                  item.category_id
                )
              : null;


          const descriptionEs =
            item.description_es
              ? String(
                  item.description_es
                ).trim()
              : null;


          const priceCents =
            normalizePriceCents(
              item.price_cents
            );


          const priceMaxCents =
            normalizePriceCents(
              item.price_max_cents
            );


          const allergens =
            item.allergens
              ? String(
                  item.allergens
                ).trim()
              : null;


          const imageKey =
            item.image_key ||
            null;


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
                description_es = ?,

                price_cents = ?,
                price_max_cents = ?,

                allergens = ?,

                image_key = ?,

                vegetarian = ?,
                vegan = ?,
                available = ?,

                sort_order = ?,

                updated_at =
                  CURRENT_TIMESTAMP

              WHERE id = ?
            `)
            .bind(

              categoryId,

              nameEs,
              descriptionEs,

              priceCents,
              priceMaxCents,

              allergens,

              imageKey,

              vegetarian,
              vegan,
              available,

              Number(
                item.sort_order ||
                0
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
      url.pathname ===
        "/api/admin/dishes" &&
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
            url.searchParams.get(
              "id"
            )
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
      url.pathname ===
        "/api/admin/images" &&
      request.method === "POST"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      const contentType =
        request.headers
          .get("Content-Type")
          ?.split(";")[0]
          .trim()
          .toLowerCase();


      const extension =
        imageExtension(
          contentType
        );


      const size =
        Number(
          request.headers.get(
            "Content-Length"
          ) || 0
        );


      if (!extension) {

        return json(
          request,
          {
            error:
              "Usa un'immagine JPG, PNG o WebP."
          },
          400
        );

      }


      if (
        size >
        8 * 1024 * 1024
      ) {

        return json(
          request,
          {
            error:
              "L'immagine non può superare 8 MB."
          },
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

            url:
              `${url.origin}/api/images/${encodeURIComponent(key)}`
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il caricamento dell'immagine"
          },
          500
        );

      }

    }


    /* =====================================================
       ELIMINA IMMAGINE ADMIN
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/images" &&
      request.method === "DELETE"
    ) {

      if (
        !await requireAdmin(
          request,
          env
        )
      ) {

        return unauthorized(
          request
        );

      }


      const key =
        url.searchParams.get(
          "key"
        );


      if (
        !key ||
        !key.startsWith(
          "dishes/"
        )
      ) {

        return json(
          request,
          {
            error:
              "Immagine non valida"
          },
          400
        );

      }


      await env.IMAGES.delete(
        key
      );


      return json(
        request,
        {
          success: true
        }
      );

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