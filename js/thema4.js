// 1. Die Blacklist definieren (Wörter klein schreiben)
const blacklist = ['schwuchtel', 'transe', 'blau', 'afd', 'ekelhaft', 'ekelig','missgeburt','pervers','krank','krankhaft','krankhafter','gestört','heilbar','heilung','genderwahn','störung','ideologie','propaganda','unnormal'];

let termsData = JSON.parse(localStorage.getItem('queerSpaces')) || {};

function addTerm() {
    const input = document.getElementById('space-input');
    const rawTerm = input.value.trim().toLowerCase();
    
    // 2. Prüfung: Ist das Wort auf der Blacklist?
    if (blacklist.includes(rawTerm)) {
        alert("Dieser Begriff ist nicht erlaubt."); // Optional: Hinweis für den User
        input.value = "";
        return; // Funktion abbrechen
    }
    
    if (rawTerm !== "") {
        termsData[rawTerm] = (termsData[rawTerm] || 0) + 1;
        localStorage.setItem('queerSpaces', JSON.stringify(termsData));
        updateCloud();
        input.value = "";
    }
}

// ... Rest der updateCloud() Funktion bleibt gleich ...