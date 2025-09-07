// =========================
// 0) Referencias y helpers
// =========================
const listPokemon  = document.querySelector("#listPokemon");
const BASE_URL     = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL  = "https://pokeapi.co/api/v2/pokemon-species/";
const TOTAL_DEX = 1025; // total de la Pokédex nacional


// Referencias dentro de la main-card
const mainCard     = document.querySelector(".main-card");
const idPokeEl     = mainCard.querySelector(".number .idPoke");
const nameEl       = mainCard.querySelector(".pokemon-name");
const regionEl     = mainCard.querySelector(".basic-pokemon .region");
const nameJaEl     = mainCard.querySelector(".basic-pokemon .pokemon-name-ja");
const imgEl        = mainCard.querySelector(".basic-pokemon .pokemon-img img");
const typesWrapEl  = mainCard.querySelector(".type");
const statsWrapEl  = mainCard.querySelector(".all-stats");
const [prevBtn, nextBtn] = mainCard.querySelectorAll(".number .back");

let currentId = null;

// Mapa nombre->id de tipo para íconos oficiales
const TYPE_ID = {
  normal:1, fighting:2, flying:3, poison:4, ground:5, rock:6, bug:7, ghost:8, steel:9,
  fire:10, water:11, grass:12, electric:13, psychic:14, ice:15, dragon:16, dark:17, fairy:18
};

// Mapa generation -> región
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

// Helper: URL imagen oficial
const officialArt = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Helper: URL ícono de tipo
const typeIcon = (typeName) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${TYPE_ID[typeName]}.png`;


// =========================
// 0.1) Colores por especie
// =========================
const SPECIES_COLOR_HEX = {
  black:  "#2B2B2B",
  blue:   "#6FA3EF",
  brown:  "#8B5E3C",
  gray:   "#9AA0A6",
  green:  "#7AC74C",
  pink:   "#F4A7C5",
  purple: "#A78BFA",
  red:    "#F87171",
  white:  "#F5F5F5",
  yellow: "#F8D34A",
};

// utilidades para contraste
function hexToRgb(hex) {
  const m = hex.replace("#","").match(/.{1,2}/g);
  if (!m) return {r:0,g:0,b:0};
  const [r,g,b] = m.map(x => parseInt(x,16));
  return { r, g, b };
}
function relLum({r,g,b}) {
  const f = (u)=> {
    u/=255;
    return (u<=0.03928)? u/12.92 : Math.pow((u+0.055)/1.055, 2.4);
  };
  const R=f(r), G=f(g), B=f(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}
function pickTextMode(bgHex) {
  const L = relLum(hexToRgb(bgHex));
  return (L > 0.5) ? "light" : "dark";
}

// aplicar color a main-card
async function applySpeciesColor(speciesData, targetEl = mainCard) {
  try {
    const colorName = speciesData?.color?.name || "gray";
    const hex = SPECIES_COLOR_HEX[colorName] || SPECIES_COLOR_HEX.gray;

    // variable CSS para el fondo
    targetEl.style.setProperty("--poke-bg", hex);

    // modo de texto
    const mode = pickTextMode(hex);
    targetEl.classList.remove("main-card--light", "main-card--dark");
    targetEl.classList.add(mode === "light" ? "main-card--light" : "main-card--dark");

    targetEl.classList.add("themed-by-species");
  } catch (e) {
    console.error("No se pudo aplicar color de especie:", e);
  }
}


// =====================================
// 1) Construir una card para la grilla
// =====================================
function showPokemon(p) {
  const id     = p.id;
  const name   = p.name;
  const imgURL = p.sprites?.other?.["official-artwork"]?.front_default || officialArt(id);
  const types  = p.types.map(t => t.type.name);
  const heightM = (p.height / 10).toFixed(1) + " M";
  const weightKg = (p.weight / 10).toFixed(1) + " Kg";

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

  div.querySelector(".card-btn").addEventListener("click", () => {
    console.log("Pokémon ID:", id);
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
    const btnId = event.currentTarget.id;
    const filterType = (btnId === "see-all") ? null : btnId.toLowerCase();

    // Cargar TODO el dex (1..1025) con o sin filtro
    loadPokemons(1, TOTAL_DEX, filterType);
  });
});



// ===================================
// 4) Rellenar la MAIN-CARD seleccionada
// ===================================
async function selectPokemonById(id) {
  try {
    const p = await fetch(`${BASE_URL}${id}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    const s = await fetch(`${SPECIES_URL}${id}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });

    // === aplicar color de especie ===
    await applySpeciesColor(s, mainCard);

    currentId = id;

    idPokeEl.textContent = padId(id);
    nameEl.textContent = p.name;

    const jaEntry = (s.names || []).find(n => n.language?.name === "ja-Hrkt")
                  || (s.names || []).find(n => n.language?.name === "ja");
    nameJaEl.textContent = jaEntry ? jaEntry.name : "";

    const genName = s.generation?.name || "";
    regionEl.textContent = GEN_REGION[genName] || "—";

    imgEl.src = p.sprites?.other?.["official-artwork"]?.front_default || officialArt(id);
    imgEl.alt = p.name;

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
  const next = currentId + 1;
  selectPokemonById(next);
});

// ====== Botón Random ======
const randomBtn = document.getElementById("random-btn");

randomBtn?.addEventListener("click", () => {
  // total de pokémon en la Pokédex nacional
  const total = 1025; 
  const randomId = Math.floor(Math.random() * total) + 1; // 1 a 1025
  selectPokemonById(randomId);
});



// ===================================
// 6) Búsqueda por nombre o ID (lupa)
// ===================================
const searchToggleBtn = document.getElementById("search-toggle");
const searchPanel     = document.getElementById("search-panel");
const searchForm      = document.getElementById("search-form");
const searchInput     = document.getElementById("search-input");
const searchErrorEl   = document.getElementById("search-error");
const searchCloseBtn  = document.getElementById("search-close");
const searchClearBtn  = document.getElementById("search-clear");

function openSearch() {
  searchPanel.classList.add("open");
  searchPanel.setAttribute("aria-hidden", "false");
  searchErrorEl.textContent = "";
  requestAnimationFrame(() => searchInput?.focus());
}
function closeSearch() {
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
}

searchToggleBtn?.addEventListener("click", () => {
  const isOpen = searchPanel.classList.contains("open");
  if (isOpen) closeSearch(); else openSearch();
});
searchCloseBtn?.addEventListener("click", closeSearch);

searchClearBtn?.addEventListener("click", () => {
  searchInput.value = "";
  searchErrorEl.textContent = "";
  searchInput.focus();
});

searchForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = (searchInput.value || "").trim();
  searchErrorEl.textContent = "";

  if (!q) {
    searchErrorEl.textContent = "Escribe un ID (1–1025) o un nombre.";
    searchInput.focus();
    return;
  }

  const numericId = Number(q);
  if (Number.isInteger(numericId) && numericId > 0) {
    try {
      await selectPokemonById(numericId);
      closeSearch();
      return;
    } catch {
      searchErrorEl.textContent = "No encontré un Pokémon con ese ID.";
      return;
    }
  }

  try {
    const name = q.toLowerCase();
    const r = await fetch(`${BASE_URL}${name}`);
    if (!r.ok) throw new Error("not found");
    const p = await r.json();
    await selectPokemonById(p.id);
    closeSearch();
  } catch (err) {
    searchErrorEl.textContent = "No encontré un Pokémon con ese nombre.";
  }
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && searchPanel.classList.contains("open")) {
    closeSearch();
  }
});


// ========================
// 7) Carga inicial (grid)
// ========================
loadPokemons(1, TOTAL_DEX, null);
selectPokemonById(1);

