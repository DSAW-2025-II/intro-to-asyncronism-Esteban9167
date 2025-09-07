// main.js
const listPokemon = document.querySelector("#listPokemon");
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const Ja_URL = "https://pokeapi.co/api/v2/pokemon-species/"; // (reservado si luego usas nombres JP)

// Formatea ID (#0001)
const padId = (n) => `#${String(n).padStart(4, "0")}`;

// Construir una card
function showPokemon(p) {
  const id = p.id;
  const name = p.name;
  const img = p.sprites?.other?.["official-artwork"]?.front_default || "";
  const types = p.types.map(t => t.type.name); // array de strings
  const heightM = (p.height / 10).toFixed(1) + " M";
  const weightKg = (p.weight / 10).toFixed(1) + " Kg";

  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <button class="card-btn" type="button">
      <p class="pokemon-id-back">${padId(id)}</p>
      <div class="pokemon-img">
        <img src="${img}" alt="${name}">
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
  listPokemon.append(div);
}

/**
 * Carga Pokémon en rango y, si se indica, filtra por tipo (e.g. "fire", "water").
 * @param {number} from  ID inicial
 * @param {number} to    ID final
 * @param {string|null} filterType  null = ver todos; "fire"|"grass"|...
 */
async function loadPokemons(from = 1, to = 151, filterType = null) {
  try {
    listPokemon.replaceChildren(); // limpia el grid antes de pintar

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

      // Si hay filtro por tipo, solamente pinto los que lo cumplan
      results.forEach(p => {
        if (!filterType) {
          showPokemon(p);
          return;
        }
        const types = p.types.map(t => t.type.name); // ["grass", "poison"]
        if (types.includes(filterType)) showPokemon(p);
      });
    }
  } catch (err) {
    console.error("Error cargando Pokémon:", err);
  }
}

// ------------ Botones del header (ver todos / por tipo) ------------
const buttonsHeader = document.querySelectorAll(".nav .btn");

/**
 * Mapea el id del botón a la acción de filtrado.
 * - "see-all" => sin filtro
 * - ids de tipo (fire, water, grass, ...) => filtro por ese tipo
 */
buttonsHeader.forEach((button) => {
  button.addEventListener("click", (event) => {
    const btnId = event.currentTarget.id; // p.ej. "fire" | "see-all"
    const filterType = (btnId === "see-all") ? null : btnId.toLowerCase();

    // Si quieres mantener solo Kanto (1–151):
    loadPokemons(1, 151, filterType);

    // Si quieres todos (1–1025), cambia por:
    // loadPokemons(1, 1025, filterType);
  });
});

// Carga inicial (ver todos Kanto)
loadPokemons(1, 151, null);
