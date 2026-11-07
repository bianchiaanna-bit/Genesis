/* Testi predefiniti (ES / EN / IT) e foto. L'admin può sovrascrivere ogni testo e ogni foto. */
window.GEN = window.GEN || {};
GEN.LOGO_LIGHT = "immagini/logo/logo-genesis.png";   // scritta bianca, per sfondi scuri
GEN.LOGO_DARK  = "immagini/logo/logo_black.png";     // scritta nera, per sfondi chiari
GEN.PH = "immagini/fotos/";

/* slot foto → file predefinito (puoi sostituire i file nella cartella o cambiarli dall'admin) */
GEN.SLOTS = {
  h1:["DSC00795.jpg","Hero 1"],h2:["DSC00796.jpg","Hero 2"],h3:["DSC00797.jpg","Hero 3"],h4:["DSC00835.jpg","Hero 4"],
  h5:["DSC00861.jpg","Hero 5"],h6:["DSC00873.jpg","Hero 6"],h7:["DSC00865.jpg","Hero 7"],h8:["DSC00871.jpg","Hero 8"],
  h9:["DSC00919.jpg","Hero 9"],h10:["VERTICAL.jpg","Hero 10"],h11:["DSC00914.jpg","Hero 11"],h12:["DSC00917.jpg","Hero 12"],
  hs:["DSC00917.jpg","Hero foto singola"],
  atm:["DSC00727.jpg","Atmósfera"],cuc:["DSC00779.jpg","Cocina"],bru:["DSC00793.jpg","Brunch"],
  g1:["DSC00833.jpg","Galería 1"],g2:["DSC00869.jpg","Galería 2"],g3:["DSC00867.jpg","Galería 3"],
  g4:["DSC00836.jpg","Galería 4"],g5:["DSC00865.jpg","Galería 5"],g6:["DSC00866.jpg","Galería 6"],
  det:["DSC00916.jpg","Detalles"],lag:["DSC00733.jpg","La Laguna"],esp:["DSC00920.jpg","Experiencia"],
  cta:["DSC00828.jpg","Invitación final"],gen_hero:["DSC00727.jpg","Génesis · portada"],
  frase:["DSC00920.jpg","Génesis · frase"],visit:["DSC00733.jpg","Visítanos · foto"]
};
GEN.MARQUEE = ["DSC00833","DSC00869","DSC00867","DSC00836","DSC00865","DSC00866","DSC00871","DSC00861","DSC00873"];
GEN.LANGS = ["es","en","it"];

const t=(es,en,it)=>[es,en,it];
GEN.T = {
 /* navegación */
 "nav.menu":t("Carta","Menu","Carta"),
 "nav.story":t("Génesis","Génesis","Génesis"),
 "nav.news":t("Novedades","News","Novità"),
 "nav.gallery":t("Galería","Gallery","Galleria"),
 "nav.visit":t("Visítanos","Visit us","Dove siamo"),
 "nav.cta":t("Ver carta","View menu","Vedi la carta"),
 "skip":t("Saltar al contenido","Skip to content","Vai al contenuto"),
 /* home (textos originales) */
 "hero.t":t("Génesis","Génesis","Génesis"),
 "hero.p":t("Cocina, brunch y buenos momentos en el corazón de La Laguna.","Food, brunch and good moments in the heart of La Laguna.","Cucina, brunch e bei momenti nel cuore di La Laguna."),
 "hero.b":t("Ver la carta","View the menu","Vedi la carta"),
 "intro.k":t("Bienvenido","Welcome","Benvenuto"),
 "intro.t":t("Empezar de cero, con el corazón.","Starting from zero, with heart.","Partire da zero, con il cuore."),
 "intro.p":t("Génesis es un lugar para sentarse sin prisa, compartir una mesa y descubrir sabores hechos con dedicación y cariño.","Génesis is a place to sit without rush, share a table and discover flavours made with care.","Génesis è un luogo dove sedersi senza fretta, condividere un tavolo e scoprire sapori fatti con cura."),
 "atm.k":t("Atmósfera","Atmosphere","Atmosfera"),
 "atm.t":t("Luz, plantas y madera.","Light, plants and wood.","Luce, piante e legno."),
 "atm.p":t("Un rincón luminoso donde la piedra, la madera clara y el verde crean un ambiente cálido y sereno.","A bright corner where stone, light wood and greenery create a warm, calm setting.","Un angolo luminoso dove pietra, legno chiaro e verde creano un ambiente caldo e sereno."),
 "cuc.k":t("Cocina","Kitchen","Cucina"),
 "cuc.t":t("Platos honestos, mucho sabor.","Honest dishes, full of flavour.","Piatti onesti, tanto sapore."),
 "cuc.p":t("Producto fresco, recetas cuidadas y presentaciones que invitan a compartir.","Fresh produce, careful recipes and dishes made to share.","Prodotti freschi, ricette curate e piatti da condividere."),
 "bru.k":t("Brunch","Brunch","Brunch"),
 "bru.t":t("El brunch de La Laguna.","La Laguna’s brunch.","Il brunch di La Laguna."),
 "bru.p":t("Tostas, bowls, pancakes y zumos naturales para empezar el día con calma.","Toasts, bowls, pancakes and fresh juices to start the day slowly.","Toast, bowl, pancake e spremute fresche per iniziare la giornata con calma."),
 "gal.k":t("De la cocina","From the kitchen","Dalla cucina"),
 "gal.t":t("Algunas cosas se cuentan mejor con un tenedor.","Some things are better told with a fork.","Alcune cose si raccontano meglio con una forchetta."),
 "det.k":t("Detalles","Details","Dettagli"),
 "det.t":t("Cuidamos cada detalle.","We care about every detail.","Curiamo ogni dettaglio."),
 "det.p":t("Del plato a la mesa, del café al último gesto: todo está pensado para que te sientas a gusto.","From plate to table, from coffee to the last gesture: everything is made for you to feel at ease.","Dal piatto al tavolo, dal caffè all’ultimo gesto: tutto è pensato per farti sentire a tuo agio."),
 "lag.k":t("La Laguna","La Laguna","La Laguna"),
 "lag.t":t("En el casco histórico.","In the historic centre.","Nel centro storico."),
 "lag.p":t("Calle San Agustín, entre fachadas de colores y balcones de madera: un paseo que ya es parte de la visita.","Calle San Agustín, among coloured façades and wooden balconies: a stroll that is part of the visit.","Calle San Agustín, tra facciate colorate e balconi in legno: una passeggiata che fa già parte della visita."),
 "esp.k":t("Esto es Génesis","This is Génesis","Questa è Génesis"),
 "esp.t":t("Hecho con amor, construido con pasión.","Made with love, built with passion.","Fatto con amore, costruito con passione."),
 "esp.p":t("Todo en la vida se puede lograr partiendo de cero, con sacrificio, voluntad y dedicación.","Anything can be achieved starting from zero, with sacrifice, will and dedication.","Tutto si può realizzare partendo da zero, con sacrificio, volontà e dedizione."),
 "cta.t":t("Te esperamos.","See you soon.","Ti aspettiamo."),
 "cta.p":t("Ven a conocernos o consulta la carta desde tu móvil.","Come and meet us or browse the menu on your phone.","Vieni a trovarci o consulta la carta dal telefono."),
 "cta.b":t("Ver la carta","View the menu","Vedi la carta"),
 /* orario */
 "hrs.k":t("Horario","Opening hours","Orari"),
 "hrs.t":t("Cuándo encontrarnos.","When to find us.","Quando trovarci."),
 "hrs.open":t("Abierto ahora","Open now","Aperto ora"),
 "hrs.closed":t("Cerrado ahora","Closed now","Chiuso ora"),
 "hrs.closedday":t("Cerrado","Closed","Chiuso"),
 "hrs.tbd":t("Horario por confirmar. Síguenos en Instagram para estar al día.","Opening hours to be confirmed. Follow us on Instagram for updates.","Orari da confermare. Seguici su Instagram per restare aggiornato."),
 "day.0":t("Lunes","Monday","Lunedì"),"day.1":t("Martes","Tuesday","Martedì"),"day.2":t("Miércoles","Wednesday","Mercoledì"),
 "day.3":t("Jueves","Thursday","Giovedì"),"day.4":t("Viernes","Friday","Venerdì"),"day.5":t("Sábado","Saturday","Sabato"),"day.6":t("Domingo","Sunday","Domenica"),
 /* novedades */
 "news.k":t("Novedades","News","Novità"),
 "news.t":t("Lo que pasa en Génesis.","What’s happening at Génesis.","Cosa succede a Génesis."),
 "news.all":t("Ver todas las novedades","See all news","Vedi tutte le novità"),
 "news.empty":t("Pronto compartiremos novedades, invitaciones y platos nuevos.","Soon we’ll share news, invitations and new dishes.","Presto condivideremo novità, inviti e nuovi piatti."),
 "news.page.t":t("Novedades","News","Novità"),
 "news.page.p":t("Pasos por la cocina, invitaciones y platos nuevos.","Behind the scenes, invitations and new dishes.","Dal dietro le quinte, inviti e nuovi piatti."),
 "tag.post":t("Novedad","News","Novità"),"tag.invite":t("Invitación","Invitation","Invito"),"tag.dish":t("Plato nuevo","New dish","Nuovo piatto"),"tag.event":t("Evento","Event","Evento"),
 "news.back":t("Volver a novedades","Back to news","Torna alle novità"),
 "pop.close":t("Cerrar","Close","Chiudi"),
 /* pagina Génesis */
 "gen.hero.k":t("Génesis · La Laguna","Génesis · La Laguna","Génesis · La Laguna"),
 "gen.hero.t":t("Esto es Génesis.","This is Génesis.","Questa è Génesis."),
 "gen.hero.p":t("Un proyecto que nace de atreverse a empezar, de trabajar con dedicación y de poner el corazón en lo que uno hace.","A project born from daring to begin, working with dedication and putting heart into what you do.","Un progetto che nasce dal coraggio di cominciare, dal lavoro dedicato e dal mettere il cuore in ciò che si fa."),
 "gen.s1.k":t("La historia de Génesis","The story of Génesis","La storia di Génesis"),
 "gen.s1.t":t("Hay lugares que te encuentran.","Some places find you.","Ci sono luoghi che ti trovano."),
 "gen.s1.sub":t("Y otros en los que sabes, desde el primer momento, que quieres quedarte.","And others where you know, from the first moment, that you want to stay.","E altri in cui capisci, fin dal primo momento, che vuoi restare."),
 "gen.p1":t("Cada lugar tiene una historia detrás. La de Génesis nace de la decisión de empezar desde cero y dar forma a una idea propia, con voluntad, esfuerzo y muchas ganas de hacer las cosas bien.","Every place has a story behind it. Génesis was born from the decision to start from scratch and shape an idea of our own, with will, effort and a real wish to do things well.","Ogni luogo ha una storia alle spalle. Quella di Génesis nasce dalla decisione di ripartire da zero e dare forma a un’idea propria, con volontà, impegno e tanta voglia di fare le cose bene."),
 "gen.p2":t("Detrás de este lugar está Ciro y una historia personal que continúa escribiéndose cada día. El camino, las experiencias y el encuentro con Tenerife forman parte del origen de un proyecto hecho con dedicación y pasión.","Behind this place is Ciro and a personal story that is still being written every day. The journey, the experiences and the meeting with Tenerife are part of the origin of a project made with dedication and passion.","Dietro questo posto c’è Ciro e una storia personale che continua a scriversi ogni giorno. Il cammino, le esperienze e l’incontro con Tenerife fanno parte dell’origine di un progetto fatto con dedizione e passione."),
 "gen.p3":t("Hoy, Génesis es un espacio para encontrarse alrededor de una mesa, descubrir sabores, compartir un momento y sentirse a gusto. Un lugar que se construye también gracias a las personas que entran por su puerta.","Today, Génesis is a space to gather around a table, discover flavours, share a moment and feel at ease. A place that is also built by the people who walk through its door.","Oggi Génesis è uno spazio per ritrovarsi intorno a un tavolo, scoprire sapori, condividere un momento e sentirsi a proprio agio. Un luogo che si costruisce anche grazie alle persone che varcano la sua porta."),
 "gen.q":t("“Todo en la vida se puede lograr partiendo de cero.”","“Anything in life can be achieved starting from zero.”","“Tutto nella vita si può ottenere partendo da zero.”"),
 "gen.q.p":t("Con sacrificio, voluntad y dedicación. Pero, sobre todo, cuando se hace con amor y pasión.","With sacrifice, will and dedication. But above all, when it is done with love and passion.","Con sacrificio, volontà e dedizione. Ma soprattutto quando lo si fa con amore e passione."),
 "gen.end.k":t("Una historia que sigue creciendo","A story that keeps growing","Una storia che continua a crescere"),
 "gen.end.t":t("Hecho con amor. Construido con pasión.","Made with love. Built with passion.","Fatto con amore. Costruito con passione."),
 "gen.end.p":t("Génesis también está en los pequeños detalles, en los platos que preparamos y en los momentos que compartimos. Nos gusta pensar que cada visita puede convertirse en un buen recuerdo.","Génesis is also in the small details, in the dishes we prepare and the moments we share. We like to think every visit can become a good memory.","Génesis è anche nei piccoli dettagli, nei piatti che prepariamo e nei momenti che condividiamo. Ci piace pensare che ogni visita possa diventare un bel ricordo."),
 "gen.end.b":t("Descubre nuestra carta","Discover our menu","Scopri la nostra carta"),
 /* cómo llegar */
 "vis.hero.k":t("Te esperamos","We’re waiting for you","Ti aspettiamo"),
 "vis.hero.t":t("Nos vemos en Génesis.","See you at Génesis.","Ci vediamo a Génesis."),
 "vis.hero.p":t("Estamos en el corazón de La Laguna. Será un placer recibirte.","We’re in the heart of La Laguna. It will be a pleasure to welcome you.","Siamo nel cuore di La Laguna. Sarà un piacere accoglierti."),
 "vis.k":t("Dónde encontrarnos","Where to find us","Dove trovarci"),
 "vis.t":t("Un lugar para encontrarse.","A place to meet.","Un luogo dove ritrovarsi."),
 "vis.maps":t("Abrir Google Maps","Open Google Maps","Apri Google Maps"),
 "vis.end.k":t("Antes de venir","Before you come","Prima di venire"),
 "vis.end.t":t("Tu próxima visita empieza aquí.","Your next visit starts here.","La tua prossima visita inizia qui."),
 "vis.end.p":t("Consulta nuestra propuesta gastronómica y encuentra algo que te apetezca compartir.","Browse our menu and find something you’d like to share.","Consulta la nostra proposta e trova qualcosa da condividere."),
 "vis.end.b":t("Ver la carta","View the menu","Vedi la carta"),
 /* menu */
 "menu.k":t("Génesis · La Laguna","Génesis · La Laguna","Génesis · La Laguna"),
 "menu.t":t("La carta","The menu","La carta"),
 "menu.p":t("Cosas ricas para compartir, descubrir y quedarse un rato más.","Good things to share, discover and linger over.","Cose buone da condividere, scoprire e gustare con calma."),
 "menu.err":t("No hemos podido cargar la carta.","We couldn’t load the menu.","Non siamo riusciti a caricare la carta."),
 "menu.back":t("Volver a Génesis","Back to Génesis","Torna a Génesis"),
 "menu.special":t("Especial","Special","Speciale"),
 "menu.soldout":t("agotado","sold out","esaurito"),
 /* footer */
 "ft.tag":t("Comida, brunch y buenos momentos en La Laguna.","Food, brunch and good moments in La Laguna.","Cibo, brunch e bei momenti a La Laguna."),
 "ft.visit":t("Visítanos","Visit us","Dove siamo"),
 "ft.social":t("Social","Social","Social"),
 "ft.rating":t("★ 4,4/5 · 43 reseñas","★ 4.4/5 · 43 reviews","★ 4,4/5 · 43 recensioni"),
 "ft.priv":t("Privacidad","Privacy","Privacy"),"ft.cook":t("Cookies","Cookies","Cookie"),
 "ft.prefs":t("Preferencias de cookies","Cookie preferences","Preferenze cookie"),
 "ft.admin":t("Acceso del propietario","Owner access","Accesso proprietario"),
 "ft.top":t("Volver arriba","Back to top","Torna su"),
 "ck.t":t("Tu elección importa.","Your choice matters.","La tua scelta conta."),
 "ck.p":t("Utilizamos cookies necesarias para el funcionamiento del sitio. Con tu autorización, también podremos utilizar herramientas analíticas para mejorar tu experiencia.","We use cookies that are necessary for the site to work. With your permission we may also use analytics tools to improve your experience.","Utilizziamo i cookie necessari al funzionamento del sito. Con la tua autorizzazione potremo usare anche strumenti di analisi per migliorare la tua esperienza."),
 "ck.more":t("Más información","More information","Maggiori informazioni"),"ck.no":t("Rechazar","Reject","Rifiuta"),"ck.yes":t("Aceptar","Accept","Accetta"),
 "legal.priv":t("Privacidad","Privacy","Privacy"),"legal.cook":t("Política de cookies","Cookie policy","Cookie policy"),
 "legal.note":t("Este texto legal está redactado en español.","This legal text is written in Spanish.","Questo testo legale è redatto in spagnolo.")
};

/* ───── utilità condivise ───── */
GEN.lang = (()=>{let l="es";try{l=localStorage.getItem("genesis-language")||"es"}catch(e){}return GEN.LANGS.includes(l)?l:"es"})();
GEN.li = ()=>GEN.LANGS.indexOf(GEN.lang);
GEN.O = {texts:{},imgs:{},hero:{mode:"mosaic"},hours:null,popup:null,news:[]}; // sovrascritture dall'API
GEN.tx = k=>{const o=GEN.O.texts[k],d=GEN.T[k]||[];return ((o&&o[GEN.li()])||d[GEN.li()]||d[0]||"")};
GEN.img = s=>{const o=GEN.O.imgs[s];if(o)return /^(https?:|data:|blob:|immagini\/)/.test(o)||o.startsWith("/")?o:"/img/"+o;const d=GEN.SLOTS[s];return GEN.PH+(d?d[0]:s)};
GEN.pick = (o,base)=>o?(o[base+"_"+GEN.lang]||o[base+"_es"]||""):"";
GEN.esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
