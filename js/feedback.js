const blacklist = ['schwuchtel', 'transe', 'blau', 'afd', 'ekelhaft', 'ekelig','missgeburt','pervers','krank','krankhaft','krankhafter','gestört','heilbar','heilung','genderwahn','störung','ideologie','propaganda','unnormal'];

document.addEventListener("DOMContentLoaded", renderFeedback);

function addTerm() {
    const input = document.getElementById("space-input");
    let text = input.value.trim();

    if (text === "") return;

    const containsBadWord = blacklist.some(word => text.toLowerCase().includes(word));
    
    if (containsBadWord) {
        alert("Dein Feedback enthält unangebrachte Sprache.");
        return;
    }

    const feedbacks = JSON.parse(localStorage.getItem("exhibition_feedback") || "[]");
    feedbacks.push({ id: Date.now(), text: text });
    localStorage.setItem("exhibition_feedback", JSON.stringify(feedbacks));

    input.value = "";
    renderFeedback();
}

function renderFeedback() {
    const list = document.getElementById("feedbackList");
    const feedbacks = JSON.parse(localStorage.getItem("exhibition_feedback") || "[]");

    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    list.innerHTML = feedbacks.map(f => `
        <div class="feedback-item">
            <p>${f.text}</p>
            ${isAdmin ? `<span class="delete-btn" onclick="deleteFeedback(${f.id})">Löschen</span>` : ''}
        </div>
    `).join("");
}

function deleteFeedback(id) {
    let feedbacks = JSON.parse(localStorage.getItem("exhibition_feedback") || "[]");
    feedbacks = feedbacks.filter(f => f.id !== id);
    localStorage.setItem("exhibition_feedback", JSON.stringify(feedbacks));
    renderFeedback();
}