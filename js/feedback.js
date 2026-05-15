const scriptURL = "https://script.google.com/macros/s/AKfycbx3Oa2phlL-59abKZE0FTTo3ww6ShHUjWCYG532k1sQhxhkJZ6oH9EoYlxxMNu4IVhrVg/exec";

// WICHTIG: Die Liste direkt beim Laden der Seite anzeigen
document.addEventListener("DOMContentLoaded", () => {
    renderFeedback();
});

async function renderFeedback() {
    const list = document.getElementById("feedbackList");
    if (!list) return;

    try {
        // Cache-Buster hinzufügen, damit wir immer die aktuellsten Daten bekommen
        
        const response = await fetch(scriptURL + "?nocache=" + Date.now(), {
            cache: "no-store"
        });
        
        const feedbacks = await response.json();

        // Admin-Check (für die Löschfunktion später)
        const urlParams = new URLSearchParams(window.location.search);
        const isAdmin = urlParams.get('admin') === 'true';

        list.innerHTML = feedbacks.map(f => `
            <div class="feedback-item">
                <p>${f.text}</p>
                ${isAdmin ? `<span class="delete-btn" style="color:red; cursor:pointer;" onclick="deleteFeedback('${f.id}')">Löschen</span>` : ''}
            </div>
        `).reverse().join(""); // .reverse(), damit das Neuste oben steht

    } catch (error) {
        console.error("Fehler beim Laden:", error);
        list.innerHTML = "<p>Feedback konnte nicht geladen werden.</p>";
    }
}

async function addTerm() {

    const input = document.getElementById("space-input");
    const text = input.value.trim();

    if (!text) return;

    const newFeedback = {
        id: Date.now().toString(),
        text: text
    };

    try {

        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify(newFeedback)
        });

        input.value = "";
        renderFeedback();

    } catch (error) {
        console.error("Fehler beim Senden:", error);
    }
}
