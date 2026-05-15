// Verbindung zu Supabase herstellen
const SUPABASE_URL = 'https://kagjerpcmckuqjjcguqw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Sh-irHAOgvgeuf9724BcGQ_g4j42E5x';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elemente aus HTML greifen
const feedbackList = document.getElementById('feedbackList');
const spaceInput = document.getElementById('space-input');

function addFeedbackToList(item) {
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.textContent = item.text;
    feedbackList.prepend(div); // Neue zuerst
  }
  
// Feedback hinzufügen
async function addTerm() {
  const text = spaceInput.value.trim();
  if (!text) return;

  const { error } = await client.from('feedback').insert([{ text }]);
  if (error) {
    alert('Fehler beim Speichern: ' + error.message);
    return;
  }

  spaceInput.value = '';
  loadFeedback(); // Liste aktualisieren
}

// Alle Feedbacks laden
async function loadFeedback() {
  const { data, error } = await client
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });
    console.log("Geladene Daten:", data, "Error:", error);
  if (error) {
    console.error(error);
    return;
  }

  feedbackList.innerHTML = '';
  data.forEach(addFeedbackToList);
}

client
  .channel('public:feedback')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'feedback' },
    (payload) => {
      addFeedbackToList(payload.new);
    }
  )
  .subscribe();

// Beim Laden der Seite Feedbacks anzeigen
window.addEventListener('DOMContentLoaded', loadFeedback);
