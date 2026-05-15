// Verbindung zu Supabase
const SUPABASE_URL = "https://luuagzesjlrpyeflotqi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CPXrXz7f3F4U3Lt7RoiXHw_zUxhU9rA";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin-Modus prüfen
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";

// Blacklist
const blacklist = [
  'schwuchtel', 'transe', 'blau', 'afd', 'ekelhaft', 'ekelig', 'missgeburt',
  'pervers','krank','krankhaft','krankhafter','gestört','heilbar','heilung',
  'genderwahn','störung','ideologie','propaganda','unnormal'
];

// Begriffe hinzufügen
async function addTerm() {
  const input = document.getElementById('space-input');
  const raw = input.value.trim().toLowerCase();
  if (!raw) return;

  if (blacklist.includes(raw)) {
    alert("Dieser Begriff ist nicht erlaubt.");
    input.value = "";
    return;
  }

  // Prüfen, ob Begriff existiert
  let { data: existing } = await client
    .from("queer_spaces")
    .select("*")
    .eq("term", raw)
    .limit(1);

  if (existing.length > 0) {
    // Count erhöhen
    await client
      .from("queer_spaces")
      .update({ count: existing[0].count + 1 })
      .eq("id", existing[0].id);
  } else {
    // Neu einfügen
    await client
      .from("queer_spaces")
      .insert([{ term: raw, count: 1 }]);
  }

  input.value = "";
}

// Löschen (nur Admin)
async function deleteTerm(id) {
  await client.from("queer_spaces").delete().eq("id", id);
}

// Wordcloud aktualisieren
function renderCloud(words) {
  const container = document.getElementById("wordcloud");
  container.innerHTML = "";

  words.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item.term;
    div.className = "cloud-tag";

    if (isAdmin) {
      const del = document.createElement("button");
      del.textContent = "✖";
      del.style.marginLeft = "6px";
      del.style.background = "transparent";
      del.style.border = "none";
      del.style.color = "#d60270";
      del.style.cursor = "pointer";
      del.onclick = () => deleteTerm(item.id);
      div.appendChild(del);
    }

    container.appendChild(div);
  });
}

// Daten laden
async function loadCloud() {
  const { data } = await client
    .from("queer_spaces")
    .select("*")
    .order("count", { ascending: false });

  renderCloud(data);
}

// Realtime aktivieren
client
  .channel("public:queer_spaces")
  .on("postgres_changes",
      { event: "*", schema: "public", table: "queer_spaces" },
      () => loadCloud()
  )
  .subscribe();

// Initial laden
window.addEventListener("DOMContentLoaded", loadCloud);
