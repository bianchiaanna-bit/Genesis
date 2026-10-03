/* =========================================================
   GÉNESIS RESTAURANTE
   APP.JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     YEAR
     ======================================================= */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


/* =======================================================
   MOBILE MENU
   ======================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");

const closeMobileMenu = () => {
  if (!menuToggle || !mobileNav) return;

  mobileNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

const openMobileMenu = () => {
  if (!menuToggle || !mobileNav) return;

  mobileNav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
};

if (menuToggle && mobileNav) {

  menuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (mobileNav.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  mobileNav.querySelectorAll(".lang").forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

  /* =======================================================
     TRANSLATIONS
     ======================================================= */

  const translations = {

    it: {

      nav: {
        menu: "Menu",
        story: "Génesis",
        instagram: "Instagram",
        visit: "Dove siamo",
        cta: "Vedi il menu"
      },

      hero: {
        eyebrow: "GÉNESIS",
        line1: "Un posto dove venire per mangiare.",
        line2: "E restare per stare bene.",
        text: "Brunch, colazione, piatti da condividere e sapori da tutto il mondo, nel cuore di La Laguna.",
        primary: "Scopri Génesis",
        secondary: "Vedi il menu"
      },

      intro: {
        kicker: "GÉNESIS",
        title: "Qui non c'è un solo modo di mangiare.",
        p1: "C'è chi arriva per un caffè, chi per un brunch senza fretta, chi sceglie qualcosa di fresco, chi ha voglia di pancakes e chi vuole condividere un piatto.",
        p2: "Génesis nasce proprio da questo: dalla voglia di mettere insieme sapori, persone e momenti diversi, in un luogo semplice da vivere e difficile da dimenticare."
      },

      atmosfera: {
        kicker: "ATMOSFERA",
        title: "Sentirsi bene fa parte del menu.",
        p1: "Un ambiente accogliente, dettagli curati, musica, colori e quella sensazione di poter rallentare un po'.",
        p2: "Génesis è un piccolo angolo nel centro di La Laguna dove venire a mangiare, chiacchierare, incontrarsi e concedersi qualche momento senza fretta.",
        highlight: "Come a casa. Ma con qualcosa di buono davanti."
      },

      cucina: {
        kicker: "CUCINA",
        title: "Un po' di qui.<br>Un po' di là.<br><em>Tutto Génesis.</em>",
        p1: "La nostra cucina non ama stare dentro una sola definizione.",
        p2: "Pancakes e tostadas.<br>Uova, bowls e smoothies.<br>Tapas, hummus e falafel.<br>Poke, tacos e burritos.<br>Piatti freschi, proposte vegetariane e alternative vegane.",
        highlight: "Sapori diversi, stessa tavola.",
        button: "Scopri la cucina"
      },

      brunch: {
        kicker: "BRUNCH",
        title: "Il brunch, quando hai voglia di qualcosa in più.",
        p1: "Dolce o salato?<br>Leggero o abbondante?<br>Da condividere o tutto per te?",
        p2: "A Génesis non serve scegliere un solo modo di iniziare la giornata.",
        p3: "Pancakes, frutta, yogurt, uova, toast, salmone, smoothies e tante combinazioni da scoprire.",
        highlight: "Prenditi il tuo tempo."
      },

      menu: {
        kicker: "PIATTI",
        title: "Alcune cose si raccontano<br>meglio con una <em>forchetta.</em>",
        button: "Vedi il menu",

        dish1: {
          meta: "DOLCE · BRUNCH",
          title: "Pancakes",
          text: "Morbidi, colorati, da mangiare prima con gli occhi."
        },

        dish2: {
          meta: "TOSTADAS",
          title: "Tostadas",
          text: "Semplici solo in apparenza."
        },

        dish3: {
          meta: "BOWLS",
          title: "Bowls",
          text: "Fresche, colorate, piene di cose buone."
        },

        dish4: {
          meta: "DA CONDIVIDERE",
          title: "Da condividere",
          text: "Perché a volte il piatto migliore è quello che arriva in mezzo al tavolo."
        },

        dish5: {
          meta: "DAL MONDO",
          title: "Sapori dal mondo",
          text: "Idee, ingredienti e influenze che viaggiano."
        }
      },

      dettagli: {
        kicker: "DETTAGLI",
        title: "Prima lo vedi.<br>Poi lo assaggi.<br><em>E alla fine capisci perché vuoi tornare.</em>",
        p1: "Da Génesis anche i dettagli hanno il loro posto.",
        p2: "La presentazione dei piatti, l'ambiente, il modo in cui vieni accolto, una buona musica in sottofondo.",
        p3: "Perché mangiare fuori non significa soltanto scegliere cosa ordinare."
      },

      laguna: {
        kicker: "LA LAGUNA",
        title: "Nel cuore di<br><em>La Laguna.</em>",
        p1: "Génesis si trova in Calle San Agustín, nel centro storico di San Cristóbal de La Laguna.",
        p2: "Una passeggiata tra le strade della città, una pausa davanti a qualcosa di buono, una chiacchiera che si allunga più del previsto.",
        p3: "A volte non serve un programma.<br>Basta trovare il posto giusto.",
        button: "Come arrivare"
      },

      esperienza: {
        kicker: "ESPERIENZA",
        title: "Vieni<br><em>come sei.</em>",
        p1: "Da solo, in compagnia, per una colazione veloce o per un brunch da vivere con calma.",
        p2: "Per qualcosa di leggero.<br>Per qualcosa di sfizioso.<br>Per provare un sapore nuovo.<br>O semplicemente perché oggi avevi voglia di uscire.",
        highlight: "C'è sempre un buon motivo per passare da Génesis."
      },

      instagram: {
        kicker: "Instagram",
        follow: "Segui Génesis su Instagram"
      },

      cta: {
        kicker: "GÉNESIS",
        title: "Ci vediamo<br><em>a tavola?</em>",
        address: "Calle San Agustín, 11<br>La Laguna · Tenerife",
        menu: "Vedi il menu",
        maps: "Come arrivare"
      },

      visit: {
        kicker: "CONTATTI",
        title: "Ci trovi<br><em>qui.</em>",
        maps: "Apri in Google Maps",
        hours: "Orari",
        weekday: "Lunedì — Venerdì",
        weekend: "Sabato — Domenica",
        note: "Orari da confermare con il ristorante."
      },

      footer: {
        tagline: "Comida, brunch y buenos momentos en La Laguna.",
        visit: "Visítanos",
        social: "Social"
      }

    },


    /* =====================================================
       SPANISH
       ===================================================== */

    es: {

      nav: {
        menu: "Carta",
        story: "Génesis",
        instagram: "Instagram",
        visit: "Visítanos",
        cta: "Ver carta"
      },

      hero: {
        eyebrow: "GÉNESIS",
        line1: "Un lugar al que venir a comer.",
        line2: "Y quedarse para estar bien.",
        text: "Brunch, desayunos, platos para compartir y sabores de todo el mundo, en el corazón de La Laguna.",
        primary: "Descubre Génesis",
        secondary: "Ver la carta"
      },

      intro: {
        kicker: "GÉNESIS",
        title: "Aquí no hay una sola forma de comer.",
        p1: "Hay quien viene por un café, quien disfruta de un brunch sin prisa, quien busca algo fresco, quien tiene ganas de pancakes y quien quiere compartir un plato.",
        p2: "Génesis nace precisamente de eso: de las ganas de reunir sabores, personas y momentos diferentes en un lugar fácil de disfrutar y difícil de olvidar."
      },

      atmosfera: {
        kicker: "ATMÓSFERA",
        title: "Sentirse bien también forma parte del menú.",
        p1: "Un ambiente acogedor, detalles cuidados, música, colores y esa sensación de poder bajar un poco el ritmo.",
        p2: "Génesis es un pequeño rincón en el centro de La Laguna donde venir a comer, charlar, encontrarse y disfrutar de un momento sin prisas.",
        highlight: "Como en casa. Pero con algo bueno delante."
      },

      cucina: {
        kicker: "COCINA",
        title: "Un poco de aquí.<br>Un poco de allí.<br><em>Todo Génesis.</em>",
        p1: "Nuestra cocina no quiere quedarse dentro de una sola definición.",
        p2: "Pancakes y tostadas.<br>Huevos, bowls y smoothies.<br>Tapas, hummus y falafel.<br>Poke, tacos y burritos.<br>Platos frescos, propuestas vegetarianas y opciones veganas.",
        highlight: "Sabores diferentes, una misma mesa.",
        button: "Descubre nuestra cocina"
      },

      brunch: {
        kicker: "BRUNCH",
        title: "El brunch, cuando te apetece algo más.",
        p1: "¿Dulce o salado?<br>¿Ligero o abundante?<br>¿Para compartir o todo para ti?",
        p2: "En Génesis no hace falta elegir una sola forma de empezar el día.",
        p3: "Pancakes, fruta, yogur, huevos, tostadas, salmón, smoothies y muchas combinaciones por descubrir.",
        highlight: "Tómate tu tiempo."
      },

      menu: {
        kicker: "PLATOS",
        title: "Algunas cosas se cuentan mejor<br>con un <em>tenedor.</em>",
        button: "Ver la carta",

        dish1: {
          meta: "DULCE · BRUNCH",
          title: "Pancakes",
          text: "Suaves, coloridos, para comer primero con los ojos."
        },

        dish2: {
          meta: "TOSTADAS",
          title: "Tostadas",
          text: "Sencillas solo en apariencia."
        },

        dish3: {
          meta: "BOWLS",
          title: "Bowls",
          text: "Frescos, coloridos y llenos de cosas buenas."
        },

        dish4: {
          meta: "PARA COMPARTIR",
          title: "Para compartir",
          text: "Porque a veces el mejor plato es el que llega al centro de la mesa."
        },

        dish5: {
          meta: "DEL MUNDO",
          title: "Sabores del mundo",
          text: "Ideas, ingredientes e influencias que viajan."
        }
      },

      dettagli: {
        kicker: "DETALLES",
        title: "Primero lo ves.<br>Después lo pruebas.<br><em>Y al final entiendes por qué quieres volver.</em>",
        p1: "En Génesis, cada detalle tiene su lugar.",
        p2: "La presentación de los platos, el ambiente, la forma en que te reciben y una buena música de fondo.",
        p3: "Porque comer fuera no significa solamente elegir qué pedir."
      },

      laguna: {
        kicker: "LA LAGUNA",
        title: "En el corazón de<br><em>La Laguna.</em>",
        p1: "Génesis está en Calle San Agustín, en el centro histórico de San Cristóbal de La Laguna.",
        p2: "Un paseo por las calles de la ciudad, una pausa delante de algo rico, una conversación que se alarga más de lo previsto.",
        p3: "A veces no hace falta un plan.<br>Solo encontrar el lugar adecuado.",
        button: "Cómo llegar"
      },

      esperienza: {
        kicker: "EXPERIENCIA",
        title: "Ven<br><em>como eres.</em>",
        p1: "Solo, acompañado, para un desayuno rápido o para disfrutar de un brunch sin prisa.",
        p2: "Para algo ligero.<br>Para algo especial.<br>Para probar un sabor nuevo.<br>O simplemente porque hoy te apetecía salir.",
        highlight: "Siempre hay un buen motivo para pasar por Génesis."
      },

      instagram: {
        kicker: "Instagram",
        follow: "Seguir en Instagram"
      },

      cta: {
        kicker: "GÉNESIS",
        title: "¿Nos vemos<br><em>en la mesa?</em>",
        address: "Calle San Agustín, 11<br>La Laguna · Tenerife",
        menu: "Ver la carta",
        maps: "Cómo llegar"
      },

      visit: {
        kicker: "CONTACTO",
        title: "Nos encuentras<br><em>aquí.</em>",
        maps: "Abrir en Google Maps",
        hours: "Horarios",
        weekday: "Lunes — Viernes",
        weekend: "Sábado — Domingo",
        note: "Horarios por confirmar con el restaurante."
      },

      footer: {
        tagline: "Comida, brunch y buenos momentos en La Laguna.",
        visit: "Visítanos",
        social: "Social"
      }

    },


    /* =====================================================
       ENGLISH
       ===================================================== */

    en: {

      nav: {
        menu: "Menu",
        story: "Génesis",
        instagram: "Instagram",
        visit: "Visit us",
        cta: "View menu"
      },

      hero: {
        eyebrow: "GÉNESIS",
        line1: "A place to come for the food.",
        line2: "And stay for the feeling.",
        text: "Brunch, breakfast, dishes to share and flavours from around the world, in the heart of La Laguna.",
        primary: "Discover Génesis",
        secondary: "View the menu"
      },

      intro: {
        kicker: "GÉNESIS",
        title: "There is no single way to eat here.",
        p1: "Some come for a coffee, some for a slow brunch, some choose something fresh, some crave pancakes and some want to share a dish.",
        p2: "Génesis was born from exactly that: bringing together different flavours, people and moments in a place that is easy to enjoy and hard to forget."
      },

      atmosfera: {
        kicker: "ATMOSPHERE",
        title: "Feeling good is part of the menu.",
        p1: "A welcoming atmosphere, thoughtful details, music, colours and that feeling of being able to slow down for a while.",
        p2: "Génesis is a little corner in the centre of La Laguna where you can eat, chat, meet and enjoy a moment without rushing.",
        highlight: "Like home. But with something delicious in front of you."
      },

      cucina: {
        kicker: "KITCHEN",
        title: "A little from here.<br>A little from there.<br><em>All Génesis.</em>",
        p1: "Our kitchen does not like to fit into just one definition.",
        p2: "Pancakes and tostadas.<br>Eggs, bowls and smoothies.<br>Tapas, hummus and falafel.<br>Poke, tacos and burritos.<br>Fresh dishes, vegetarian choices and vegan options.",
        highlight: "Different flavours, one table.",
        button: "Discover our kitchen"
      },

      brunch: {
        kicker: "BRUNCH",
        title: "Brunch, when you feel like something more.",
        p1: "Sweet or savoury?<br>Light or generous?<br>To share or all for yourself?",
        p2: "At Génesis, you do not have to choose just one way to start the day.",
        p3: "Pancakes, fruit, yoghurt, eggs, toast, salmon, smoothies and plenty of combinations to discover.",
        highlight: "Take your time."
      },

      menu: {
        kicker: "DISHES",
        title: "Some things are better told<br>with a <em>fork.</em>",
        button: "View the menu",

        dish1: {
          meta: "SWEET · BRUNCH",
          title: "Pancakes",
          text: "Soft, colourful and made to be eaten with your eyes first."
        },

        dish2: {
          meta: "TOSTADAS",
          title: "Tostadas",
          text: "Simple only at first glance."
        },

        dish3: {
          meta: "BOWLS",
          title: "Bowls",
          text: "Fresh, colourful and full of good things."
        },

        dish4: {
          meta: "TO SHARE",
          title: "To share",
          text: "Because sometimes the best dish is the one that arrives in the middle of the table."
        },

        dish5: {
          meta: "FROM AROUND THE WORLD",
          title: "Flavours from around the world",
          text: "Ideas, ingredients and influences that travel."
        }
      },

      dettagli: {
        kicker: "DETAILS",
        title: "First you see it.<br>Then you taste it.<br><em>And finally you understand why you want to come back.</em>",
        p1: "At Génesis, even the details have their place.",
        p2: "The presentation of the dishes, the atmosphere, the way you are welcomed and good music in the background.",
        p3: "Because eating out is not only about choosing what to order."
      },

      laguna: {
        kicker: "LA LAGUNA",
        title: "In the heart of<br><em>La Laguna.</em>",
        p1: "Génesis is located on Calle San Agustín, in the historic centre of San Cristóbal de La Laguna.",
        p2: "A walk through the city streets, a pause over something delicious, a conversation that lasts longer than expected.",
        p3: "Sometimes you do not need a plan.<br>You just need the right place.",
        button: "Get directions"
      },

      esperienza: {
        kicker: "EXPERIENCE",
        title: "Come<br><em>as you are.</em>",
        p1: "Alone, with friends, for a quick breakfast or a brunch to enjoy slowly.",
        p2: "For something light.<br>For something indulgent.<br>To try a new flavour.<br>Or simply because you felt like going out today.",
        highlight: "There is always a good reason to stop by Génesis."
      },

      instagram: {
        kicker: "Instagram",
        follow: "Follow us on Instagram"
      },

      cta: {
        kicker: "GÉNESIS",
        title: "See you<br><em>at the table?</em>",
        address: "Calle San Agustín, 11<br>La Laguna · Tenerife",
        menu: "View the menu",
        maps: "Get directions"
      },

      visit: {
        kicker: "CONTACT",
        title: "Find us<br><em>here.</em>",
        maps: "Open in Google Maps",
        hours: "Opening hours",
        weekday: "Monday — Friday",
        weekend: "Saturday — Sunday",
        note: "Opening hours to be confirmed with the restaurant."
      },

      footer: {
        tagline: "Food, brunch and good moments in La Laguna.",
        visit: "Visit us",
        social: "Social"
      }

    }

  };


  /* =======================================================
     TRANSLATION HELPER
     ======================================================= */

  const getTranslation = (language, path) => {

    const parts = path.split(".");
    let value = translations[language];

    for (const part of parts) {

      if (
        !value ||
        typeof value !== "object" ||
        !(part in value)
      ) {
        return null;
      }

      value = value[part];
    }

    return typeof value === "string" ? value : null;
  };


  /* =======================================================
     APPLY TRANSLATION
     ======================================================= */

  const setText = (selector, value, html = false) => {

    const element = document.querySelector(selector);

    if (!element || value === null) {
      return;
    }

    if (html) {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  };


  const setLanguage = (language) => {

    if (!translations[language]) {
      language = "it";
    }

    document.documentElement.lang = language;


    /* -----------------------------------------------------
       DATA-I18N
       ----------------------------------------------------- */

    document.querySelectorAll("[data-i18n]").forEach((element) => {

      const key = element.dataset.i18n;
      const translated = getTranslation(language, key);

      if (translated === null) {
        return;
      }

      element.textContent = translated;

    });


    /* -----------------------------------------------------
       HEADER
       ----------------------------------------------------- */

    setText(
      ".desktop-nav a[href='#menu']",
      translations[language].nav.menu
    );

    setText(
      ".desktop-nav a[href='#story']",
      translations[language].nav.story
    );

    setText(
      ".desktop-nav a[href='#instagram']",
      translations[language].nav.instagram
    );

    setText(
      ".desktop-nav a[href='#visit']",
      translations[language].nav.visit
    );

    setText(
      ".header-cta",
      translations[language].nav.cta
    );


    /* -----------------------------------------------------
       MOBILE NAV
       ----------------------------------------------------- */

    setText(
      ".mobile-nav a[href='#menu']",
      translations[language].nav.menu
    );

    setText(
      ".mobile-nav a[href='#story']",
      translations[language].nav.story
    );

    setText(
      ".mobile-nav a[href='#instagram']",
      translations[language].nav.instagram
    );

    setText(
      ".mobile-nav a[href='#visit']",
      translations[language].nav.visit
    );


    /* -----------------------------------------------------
       HERO
       ----------------------------------------------------- */

    setText(
      ".hero-copy .eyebrow",
      translations[language].hero.eyebrow
    );

    setText(
      ".hero-copy h1 span",
      translations[language].hero.line1
    );

    setText(
      ".hero-copy h1 em",
      translations[language].hero.line2
    );

    setText(
      ".hero-text",
      translations[language].hero.text
    );

    setText(
      ".hero-actions .button",
      translations[language].hero.primary
    );

    const heroSecondary = document.querySelector(
      ".hero-actions .text-link"
    );

    if (heroSecondary) {
      heroSecondary.childNodes[0].textContent =
        translations[language].hero.secondary + " ";
    }


    /* -----------------------------------------------------
       INTRO
       ----------------------------------------------------- */

    setText(
      ".intro-section .section-kicker",
      translations[language].intro.kicker
    );

    setText(
      "#intro-title",
      translations[language].intro.title
    );

    setText(
      ".intro-section p:nth-of-type(1)",
      translations[language].intro.p1
    );

    setText(
      ".intro-section p:nth-of-type(2)",
      translations[language].intro.p2
    );


    /* -----------------------------------------------------
       ATMOSFERA
       ----------------------------------------------------- */

    setText(
      ".atmosfera-copy .section-kicker",
      translations[language].atmosfera.kicker
    );

    setText(
      "#atmosfera-title",
      translations[language].atmosfera.title
    );

    setText(
      ".atmosfera-copy p:nth-of-type(1)",
      translations[language].atmosfera.p1
    );

    setText(
      ".atmosfera-copy p:nth-of-type(2)",
      translations[language].atmosfera.p2
    );

    setText(
      ".atmosfera-highlight",
      translations[language].atmosfera.highlight
    );


    /* -----------------------------------------------------
       CUCINA
       ----------------------------------------------------- */

    setText(
      ".cucina-heading .section-kicker",
      translations[language].cucina.kicker
    );

    setText(
      "#cucina-title",
      translations[language].cucina.title,
      true
    );

    setText(
      ".cucina-content p:nth-of-type(1)",
      translations[language].cucina.p1
    );

    setText(
      ".cucina-content p:nth-of-type(2)",
      translations[language].cucina.p2,
      true
    );

    setText(
      ".cucina-highlight",
      translations[language].cucina.highlight
    );

    setText(
      ".cucina-content .button",
      translations[language].cucina.button
    );


    /* -----------------------------------------------------
       BRUNCH
       ----------------------------------------------------- */

    setText(
      ".brunch-copy .section-kicker",
      translations[language].brunch.kicker
    );

    setText(
      "#brunch-title",
      translations[language].brunch.title
    );

    setText(
      ".brunch-copy p:nth-of-type(1)",
      translations[language].brunch.p1,
      true
    );

    setText(
      ".brunch-copy p:nth-of-type(2)",
      translations[language].brunch.p2
    );

    setText(
      ".brunch-copy p:nth-of-type(3)",
      translations[language].brunch.p3
    );

    setText(
      ".brunch-highlight",
      translations[language].brunch.highlight
    );


    /* -----------------------------------------------------
       MENU / PIATTI
       ----------------------------------------------------- */

    setText(
      ".menu-heading .section-kicker",
      translations[language].menu.kicker
    );

    setText(
      "#menu-title",
      translations[language].menu.title,
      true
    );

    const dishes = document.querySelectorAll(".dish-card");

    const dishKeys = [
      "dish1",
      "dish2",
      "dish3",
      "dish4",
      "dish5"
    ];

    dishes.forEach((dish, index) => {

      const key = dishKeys[index];

      if (!key || !translations[language].menu[key]) {
        return;
      }

      const data = translations[language].menu[key];

      setText(
        `.dish-card:nth-child(${index + 1}) .dish-meta span`,
        data.meta
      );

      setText(
        `.dish-card:nth-child(${index + 1}) h3`,
        data.title
      );

      setText(
        `.dish-card:nth-child(${index + 1}) p`,
        data.text
      );

    });

    setText(
      ".menu-section .center .button",
      translations[language].menu.button
    );


    /* -----------------------------------------------------
       DETTAGLI
       ----------------------------------------------------- */

    setText(
      ".dettagli-copy .section-kicker",
      translations[language].dettagli.kicker
    );

    setText(
      "#dettagli-title",
      translations[language].dettagli.title,
      true
    );

    setText(
      ".dettagli-copy p:nth-of-type(1)",
      translations[language].dettagli.p1
    );

    setText(
      ".dettagli-copy p:nth-of-type(2)",
      translations[language].dettagli.p2
    );

    setText(
      ".dettagli-copy p:nth-of-type(3)",
      translations[language].dettagli.p3
    );


    /* -----------------------------------------------------
       LA LAGUNA
       ----------------------------------------------------- */

    setText(
      ".laguna-copy .section-kicker",
      translations[language].laguna.kicker
    );

    setText(
      "#laguna-title",
      translations[language].laguna.title,
      true
    );

    setText(
      ".laguna-copy p:nth-of-type(1)",
      translations[language].laguna.p1
    );

    setText(
      ".laguna-copy p:nth-of-type(2)",
      translations[language].laguna.p2
    );

    setText(
      ".laguna-copy p:nth-of-type(3)",
      translations[language].laguna.p3,
      true
    );

    setText(
      ".laguna-copy .button",
      translations[language].laguna.button
    );


    /* -----------------------------------------------------
       ESPERIENZA
       ----------------------------------------------------- */

    setText(
      ".esperienza-heading .section-kicker",
      translations[language].esperienza.kicker
    );

    setText(
      "#esperienza-title",
      translations[language].esperienza.title,
      true
    );

    setText(
      ".esperienza-content p:nth-of-type(1)",
      translations[language].esperienza.p1
    );

    setText(
      ".esperienza-content p:nth-of-type(2)",
      translations[language].esperienza.p2,
      true
    );

    setText(
      ".esperienza-highlight",
      translations[language].esperienza.highlight
    );


    /* -----------------------------------------------------
       INSTAGRAM
       ----------------------------------------------------- */

    setText(
      ".social-head .section-kicker",
      translations[language].instagram.kicker
    );

    setText(
      ".social-head .arrow-link span",
      translations[language].instagram.follow
    );


    /* -----------------------------------------------------
       CTA FINALE
       ----------------------------------------------------- */

    setText(
      "#cta-final .section-kicker",
      translations[language].cta.kicker
    );

    setText(
      "#cta-final-title",
      translations[language].cta.title,
      true
    );

    setText(
      "#cta-final .cta-final-address",
      translations[language].cta.address,
      true
    );

    setText(
      ".cta-final-actions .button",
      translations[language].cta.menu
    );

    const ctaTextLink = document.querySelector(
      ".cta-final-actions .text-link"
    );

    if (ctaTextLink) {
      ctaTextLink.childNodes[0].textContent =
        translations[language].cta.maps + " ";
    }

/* -----------------------------------------------------
   VISIT
   ----------------------------------------------------- */

setText(
  ".visit-left .section-kicker",
  translations[language].visit.kicker
);

setText(
  "#visit-title",
  translations[language].visit.title,
  true
);

setText(
  ".visit-left .button",
  translations[language].visit.maps
);

setText(
  ".hours .section-kicker",
  translations[language].visit.hours
);

setText(
  ".hours .hours-row:nth-child(2) span",
  translations[language].visit.weekday
);

setText(
  ".hours .hours-row:nth-child(3) span",
  translations[language].visit.weekend
);

setText(
  ".small-note",
  translations[language].visit.note
);

    /* -----------------------------------------------------
       FOOTER
       ----------------------------------------------------- */

    setText(
      ".footer-brand > span",
      translations[language].footer.tagline
    );

    setText(
      ".footer-contact .footer-label",
      translations[language].footer.visit
    );

    setText(
      ".footer-social .footer-label",
      translations[language].footer.social
    );


    /* -----------------------------------------------------
       LANGUAGE BUTTONS
       ----------------------------------------------------- */

    document.querySelectorAll(".lang").forEach((button) => {

      const active = button.dataset.lang === language;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));

    });


    /* -----------------------------------------------------
       SAVE LANGUAGE
       ----------------------------------------------------- */

    try {
      localStorage.setItem("genesis-language", language);
    } catch (error) {
      /* Nessun problema se localStorage non è disponibile */
    }

  };


  /* =======================================================
     LANGUAGE BUTTONS
     ======================================================= */

  document.querySelectorAll(".lang").forEach((button) => {

    button.addEventListener("click", (event) => {

      event.preventDefault();

      const language = button.dataset.lang;

      if (language) {
        setLanguage(language);
      }

    });

  });


  /* =======================================================
     INITIAL LANGUAGE
     ======================================================= */

  let initialLanguage = "it";

  try {

    const savedLanguage =
      localStorage.getItem("genesis-language");

    if (
      savedLanguage &&
      Object.prototype.hasOwnProperty.call(
        translations,
        savedLanguage
      )
    ) {
      initialLanguage = savedLanguage;
    }

  } catch (error) {
    initialLanguage = "it";
  }

  setLanguage(initialLanguage);


  /* =======================================================
     HERO PHOTO ANIMATION
     ======================================================= */

  const heroTiles =
    document.querySelectorAll(".hero-tile");

  heroTiles.forEach((tile, index) => {

    const image = tile.querySelector("img");

    if (!image) return;

    image.style.animationDelay =
      `${-(index * 0.55)}s`;

  });


  /* =======================================================
     ROTATING PLATE
     Il CSS dell'animazione è in style.css.
     ======================================================= */

  const rotatingElements = document.querySelectorAll(
    ".rotating-plate, .plate-rotating, .dish-rotating, .hero-plate"
  );

  rotatingElements.forEach((element) => {
    element.classList.add("is-rotating");
  });


  /* =======================================================
     REVEAL ON SCROLL
     ======================================================= */

  const revealElements = document.querySelectorAll(
    ".section, .dish-card, .laguna-map, .footer-main"
  );

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observerInstance.unobserve(entry.target);

        });

      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );


    revealElements.forEach((element) => {

      element.classList.add("reveal");
      observer.observe(element);

    });

  } else {

    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

  }


  /* =======================================================
     IMAGE ERROR HANDLING
     ======================================================= */

  document.querySelectorAll("img").forEach((image) => {

    image.addEventListener("error", () => {

      image.classList.add("image-error");

      if (image.parentElement) {
        image.parentElement.classList.add("image-missing");
      }

    });

  });


  /* =======================================================
     INSTAGRAM
     ======================================================= */

  const instagramFeed =
    document.getElementById("instagram-feed");


  const renderInstagram = (items) => {

    if (
      !instagramFeed ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return;
    }


    instagramFeed.innerHTML = "";


    items.slice(0, 6).forEach((item) => {

      const link = document.createElement("a");

      link.href =
        item.permalink ||
        item.url ||
        "https://www.instagram.com/genesis.lalaguna/";

      link.target = "_blank";
      link.rel = "noopener noreferrer";


      const image = document.createElement("img");

      image.src =
        item.thumbnail_url ||
        item.media_url ||
        item.image ||
        "";

      image.alt =
        item.caption ||
        "Génesis Restaurante en Instagram";

      image.loading = "lazy";


      link.appendChild(image);
      instagramFeed.appendChild(link);

    });

  };


  const loadInstagram = async () => {

    if (!instagramFeed) {
      return;
    }


    try {

      const response = await fetch(
        "/api/instagram",
        {
          headers: {
            Accept: "application/json"
          }
        }
      );


      if (!response.ok) {
        throw new Error(
          "Instagram request failed"
        );
      }


      const data = await response.json();


      const items =
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];


      renderInstagram(items);

    } catch (error) {

      /* Mantiene il placeholder */

    }

  };


  loadInstagram();


  /* =======================================================
     INTERNAL LINKS
     ======================================================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener("click", (event) => {

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(targetId);


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


        if (
          mobileNav &&
          mobileNav.classList.contains("is-open")
        ) {
          closeMobileMenu();
        }

      });

    });


  /* =======================================================
     HEADER ON SCROLL
     ======================================================= */

  const header =
    document.querySelector(".site-header");


  if (header) {

    const updateHeader = () => {

      header.classList.toggle(
        "is-scrolled",
        window.scrollY > 30
      );

    };


    updateHeader();


    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );

  }

});