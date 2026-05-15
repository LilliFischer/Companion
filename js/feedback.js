const supabaseUrl = "https://ipiwdmzxmrbvbaxknvix.supabase.co";
const supabaseKey = "sb_publishable_9WuTIWmkYP_brQIv7NhiHQ_vwUOhXUN";

const client = supabase.createClient(supabaseUrl, supabaseKey);

async function addTerm() {

    const input = document.getElementById("space-input");
    const text = input.value.trim();

    if (!text) return;

    const newItem = {
        id: Date.now().toString(),
        text: text
    };

    const { error } = await client
        .from("feedback")
        .insert([newItem]);

    if (error) {
        console.error(error);
        return;
    }

    input.value = "";
    renderFeedback();
}
async function renderFeedback() {

    const list = document.getElementById("feedbackList");

    const { data, error } = await client
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        list.innerHTML = "<p>Fehler beim Laden</p>";
        return;
    }

    list.innerHTML = data.map(f => `
        <div class="feedback-item">
            <p>${f.text}</p>
        </div>
    `).join("");
}