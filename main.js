// main.js
const listPokemon = document.querySelector("#listPokemon");
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const Ja_URL = "https://pokeapi.co/api/v2/pokemon-species/";



// Función para formatear ID (#0001, #0256, etc.)
const padId = (n) => `#${String(n).padStart(4, "0")}`;

// Construir una card
function showPokemon(p) {
  const id = p.id;
  const name = p.name;
  const img = p.sprites?.other?.["official-artwork"]?.front_default || "";
  const types = p.types.map(t => t.type.name); // array de strings
  const heightM = (p.height / 10).toFixed(1) + " M"; // decímetros → metros
  const weightKg = (p.weight / 10).toFixed(1) + " Kg"; // hectogramos → kg

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

// Cargar varios Pokémon
async function loadPokemons(from = 1, to = 151) {
  try {
    const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i);

    // Cargar en lotes para no saturar la API
    const chunkSize = 20;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map(id =>
          fetch(`${BASE_URL}${id}`)
            .then(r => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.json();
            })
        )
      );
      results.forEach(showPokemon);
    }
  } catch (err) {
    console.error("Error cargando Pokémon:", err);
  }
}

// Inicia
loadPokemons();

buttonHeader.forEach(button => button.addEventlistener("click",(even)=>{
    for(let i = 1; i<= 151;i++){
        fetch(BASE_URL + 1)
        .then((response)=>response.Json())
        
    }
}))


