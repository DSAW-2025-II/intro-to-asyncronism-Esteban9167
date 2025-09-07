// =========================
// 0) Referencias y helpers
// =========================
const listPokemon  = document.querySelector("#listPokemon");
const BASE_URL     = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL  = "https://pokeapi.co/api/v2/pokemon-species/";

// Referencias dentro de la main-card (usando tu HTML base)
const mainCard     = document.querySelector(".main-card");
const idPokeEl     = mainCard.querySelector(".number .idPoke");
const nameEl       = mainCard.querySelector(".pokemon-name");              // el del panel derecho
const regionEl     = mainCard.querySelector(".basic-pokemon .region");
const nameJaEl     = mainCard.querySelector(".basic-pokemon .pokemon-name-ja");
const imgEl        = mainCard.querySelector(".basic-pokemon .pokemon-img img");
const typesWrapEl  = mainCard.querySelector(".type");                      // contenedor de tipos (íconos)
const statsWrapEl  = mainCard.querySelector(".all-stats");                 // contenedor de stats
const [prevBtn, nextBtn] = mainCard.querySelectorAll(".number .back");

let currentId = null; // Pokémon actualmente seleccionado

// Mapa nombre->id de tipo para los íconos oficiales (Gen IX / SV)
const TYPE_ID = {
  normal:1, fighting:2, flying:3, poison:4, ground:5, rock:6, bug:7, ghost:8, steel:9,
  fire:10, water:11, grass:12, electric:13, psychic:14, ice:15, dragon:16, dark:17, fairy:18
};

// Mapa generation -> región mostrable
const GEN_REGION = {
  "generation-i":"Kanto",
  "generation-ii":"Johto",
  "generation-iii":"Hoenn",
  "generation-iv":"Sinnoh",
  "generation-v":"Unova",
  "generation-vi":"Kalos",
  "generation-vii":"Alola",
  "generation-viii":"Galar",
  "generation-ix":"Paldea"
};

// Helper: #0001
const padId = (n) => `#${String(n).padStart(4, "0")}`;

// Helper: URL imagen oficial de artwork
const officialArt = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Helper: URL ícono de tipo (redondo)
const typeIcon = (typeName) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${TYPE_ID[typeName]}.png`;


// =====================================
// 1) Construir una card para la grilla
// =====================================
function showPokemon(p) {
  const id     = p.id;
  const name   = p.name;
  const imgURL = p.sprites?.other?.["official-artwork"]?.front_default || officialArt(id);
  const types  = p.types.map(t => t.type.name);
  const heightM = (p.height / 10).toFixed(1) + " M"; // decímetros → metros
  const weightKg = (p.weight / 10).toFixed(1) + " Kg"; // hectogramos → kg

  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <button class="card-btn" type="button">
      <p class="pokemon-id-back">${padId(id)}</p>
      <div class="pokemon-img">
        <img src="${imgURL}" alt="${name}">
      </div>
      <div class="pokemon-info">
        <div class="name-container">
          <p class="pokemon-id">${padId(id)}</p>
          <h2 class="pokemon-name">${name}</h2>
        </div>
        <div class="type-pokemon">
          ${types.map(t => `<p class="type-badge type-${t}">${t}</p>`).join("")}
        </div>
        <div class="pokemon-stats">
          <p class="stats">${heightM}</p>
          <p class="stats">${weightKg}</p>
        </div>
      </div>
    </button>
  `;

  // Click en card -> seleccionar en main-card
  div.querySelector(".card-btn").addEventListener("click", () => {
    console.log("Pokémon ID:", id); // mantiene tu log de ID en consola
    selectPokemonById(id);
  });

  listPokemon.append(div);
}


// ===================================
// 2) Cargar muchos Pokémon (con filtro)
// ===================================
async function loadPokemons(from = 1, to = 151, filterType = null) {
  try {
    listPokemon.replaceChildren();

    const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const chunkSize = 20;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);

      const results = await Promise.all(
        chunk.map(id =>
          fetch(`${BASE_URL}${id}`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
        )
      );

      results.forEach(p => {
        if (!filterType) return showPokemon(p);
        const t = p.types.map(x => x.type.name);
        if (t.includes(filterType)) showPokemon(p);
      });
    }
  } catch (err) {
    console.error("Error cargando Pokémon:", err);
  }
}


// ===================================
// 3) Botones de filtro del header
// ===================================
const buttonsHeader = document.querySelectorAll(".nav .btn");
buttonsHeader.forEach((button) => {
  button.addEventListener("click", (event) => {
    const btnId = event.currentTarget.id; // "fire" | "see-all" | ...
    const filterType = (btnId === "see-all") ? null : btnId.toLowerCase();

    // Solo Kanto por ahora
    loadPokemons(1, 151, filterType);

    // Si quieres todo el dex:
    // loadPokemons(1, 1025, filterType);
  });
});


// ===================================
// 4) Rellenar la MAIN-CARD seleccionada
// ===================================
async function selectPokemonById(id) {
  try {
    // Datos base
    const p = await fetch(`${BASE_URL}${id}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    // Species (para nombre japonés / generación)
    const s = await fetch(`${SPECIES_URL}${id}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });

    currentId = id;

    // ID arriba
    idPokeEl.textContent = id; // si prefieres #0001 -> padId(id)

    // Nombre
    nameEl.textContent = p.name;

    // Nombre japonés: ja-Hrkt (kana) > ja > vacío
    const jaEntry = (s.names || []).find(n => n.language?.name === "ja-Hrkt")
                  || (s.names || []).find(n => n.language?.name === "ja");
    nameJaEl.textContent = jaEntry ? jaEntry.name : "";

    // Región por generación
    const genName = s.generation?.name || "";
    regionEl.textContent = GEN_REGION[genName] || "—";

    // Imagen oficial
    imgEl.src = p.sprites?.other?.["official-artwork"]?.front_default || officialArt(id);
    imgEl.alt = p.name;

    // Tipos (íconos redondos)
    typesWrapEl.replaceChildren();
    p.types.forEach(({ type }) => {
      const t = type.name;
      const wrap = document.createElement("p");
      wrap.className = "type-img";
      const img = document.createElement("img");
      img.src = typeIcon(t);
      img.alt = t;
      wrap.appendChild(img);
      typesWrapEl.appendChild(wrap);
    });

    // Stats (orden clásico)
    const ordered = ["hp","attack","defense","special-attack","special-defense","speed"];
    const mapLabel = {
      "hp": "HP",
      "attack": "Attack",
      "defense": "Defense",
      "special-attack": "Sp. Attack",
      "special-defense": "Sp. Defense",
      "speed": "Speed"
    };

    statsWrapEl.replaceChildren();
    ordered.forEach(key => {
      const found = p.stats.find(s => s.stat?.name === key);
      const value = found ? found.base_stat : "—";
      const item = document.createElement("div");
      item.className = "stats";
      item.innerHTML = `<p>${mapLabel[key]}: ${value}</p>`;
      statsWrapEl.appendChild(item);
    });

  } catch (e) {
    console.error("No se pudo seleccionar el Pokémon", e);
  }
}


// ===================================
// 5) Navegación prev/next en main-card
// ===================================
prevBtn?.addEventListener("click", () => {
  if (!currentId) return;
  const prev = Math.max(1, currentId - 1);
  selectPokemonById(prev);
});

nextBtn?.addEventListener("click", () => {
  if (!currentId) return;
  const next = currentId + 1; // si quieres límite superior: Math.min(currentId+1, 1025)
  selectPokemonById(next);
});


// ========================
// 6) Carga inicial (grid)
// ========================
loadPokemons(1, 151, null);

// (Opcional) Mostrar uno por defecto en main-card
selectPokemonById(1);
