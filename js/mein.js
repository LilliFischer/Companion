document.addEventListener("DOMContentLoaded", () => {

    const mainElement = document.querySelector('main'); // NEU: Referenz auf das <main> Element
    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    
    function checkVisibility() {
        // Berechnet die aktuelle Scroll-Position und die Höhe des Scroll-Containers
        const scrollPosition = mainElement.scrollTop; 
        const mainHeight = mainElement.clientHeight;
        
        // Der Trigger-Punkt wird auf 80% des sichtbaren Bereichs des Scroll-Containers gesetzt
        const triggerPoint = scrollPosition + mainHeight * 0.8; 

        hiddenElements.forEach(element => {
            // Die absolute Position des Elements relativ zum Scroll-Container (<main>)
            const elementTopAbsolute = element.offsetTop; 

            // Prüfen, ob der Trigger-Punkt die Oberkante des Elements erreicht hat
            if (elementTopAbsolute < triggerPoint) { 
                element.classList.add('scroll-visible');
            }
        });
    }

    // ÄNDERUNG: Event Listener auf das <main> Element anwenden
    mainElement.addEventListener('scroll', checkVisibility);
    checkVisibility();
});