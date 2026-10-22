/* =========================================================
   HOMEPAGE — INIZIALIZZAZIONE PIATTI IN HOME
   ========================================================= */

async function ensureHomeDishes(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS home_dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_key TEXT,
      alt_it TEXT,
      meta_it TEXT,
      title_it TEXT,
      text_it TEXT,
      meta_es TEXT,
      title_es TEXT,
      text_es TEXT,
      meta_en TEXT,
      title_en TEXT,
      text_en TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const count = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM home_dishes'
  ).first();

  if (Number(count?.count || 0) > 0) return;

  const seeds = [
    {
      image_key:'assets/images/food-01.jpg', alt_it:'Pancakes serviti con frutta e frutti rossi',
      meta_it:'DOLCE · BRUNCH', title_it:'Pancakes', text_it:'Morbidi, colorati, da mangiare prima con gli occhi.',
      meta_es:'DULCE · BRUNCH', title_es:'Pancakes', text_es:'Suaves, coloridos, para comer primero con los ojos.',
      meta_en:'SWEET · BRUNCH', title_en:'Pancakes', text_en:'Soft, colourful and made to be eaten with your eyes first.', sort_order:1
    },
    {
      image_key:'assets/images/food-05.jpeg', alt_it:'Tostada di Génesis Restaurante',
      meta_it:'TOSTADAS', title_it:'Tostadas', text_it:'Semplici solo in apparenza.',
      meta_es:'TOSTADAS', title_es:'Tostadas', text_es:'Sencillas solo en apariencia.',
      meta_en:'TOSTADAS', title_en:'Tostadas', text_en:'Simple only at first glance.', sort_order:2
    },
    {
      image_key:'assets/images/food-09.jpeg', alt_it:'Bowl fresco e colorato',
      meta_it:'BOWLS', title_it:'Bowls', text_it:'Fresche, colorate, piene di cose buone.',
      meta_es:'BOWLS', title_es:'Bowls', text_es:'Frescos, coloridos y llenos de cosas buenas.',
      meta_en:'BOWLS', title_en:'Bowls', text_en:'Fresh, colourful and full of good things.', sort_order:3
    },
    {
      image_key:'assets/images/food-13.jpeg', alt_it:'Piatto da condividere di Génesis',
      meta_it:'DA CONDIVIDERE', title_it:'Da condividere', text_it:'Perché a volte il piatto migliore è quello che arriva in mezzo al tavolo.',
      meta_es:'PARA COMPARTIR', title_es:'Para compartir', text_es:'Porque a veces el mejor plato es el que llega al centro de la mesa.',
      meta_en:'TO SHARE', title_en:'To share', text_en:'Because sometimes the best dish is the one that arrives in the middle of the table.', sort_order:4
    },
    {
      image_key:'assets/images/food-15.jpeg', alt_it:'Proposta gastronomica internazionale di Génesis',
      meta_it:'DAL MONDO', title_it:'Sapori dal mondo', text_it:'Idee, ingredienti e influenze che viaggiano.',
      meta_es:'DEL MUNDO', title_es:'Sabores del mundo', text_es:'Ideas, ingredientes e influencias que viajan.',
      meta_en:'FROM AROUND THE WORLD', title_en:'Flavours from around the world', text_en:'Ideas, ingredients and influences that travel.', sort_order:5
    }
  ];

  const stmt = env.DB.prepare(`
    INSERT INTO home_dishes (
      image_key, alt_it,
      meta_it, title_it, text_it,
      meta_es, title_es, text_es,
      meta_en, title_en, text_en,
      published, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const d of seeds) {
    await stmt.bind(
      d.image_key, d.alt_it,
      d.meta_it, d.title_it, d.text_it,
      d.meta_es, d.title_es, d.text_es,
      d.meta_en, d.title_en, d.text_en,
      d.sort_order
    ).run();
  }
}

/* =========================================================
   CORS
   ========================================================= */

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
  "GET, POST, PUT, PATCH, DELETE, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",

    "Access-Control-Allow-Credentials":
      "true",

    "Vary":
      "Origin"

  };

}


/* =========================================================
   RISPOSTA JSON
   ========================================================= */

function json(
  request,
  data,
  status = 200
) {

  return Response.json(
    data,
    {
      status,
      headers:
        corsHeaders(request)
    }
  );

}


/* =========================================================
   RISPOSTA NON AUTORIZZATA
   ========================================================= */

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

async function createSession(
  secret
) {

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


/* =========================================================
   VERIFICA SESSIONE
   ========================================================= */

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


/* =========================================================
   RECUPERA SESSIONE
   ========================================================= */

function getSession(
  request
) {

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


/*
   Converte correttamente i valori booleani
   provenienti dal frontend o dall'Excel.

   Esempi:
   true       → 1
   false      → 0
   1          → 1
   0          → 0
   "SI"       → 1
   "SÌ"       → 1
   "YES"      → 1
   "TRUE"     → 1
   "1"        → 1
   "NO"       → 0
   "FALSE"    → 0
   ""         → 0
*/

function normalizeBoolean(
  value
) {

  if (
    typeof value === "boolean"
  ) {

    return value
      ? 1
      : 0;

  }

  if (
    typeof value === "number"
  ) {

    return value !== 0
      ? 1
      : 0;

  }

  const normalized =
    String(
      value ?? ""
    )
      .trim()
      .toUpperCase();

  return [
    "SI",
    "SÌ",
    "YES",
    "TRUE",
    "1",
    "OK"
  ].includes(
    normalized
  )
    ? 1
    : 0;

}


/* =========================================================
   NORMALIZZA PREZZO IN CENTESIMI
   ========================================================= */

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


/* =========================================================
   ESTENSIONE IMMAGINE
   ========================================================= */

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


/* =========================================================
   NORMALIZZA DATA/ORA
   ========================================================= */

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
   DATA E ORA CORRENTI — FUSO ORARIO EUROPA/ROMA
   ========================================================= */

function getRomeDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return (
    `${values.year}-${values.month}-${values.day} ` +
    `${values.hour}:${values.minute}:${values.second}`
  );
}

/* =========================================================
   CREA SLUG
   ========================================================= */

function createSlug(
  value
) {

  return String(
    value || ""
  )
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
      env.DB.prepare(
        query
      );

    const existing =
      currentId
        ? await statement
            .bind(
              slug,
              currentId
            )
            .first()
        : await statement
            .bind(
              slug
            )
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
       ORARI ADMIN — LISTA
       ===================================================== */

    if (
      url.pathname ===
        "/api/admin/opening-hours" &&
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


        /*
         * Il frontend attuale usa:
         *
         * day_name
         * hours
         *
         * Manteniamo comunque anche i campi originali.
         */

        const formatted =
          results.map(
            hour => ({

              id:
                hour.id,

              day_name:
                hour.day_label || "",

              hours:
                hour.is_closed
                  ? "Chiuso"
                  : (
                      hour.open_time &&
                      hour.close_time
                        ? `${hour.open_time} - ${hour.close_time}`
                        : ""
                    ),

              day_label:
                hour.day_label,

              open_time:
                hour.open_time,

              close_time:
                hour.close_time,

              is_closed:
                !!hour.is_closed,

              sort_order:
                hour.sort_order

            })
          );


        return json(
          request,
          formatted
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


        /*
         * Compatibilità con il frontend:
         *
         * day_name
         * hours
         *
         * e con eventuali chiamate vecchie:
         *
         * day_label
         * open_time
         * close_time
         * is_closed
         */

        const dayLabel =
          typeof body.day_name === "string"
            ? body.day_name.trim()
            : (
                typeof body.day_label === "string"
                  ? body.day_label.trim()
                  : ""
              );


        let openTime =
          body.open_time || null;

        let closeTime =
          body.close_time || null;


        let isClosed =
          body.is_closed
            ? 1
            : 0;


        /*
         * Se arriva "09:00 - 13:00",
         * lo convertiamo nei campi del database.
         */

        if (
          typeof body.hours === "string"
        ) {

          const value =
            body.hours.trim();


          if (
            value.toLowerCase() ===
              "chiuso"
          ) {

            isClosed = 1;

            openTime = null;

            closeTime = null;

          } else {

            const match =
              value.match(
                /^(.+?)\s*-\s*(.+?)$/
              );


            if (match) {

              openTime =
                match[1].trim();

              closeTime =
                match[2].trim();

              isClosed = 0;

            }

          }

        }


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
              "Errore durante la creazione dell'orario",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       MODIFICA ORARIO ADMIN
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/opening-hours" ||
        url.pathname.startsWith(
          "/api/admin/opening-hours/"
        )
      ) &&
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


        /*
         * Supportiamo:
         *
         * PATCH /opening-hours/:id
         *
         * e la vecchia forma batch:
         *
         * PATCH /opening-hours
         */


        if (
          Array.isArray(body)
        ) {

          for (
            const item
            of body
          ) {

            if (!item.id) {
              continue;
            }


            let openTime =
              item.open_time || null;

            let closeTime =
              item.close_time || null;

            let isClosed =
              item.is_closed
                ? 1
                : 0;


            if (
              typeof item.hours ===
              "string"
            ) {

              const value =
                item.hours.trim();


              if (
                value.toLowerCase() ===
                  "chiuso"
              ) {

                isClosed = 1;

                openTime = null;

                closeTime = null;

              } else {

                const match =
                  value.match(
                    /^(.+?)\s*-\s*(.+?)$/
                  );


                if (match) {

                  openTime =
                    match[1].trim();

                  closeTime =
                    match[2].trim();

                  isClosed = 0;

                }

              }

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
                item.day_name ||
                  item.day_label ||
                  "",
                openTime,
                closeTime,
                isClosed,
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

        }


        const idFromPath =
          url.pathname.startsWith(
            "/api/admin/opening-hours/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
                body?.id
              );


        if (
          !Number.isInteger(
            idFromPath
          ) ||
          idFromPath <= 0
        ) {

          return json(
            request,
            {
              error:
                "ID orario non valido"
            },
            400
          );

        }


        let openTime =
          body.open_time || null;

        let closeTime =
          body.close_time || null;

        let isClosed =
          body.is_closed
            ? 1
            : 0;


        if (
          typeof body.hours ===
          "string"
        ) {

          const value =
            body.hours.trim();


          if (
            value.toLowerCase() ===
              "chiuso"
          ) {

            isClosed = 1;

            openTime = null;

            closeTime = null;

          } else {

            const match =
              value.match(
                /^(.+?)\s*-\s*(.+?)$/
              );


            if (match) {

              openTime =
                match[1].trim();

              closeTime =
                match[2].trim();

              isClosed = 0;

            }

          }

        }


        const result =
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
              body.day_name ||
                body.day_label ||
                "",
              openTime,
              closeTime,
              isClosed,
              idFromPath
            )
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Orario non trovato"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true,
            id:
              idFromPath
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante il salvataggio dell'orario",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       ELIMINA ORARIO ADMIN
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/opening-hours" ||
        url.pathname.startsWith(
          "/api/admin/opening-hours/"
        )
      ) &&
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
          url.pathname.startsWith(
            "/api/admin/opening-hours/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
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
                "ID non valido"
            },
            400
          );

        }


        const result =
          await env.DB
            .prepare(`
              DELETE FROM opening_hours
              WHERE id = ?
            `)
            .bind(id)
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Orario non trovato"
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

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione dell'orario",
            details:
              error?.message ||
              String(error)
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
       POP-UP PUBBLICO
       ===================================================== */

    if (
      url.pathname ===
        "/api/popup" &&
      request.method === "GET"
    ) {

      try {

    const nowRome = getRomeDateTime();

    const popup = await env.DB
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
            OR starts_at <= ?
          )
          AND (
            ends_at IS NULL
            OR ends_at >= ?
          )
        ORDER BY
          id DESC
        LIMIT 1
      `)
      .bind(nowRome, nowRome)
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
              "Errore durante il caricamento del pop-up"
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


        const published = normalizeBoolean(body.published);


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
      (
        url.pathname ===
          "/api/admin/popups" ||
        url.pathname.startsWith(
          "/api/admin/popups/"
        )
      ) &&
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
         * Supportiamo sia:
         *
         * PATCH /api/admin/popups/:id
         *
         * sia la vecchia:
         *
         * PATCH /api/admin/popups
         * con body.id
         */


        const id =
          url.pathname.startsWith(
            "/api/admin/popups/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
                body?.id
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


        const published = normalizeBoolean(body.published);


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


        const existingPopup = await env.DB
          .prepare('SELECT id FROM popups WHERE id = ?')
          .bind(id)
          .first();

        if (!existingPopup) {
          return json(request, { error: "Pop-up non trovato" }, 404);
        }


        return json(
          request,
          {
            success: true,
            id
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
      (
        url.pathname ===
          "/api/admin/popups" ||
        url.pathname.startsWith(
          "/api/admin/popups/"
        )
      ) &&
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
          url.pathname.startsWith(
            "/api/admin/popups/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
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
       PIATTI HOMEPAGE — PUBBLICI E ADMIN
       ===================================================== */

    if (url.pathname === "/api/home-dishes" && request.method === "GET") {
      try {
        await ensureHomeDishes(env);
        const { results } = await env.DB.prepare(`
          SELECT id, image_key, alt_it,
                 meta_it, title_it, text_it,
                 meta_es, title_es, text_es,
                 meta_en, title_en, text_en,
                 published, sort_order
          FROM home_dishes
          WHERE published = 1
          ORDER BY sort_order, id
        `).all();
        return json(request, results);
      } catch (error) {
        console.error("Errore caricamento piatti homepage:", error);
        return json(request, { error: "Errore durante il caricamento dei piatti in home" }, 500);
      }
    }

    if (url.pathname === "/api/admin/home-dishes" && request.method === "GET") {
      if (!await requireAdmin(request, env)) return unauthorized(request);
      try {
        await ensureHomeDishes(env);
        const { results } = await env.DB.prepare(`
          SELECT id, image_key, alt_it,
                 meta_it, title_it, text_it,
                 meta_es, title_es, text_es,
                 meta_en, title_en, text_en,
                 published, sort_order
          FROM home_dishes
          ORDER BY sort_order, id
        `).all();
        return json(request, results);
      } catch (error) {
        console.error("Errore caricamento admin piatti homepage:", error);
        return json(request, { error: "Errore durante il caricamento delle card homepage" }, 500);
      }
    }

    if (url.pathname.startsWith("/api/admin/home-dishes/") && request.method === "PATCH") {
      if (!await requireAdmin(request, env)) return unauthorized(request);
      try {
        await ensureHomeDishes(env);
        const id = Number(url.pathname.split("/").pop());
        if (!Number.isInteger(id) || id <= 0) {
          return json(request, { error: "ID della card non valido" }, 400);
        }
        const body = await request.json();
        const fields = ["image_key", "alt_it", "meta_it", "title_it", "text_it", "meta_es", "title_es", "text_es", "meta_en", "title_en", "text_en"];
        const values = fields.map(key => typeof body[key] === "string" ? body[key].trim() : "");
        const titles = [body.title_it, body.title_es, body.title_en];
        if (titles.some(value => typeof value !== "string" || !value.trim())) {
          return json(request, { error: "Il titolo deve essere compilato in italiano, spagnolo e inglese." }, 400);
        }
        const sortOrder = Number(body.sort_order);
        if (!Number.isFinite(sortOrder)) {
          return json(request, { error: "Ordine della card non valido." }, 400);
        }
        await env.DB.prepare(`
          UPDATE home_dishes SET
            image_key = ?, alt_it = ?,
            meta_it = ?, title_it = ?, text_it = ?,
            meta_es = ?, title_es = ?, text_es = ?,
            meta_en = ?, title_en = ?, text_en = ?,
            published = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(...values, normalizeBoolean(body.published), Math.round(sortOrder), id).run();
        const exists = await env.DB.prepare("SELECT id FROM home_dishes WHERE id = ?").bind(id).first();
        if (!exists) return json(request, { error: "Card homepage non trovata" }, 404);
        return json(request, { success: true, id });
      } catch (error) {
        console.error("Errore salvataggio piatto homepage:", error);
        return json(request, { error: "Errore durante il salvataggio della card homepage", details: error?.message || String(error) }, 500);
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
                dishes.name_en,
                dishes.name_it,
                dishes.description_es,
                dishes.description_en,
                dishes.description_it,

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


        const infoRow = await env.DB.prepare(
  "SELECT value_es FROM settings WHERE key = ?"
).bind("menu_info").first();

let menuInfo = null;

if (infoRow?.value_es) {
  try {
    menuInfo = JSON.parse(infoRow.value_es);
  } catch (error) {
    console.error("Errore lettura menu-info:", error);
  }
}

const settings = menuInfo
  ? {
      extras: Array.isArray(menuInfo.extras)
        ? menuInfo.extras.map(item => {
            const nameEs = String(item.name_es ?? item.name ?? "");
            return {
              ...item,
              name: nameEs,
              name_es: nameEs,
              name_en: String(item.name_en ?? ""),
              name_it: String(item.name_it ?? "")
            };
          })
        : [],
      allergens: Array.isArray(menuInfo.allergens)
        ? menuInfo.allergens.map(item => {
            const nameEs = String(item.name_es ?? item.name ?? "");
            const code = String(item.code ?? item.number ?? "");
            return {
              ...item,
              number: code,
              code,
              name: nameEs,
              name_es: nameEs,
              name_en: String(item.name_en ?? ""),
              name_it: String(item.name_it ?? "")
            };
          })
        : []
    }
  : {};

return json(request, {
  dishes,
  notes,
  settings
});


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

/* MENU INFO ADMIN — EXTRA E ALLERGENI */

if (
  url.pathname === "/api/admin/menu-info" &&
  request.method === "GET"
) {
  const validSession = await requireAdmin(request, env);
  if (!validSession) return unauthorized(request);

  try {
    const row = await env.DB.prepare(
      "SELECT value_es FROM settings WHERE key = ?"
    ).bind("menu_info").first();

    let info = null;

    if (row?.value_es) {
      try {
        info = JSON.parse(row.value_es);
      } catch {
        info = null;
      }
    }

    return json(request, {
      extras: Array.isArray(info?.extras) ? info.extras : null,
      allergens: Array.isArray(info?.allergens) ? info.allergens : null
    });
  } catch (error) {
    console.error("Errore caricamento menu-info:", error);

    return json(request, {
      error: "Errore durante il caricamento di extra e allergeni"
    }, 500);
  }
}

if (
  url.pathname === "/api/admin/menu-info" &&
  request.method === "PUT"
) {
  const validSession = await requireAdmin(request, env);
  if (!validSession) return unauthorized(request);

  try {
    const body = await request.json();

    if (
      !Array.isArray(body.extras) ||
      !Array.isArray(body.allergens)
    ) {
      return json(request, {
        error: "Formato dei dati non valido"
      }, 400);
    }

    const extras = body.extras.map(item => {
      const nameEs = String(item.name_es ?? item.name ?? "")
        .trim().slice(0, 150);
      return {
        name: nameEs,
        name_es: nameEs,
        name_en: String(item.name_en ?? "").trim().slice(0, 150),
        name_it: String(item.name_it ?? "").trim().slice(0, 150),
        price: Number(item.price ?? 0)
      };
    });

    if (extras.some(item =>
      !Number.isFinite(item.price) || item.price < 0
    )) {
      return json(request, {
        error: "Uno o più prezzi non sono validi"
      }, 400);
    }

    const allergens = body.allergens.map(item => {
      const nameEs = String(item.name_es ?? item.name ?? "")
        .trim().slice(0, 100);
      return {
        code: String(item.code ?? "").trim().slice(0, 10),
        name: nameEs,
        name_es: nameEs,
        name_en: String(item.name_en ?? "").trim().slice(0, 100),
        name_it: String(item.name_it ?? "").trim().slice(0, 100)
      };
    });

    const info = JSON.stringify({
      extras,
      allergens
    });

    await env.DB.prepare(`
      INSERT INTO settings (key, value_es, updated_at)
      VALUES ('menu_info', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value_es = excluded.value_es,
        updated_at = CURRENT_TIMESTAMP
    `).bind(info).run();

    return json(request, {
      success: true,
      message: "Extra e allergeni salvati correttamente"
    });
  } catch (error) {
    console.error("Errore salvataggio menu-info:", error);

    return json(request, {
      error: "Errore durante il salvataggio di extra e allergeni"
    }, 500);
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
                name_en,
                name_it,
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
              "Errore durante la creazione della categoria",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — MODIFICA
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/categories" ||
        url.pathname.startsWith(
          "/api/admin/categories/"
        )
      ) &&
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


        /*
         * Manteniamo compatibilità con
         * il vecchio PATCH batch.
         */

        if (
          Array.isArray(body)
        ) {

          for (
            const item
            of body
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
                Number(item.sort_order || 0),
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

        }


        const id =
          url.pathname.startsWith(
            "/api/admin/categories/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
                body?.id
              );


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {

          return json(
            request,
            {
              error:
                "ID categoria non valido"
            },
            400
          );

        }


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
              nameEs,
            id
          );


        const result =
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
              Number(body.sort_order || 0),
              id
            )
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Categoria non trovata"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true,
            id,
            slug
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la modifica della categoria",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       CATEGORIE ADMIN — ELIMINA
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/categories" ||
        url.pathname.startsWith(
          "/api/admin/categories/"
        )
      ) &&
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
          url.pathname.startsWith(
            "/api/admin/categories/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
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


        const result =
          await env.DB
            .prepare(`
              DELETE FROM categories
              WHERE id = ?
            `)
            .bind(id)
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Categoria non trovata"
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

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione della categoria",
            details:
              error?.message ||
              String(error)
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
              "Errore durante la creazione della nota",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       NOTE CATEGORIE ADMIN — MODIFICA
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/category-notes" ||
        url.pathname.startsWith(
          "/api/admin/category-notes/"
        )
      ) &&
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
          Array.isArray(body)
        ) {

          for (
            const item
            of body
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

        }


        const id =
          url.pathname.startsWith(
            "/api/admin/category-notes/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
                body?.id
              );


        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {

          return json(
            request,
            {
              error:
                "ID nota non valido"
            },
            400
          );

        }


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


        const result =
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
                body.sort_order ||
                0
              ),
              id
            )
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Nota non trovata"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true,
            id
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la modifica delle note",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       NOTE CATEGORIE ADMIN — ELIMINA
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/category-notes" ||
        url.pathname.startsWith(
          "/api/admin/category-notes/"
        )
      ) &&
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
          url.pathname.startsWith(
            "/api/admin/category-notes/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
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
                "ID non valido"
            },
            400
          );

        }


        const result =
          await env.DB
            .prepare(`
              DELETE FROM category_notes
              WHERE id = ?
            `)
            .bind(id)
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Nota non trovata"
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

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione della nota",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       IMPORTAZIONE MENU DA EXCEL
       POST /api/admin/import-menu
       ===================================================== */

    if (
      request.method === "POST" &&
      url.pathname === "/api/admin/import-menu"
    ) {

      const admin =
        await requireAdmin(
          request,
          env
        );


      if (!admin) {

        return unauthorized(
          request
        );

      }


      let body;

      try {

        body =
          await request.json();

      } catch (error) {

        console.error(
          "Errore parsing JSON import menu:",
          error
        );

        return json(
          request,
          {
            error:
              "JSON non valido.",
            details:
              error?.message ||
              String(error)
          },
          400
        );

      }


      const rows =
        Array.isArray(
          body?.dishes
        )
          ? body.dishes
          : [];


      if (!rows.length) {

        return json(
          request,
          {
            success: false,
            error:
              "Nessun piatto da importare.",
            categories_created: 0,
            dishes_created: 0,
            dishes_updated: 0,
            errors: []
          },
          400
        );

      }


      let categoriesCreated =
        0;

      let dishesCreated =
        0;

      let dishesUpdated =
        0;

      const errors = [];


      /* -----------------------------------------------------
         CACHE CATEGORIE
         ----------------------------------------------------- */

      let existingCategories;

      try {

        existingCategories =
          await env.DB
            .prepare(`
              SELECT
                id,
                name_es,
                slug,
                sort_order
              FROM categories
              ORDER BY
                sort_order ASC,
                id ASC
            `)
            .all();

      } catch (error) {

        console.error(
          "Errore caricamento categorie durante import:",
          error
        );

        return json(
          request,
          {
            success: false,
            categories_created: 0,
            dishes_created: 0,
            dishes_updated: 0,
            errors: [
              `Impossibile leggere le categorie: ${
                error?.message ||
                String(error)
              }`
            ]
          },
          500
        );

      }


      const categoryMap =
        new Map();


      for (
        const category
        of (
          existingCategories.results ||
          []
        )
      ) {

        const key =
          createSlug(
            category.name_es
          );


        if (key) {

          categoryMap.set(
            key,
            category
          );

        }

      }


      async function getOrCreateCategory(
        categoryName
      ) {

        const cleanName =
          String(
            categoryName ?? ""
          ).trim();


        if (!cleanName) {

          throw new Error(
            "Categoria mancante."
          );

        }


        const categoryKey =
          createSlug(
            cleanName
          );


        if (!categoryKey) {

          throw new Error(
            `Nome categoria non valido: "${cleanName}".`
          );

        }


        if (
          categoryMap.has(
            categoryKey
          )
        ) {

          return categoryMap.get(
            categoryKey
          );

        }


        const existing =
          await env.DB
            .prepare(`
              SELECT
                id,
                name_es,
                slug,
                sort_order
              FROM categories
              WHERE slug = ?
              LIMIT 1
            `)
            .bind(
              categoryKey
            )
            .first();


        if (existing) {

          categoryMap.set(
            categoryKey,
            existing
          );

          return existing;

        }


        const maxOrder =
          await env.DB
            .prepare(`
              SELECT
                COALESCE(
                  MAX(sort_order),
                  -1
                ) AS max_order
              FROM categories
            `)
            .first();


        const newSortOrder =
          Number(
            maxOrder?.max_order ??
            -1
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
              cleanName,
              categoryKey,
              newSortOrder
            )
            .run();


        const categoryId =
          result?.meta?.last_row_id;


        if (!categoryId) {

          throw new Error(
            `Impossibile creare la categoria "${cleanName}".`
          );

        }


        const created = {

          id:
            categoryId,

          name_es:
            cleanName,

          slug:
            categoryKey,

          sort_order:
            newSortOrder

        };


        categoryMap.set(
          categoryKey,
          created
        );


        categoriesCreated++;


        return created;

      }


      /* -----------------------------------------------------
         IMPORTAZIONE RIGA PER RIGA
         ----------------------------------------------------- */

      for (
        let index = 0;
        index < rows.length;
        index++
      ) {

        const row =
          rows[index];


        const rowNumber =
          index + 2;


        try {

          const name =
            String(
              row?.nome ?? ""
            ).trim();


          const categoryName =
            String(
              row?.categoria ?? ""
            ).trim();


          if (!name) {

            throw new Error(
              "Nome piatto mancante."
            );

          }


          if (!categoryName) {

            throw new Error(
              "Categoria mancante."
            );

          }


          let priceCents =
            null;


          if (
            row?.prezzo !== null &&
            row?.prezzo !== undefined &&
            String(
              row.prezzo
            ).trim() !== ""
          ) {

            const price =
              Number(
                String(
                  row.prezzo
                )
                  .trim()
                  .replace(
                    ",",
                    "."
                  )
              );


            if (
              !Number.isFinite(
                price
              ) ||
              price < 0
            ) {

              throw new Error(
                "Prezzo non valido."
              );

            }


            priceCents =
              Math.round(
                price * 100
              );

          }


          let priceMaxCents =
            null;


          if (
            row?.prezzo_massimo !== null &&
            row?.prezzo_massimo !== undefined &&
            String(
              row.prezzo_massimo
            ).trim() !== ""
          ) {

            const maxPrice =
              Number(
                String(
                  row.prezzo_massimo
                )
                  .trim()
                  .replace(
                    ",",
                    "."
                  )
              );


            if (
              !Number.isFinite(
                maxPrice
              ) ||
              maxPrice < 0
            ) {

              throw new Error(
                "Prezzo massimo non valido."
              );

            }


            priceMaxCents =
              Math.round(
                maxPrice * 100
              );

          }


          const category =
            await getOrCreateCategory(
              categoryName
            );


          let sortOrder =
            Number(
              row?.ordine
            );


          if (
            !Number.isFinite(
              sortOrder
            )
          ) {

            sortOrder =
              index;

          }


          const description =
            String(
              row?.descrizione ?? ""
            ).trim();


          const allergens =
            String(
              row?.allergeni ?? ""
            ).trim();


          const available =
            (
              row?.disponibile === true ||
              row?.disponibile === 1 ||
              String(
                row?.disponibile ?? ""
              )
                .trim()
                .toUpperCase() === "SI" ||
              String(
                row?.disponibile ?? ""
              )
                .trim()
                .toUpperCase() === "SÌ" ||
              String(
                row?.disponibile ?? ""
              )
                .trim()
                .toUpperCase() === "YES" ||
              String(
                row?.disponibile ?? ""
              )
                .trim()
                .toUpperCase() === "TRUE"
            )
              ? 1
              : 0;


          const vegetarian =
            (
              row?.vegetariano === true ||
              row?.vegetariano === 1 ||
              String(
                row?.vegetariano ?? ""
              )
                .trim()
                .toUpperCase() === "SI" ||
              String(
                row?.vegetariano ?? ""
              )
                .trim()
                .toUpperCase() === "SÌ" ||
              String(
                row?.vegetariano ?? ""
              )
                .trim()
                .toUpperCase() === "YES" ||
              String(
                row?.vegetariano ?? ""
              )
                .trim()
                .toUpperCase() === "TRUE"
            )
              ? 1
              : 0;


          const vegan =
            (
              row?.vegano === true ||
              row?.vegano === 1 ||
              String(
                row?.vegano ?? ""
              )
                .trim()
                .toUpperCase() === "SI" ||
              String(
                row?.vegano ?? ""
              )
                .trim()
                .toUpperCase() === "SÌ" ||
              String(
                row?.vegano ?? ""
              )
                .trim()
                .toUpperCase() === "YES" ||
              String(
                row?.vegano ?? ""
              )
                .trim()
                .toUpperCase() === "TRUE"
            )
              ? 1
              : 0;


          const existingDish =
            await env.DB
              .prepare(`
                SELECT
                  id
                FROM dishes
                WHERE
                  category_id = ?
                  AND LOWER(
                    TRIM(name_es)
                  ) = LOWER(
                    TRIM(?)
                  )
                LIMIT 1
              `)
              .bind(
                category.id,
                name
              )
              .first();


          if (existingDish) {

            const updateResult =
              await env.DB
                .prepare(`
                  UPDATE dishes
                  SET
                    description_es = ?,
                    price_cents = ?,
                    price_max_cents = ?,
                    allergens = ?,
                    vegetarian = ?,
                    vegan = ?,
                    available = ?,
                    sort_order = ?,
                    updated_at =
                      CURRENT_TIMESTAMP
                  WHERE id = ?
                `)
                .bind(
                  description,
                  priceCents,
                  priceMaxCents,
                  allergens,
                  vegetarian,
                  vegan,
                  available,
                  sortOrder,
                  existingDish.id
                )
                .run();


            if (
              !updateResult?.meta?.changes
            ) {

              throw new Error(
                `Impossibile aggiornare il piatto "${name}".`
              );

            }


            dishesUpdated++;

          } else {

            const insertResult =
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
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                  )
                `)
                .bind(
                  category.id,
                  name,
                  description,
                  priceCents,
                  priceMaxCents,
                  allergens,
                  "",
                  vegetarian,
                  vegan,
                  available,
                  sortOrder
                )
                .run();


            const newDishId =
              insertResult?.meta?.last_row_id;


            if (!newDishId) {

              throw new Error(
                `Il database non ha restituito l'ID del nuovo piatto "${name}".`
              );

            }


            const insertedDish =
              await env.DB
                .prepare(`
                  SELECT
                    id,
                    category_id,
                    name_es
                  FROM dishes
                  WHERE id = ?
                  LIMIT 1
                `)
                .bind(
                  newDishId
                )
                .first();


            if (!insertedDish) {

              throw new Error(
                `Il piatto "${name}" è stato inserito ma non è stato trovato nella verifica immediata.`
              );

            }


            dishesCreated++;

          }


        } catch (error) {

          const message =
            error?.message ||
            String(error);


          console.error(
            `Errore importazione riga ${rowNumber}:`,
            error
          );


          errors.push(
            `Riga ${rowNumber} — ${message}`
          );

        }

      }


      const success =
        errors.length === 0;


      return json(
        request,
        {
          success,

          categories_created:
            categoriesCreated,

          dishes_created:
            dishesCreated,

          dishes_updated:
            dishesUpdated,

          total_rows:
            rows.length,

          errors

        },
        success
          ? 200
          : 207
      );

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
                dishes.name_en,
                dishes.name_it,
                dishes.description_es,
                dishes.description_en,
                dishes.description_it,

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
              "Errore durante il caricamento dei piatti",
            details:
              error?.message ||
              String(error)
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


        const descriptionEn = typeof body.description_en === "string" ? body.description_en.trim() : null;
        const descriptionIt = typeof body.description_it === "string" ? body.description_it.trim() : null;

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
                description_en,
                description_it,

                price_cents,
                price_max_cents,

                allergens,

                image_key,

                vegetarian,
                vegan,
                available,

                sort_order

              )

              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(

              categoryId,

              nameEs,
              descriptionEs,
              descriptionEn,
              descriptionIt,

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
              "Errore durante la creazione del piatto",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — MODIFICA
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/api/admin/dishes/"
      ) &&
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

        const id =
          Number(
            url.pathname
              .split("/")
              .pop()
          );


        if (!id) {

          return json(
            request,
            {
              error:
                "ID piatto non valido"
            },
            400
          );

        }


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
                "Il nome del piatto è obbligatorio"
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


        const descriptionEn = typeof body.description_en === "string" ? body.description_en.trim() : null;
        const descriptionIt = typeof body.description_it === "string" ? body.description_it.trim() : null;

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
          body.image_key
            ? String(
                body.image_key
              ).trim()
            : null;


        const vegetarian =
          normalizeBoolean(
            body.vegetarian
          );


        const vegan =
          normalizeBoolean(
            body.vegan
          );


        const available =
          normalizeBoolean(
            body.available
          );


        const sortOrder =
          Number(
            body.sort_order || 0
          );


        const result =
          await env.DB
            .prepare(`
              UPDATE dishes
              SET
                category_id = ?,
                name_es = ?,
                description_es = ?,
                description_en = COALESCE(?, description_en),
                description_it = COALESCE(?, description_it),
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
              descriptionEn,
              descriptionIt,
              priceCents,
              priceMaxCents,
              allergens,
              imageKey,
              vegetarian,
              vegan,
              available,
              sortOrder,
              id
            )
            .run();


        if (
          !result.meta ||
          result.meta.changes === 0
        ) {

          return json(
            request,
            {
              error:
                "Piatto non trovato"
            },
            404
          );

        }


        return json(
          request,
          {
            success: true,
            id
          }
        );


      } catch (error) {

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante la modifica del piatto",
            details:
              error?.message ||
              String(error)
          },
          500
        );

      }

    }


    /* =====================================================
       PIATTI ADMIN — ELIMINA
       ===================================================== */

    if (
      (
        url.pathname ===
          "/api/admin/dishes" ||
        url.pathname.startsWith(
          "/api/admin/dishes/"
        )
      ) &&
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
          url.pathname.startsWith(
            "/api/admin/dishes/"
          )
            ? Number(
                url.pathname
                  .split("/")
                  .pop()
              )
            : Number(
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
                "ID non valido"
            },
            400
          );

        }


        const result =
          await env.DB
            .prepare(`
              DELETE FROM dishes
              WHERE id = ?
            `)
            .bind(id)
            .run();


        if (
          !result?.meta?.changes
        ) {

          return json(
            request,
            {
              error:
                "Piatto non trovato"
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

        console.error(error);

        return json(
          request,
          {
            error:
              "Errore durante l'eliminazione del piatto",
            details:
              error?.message ||
              String(error)
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
              "Errore durante il caricamento dell'immagine",
            details:
              error?.message ||
              String(error)
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