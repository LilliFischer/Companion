
document.addEventListener("DOMContentLoaded", () => {
    
    const mainElement = document.querySelector('main');
    const vitrineGrid = document.querySelector('.vitrine-grid');
    const scrollIndicator = document.getElementById('scroll-indicator'); // Der Pfeil-Indikator
    
    // --- Initialisierung und Klonen ---
    
    let vitrineCards = Array.from(document.querySelectorAll('.vitrine-card'));
    const originalCardCount = vitrineCards.length;

    // Speichert den Originalinhalt jeder Karte (für Inhaltsaustausch)
    const originalCardContents = {}; 
    vitrineCards.forEach(card => {
        originalCardContents[card.getAttribute('data-index')] = card.querySelector('.inner-card').innerHTML;
    });

    // Konstanten für Skalierung und Trigger
    const mainHeight = mainElement.clientHeight; 
    
    // Trigger für Stage 2 Sichtbarkeit (Grid beginnt sichtbar zu werden)
    const VITRINE_TRIGGER = 0.9; 
    // Trigger für das Ausblenden des Pfeils (Früher als das Grid)
    const INDICATOR_HIDE_TRIGGER = 0.8; 
    
    const maxScale = 1.0;
    const minScale = 0.8;
    const maxDepth = -50; 
    
    let lastCenterIndex = null;

    // LOOP CAROUSEL: Dupliziere Karten
    const cloneTop = vitrineCards.map(c => c.cloneNode(true));
    const cloneBottom = vitrineCards.map(c => c.cloneNode(true));

    cloneTop.forEach(c => vitrineGrid.insertBefore(c, vitrineGrid.firstChild));
    cloneBottom.forEach(c => vitrineGrid.appendChild(c));

    // Liste ALLER Karten aktualisieren
    vitrineCards = Array.from(document.querySelectorAll('.vitrine-card'));

    // --- Berechnung der Einzelhöhe (für Looping und Zufallsstart) ---
    
    const cardHeight = vitrineCards[0].clientHeight;
    const gap = 30; // Aus landing.css
    const cardHeightWithGap = cardHeight + gap; 
    const singleSetHeight = originalCardCount * cardHeightWithGap; 
    
    
    // ==========================================================
    // --- FUNKTION: ZUFÄLLIGER STARTPUNKT BERECHNEN ---
    // ==========================================================
    
    const randomStartIndex = Math.floor(Math.random() * originalCardCount);
    const scrollOffsetToRandomCard = randomStartIndex * cardHeightWithGap;
    
    const gridCenterOffset = (vitrineGrid.clientHeight / 2) - (cardHeight / 2);
    
    const initialScrollPosition = singleSetHeight + scrollOffsetToRandomCard - gridCenterOffset;

    // Setze die Scroll-Position
    vitrineGrid.scrollTop = initialScrollPosition;


    // --- FUNKTION: LOOP WARTUNG ---

    function maintainLoop() {
        const isHorizontal = window.innerWidth >= 1024;
        
        if (isHorizontal) {
            const scrollX = vitrineGrid.scrollLeft;
            // Nutze die exakte Breite der ersten Karte + Gap
            const cardWidth = vitrineCards[0].offsetWidth;
            const gap = 30; // Muss exakt dem 'gap' in der landing.css entsprechen
            const singleSetWidth = originalCardCount * (cardWidth + gap);
    
            // KORREKTUR: Der Sprung muss exakt die Breite eines ganzen Sets betragen
            if (scrollX <= 0) {
                vitrineGrid.scrollLeft = singleSetWidth;
            } else if (scrollX >= singleSetWidth * 2) {
                vitrineGrid.scrollLeft = scrollX - singleSetWidth;
            }
        } else {
            const scrollY = vitrineGrid.scrollTop;
            const cardHeight = vitrineCards[0].offsetHeight;
            const gapY = 30; 
            const singleSetHeight = originalCardCount * (cardHeight + gapY);
    
            if (scrollY <= 0) {
                vitrineGrid.scrollTop = singleSetHeight;
            } else if (scrollY >= singleSetHeight * 2) {
                vitrineGrid.scrollTop = scrollY - singleSetHeight;
            }
        }
    }

    // --- FUNKTION: STAGE SICHTBARKEIT & PFEIL ---

    function checkVisibility() {
        const scrollPosition = mainElement.scrollTop; 
        const vitrineGridElement = document.querySelector(".vitrine-grid");

        // 1. SCROLL-INDIKATOR (Pfeil) steuern
        if (scrollIndicator) {
            // KORRIGIERT: Nutzt INDICATOR_HIDE_TRIGGER (0.75)
            if (scrollPosition < mainHeight * INDICATOR_HIDE_TRIGGER) { 
                scrollIndicator.classList.add('active');
            } else {
                scrollIndicator.classList.remove('active');
            }
        }
        
        // 2. VITRINEN-GRID SICHTBARKEIT (Nutzt VITRINE_TRIGGER 0.9)
        if (vitrineGridElement) {
            if (scrollPosition >= mainHeight * VITRINE_TRIGGER) { 
                vitrineGridElement.classList.add('scroll-visible');
            } else {
                vitrineGridElement.classList.remove('scroll-visible');
            }
        }
    }
    
    // --- FUNKTION: ZENTRIERUNG UND INHALT (KERNLOGIK) ---

    function highlightCenterCard() {
        const isHorizontal = window.innerWidth >= 1024;
    
        let gridCenter;
        let currentCenterCard = null;
    
        if (isHorizontal) {
            gridCenter = vitrineGrid.scrollLeft + vitrineGrid.clientWidth / 2;
        } else {
            gridCenter = vitrineGrid.scrollTop + vitrineGrid.clientHeight / 2;
        }
    
        vitrineCards.forEach(card => {
            let cardCenter;
            let distance;
            let threshold;
    
            if (isHorizontal) {
                cardCenter = card.offsetLeft + card.clientWidth / 2;
                distance = Math.abs(gridCenter - cardCenter);
                threshold = card.clientWidth * 1.5;
            } else {
                cardCenter = card.offsetTop + card.clientHeight / 2;
                distance = Math.abs(gridCenter - cardCenter);
                threshold = card.clientHeight * 1.5;
            }
    
            let scale = minScale;
    
            if (distance < threshold) {
                const scaleDiff = maxScale - minScale;
                scale = maxScale - (distance / threshold) * scaleDiff;
    
                const depth = (distance / threshold) * maxDepth;
    
                card.style.transform = `scale(${scale}) translateZ(${depth}px)`;
                card.style.zIndex = 10;
    
                if (!currentCenterCard || distance < currentCenterCard.distance) {
                    currentCenterCard = { card, distance };
                }
            } else {
                card.style.transform = `scale(${minScale}) translateZ(0px)`;
                card.style.zIndex = 1;
            }
        });
    
        // RESET
        vitrineCards.forEach(card => {
            const isCentered = currentCenterCard && card === currentCenterCard.card;
    
            if (!isCentered && card.classList.contains("active")) {
                const cardIndex = card.getAttribute('data-index');
                const innerCard = card.querySelector('.inner-card');
    
                card.classList.remove("active");
    
                if (innerCard) {
                    innerCard.innerHTML = originalCardContents[cardIndex];
                }
            }
        });
    
        // AKTIVIEREN
        if (currentCenterCard) {
            const card = currentCenterCard.card;
            const index = card.getAttribute('data-index');
    
            if (!card.classList.contains("active")) {
                const txt = card.getAttribute("data-detail-text");
                const detailCardElement = card.querySelector(".detail-card");
    
                if (detailCardElement) {
                    detailCardElement.innerHTML = `<p>${txt}</p>`;
                }
    
                card.classList.add("active");
                lastCenterIndex = index;
            }
        }
    }
    
    // --- FUNKTION: NACH DEM SCROLL-SNAP AUFRUFEN (Fixiert den Text) ---
    function handleSnapEnd() {
        highlightCenterCard();
    }

    // ---------------------------------------------
    // EVENTS
    // ---------------------------------------------
    mainElement.addEventListener('scroll', checkVisibility);
    
    vitrineGrid.addEventListener("scroll", highlightCenterCard);
    vitrineGrid.addEventListener('scroll', maintainLoop);

    // Listener für das Ende des Scrollens (Snap-Position erreicht)
    if ('onscrollend' in window) {
        vitrineGrid.addEventListener('scrollend', handleSnapEnd);
    } else {
        // Fallback: Timeout-Logik für ältere Browser
        let scrollTimeout;
        vitrineGrid.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleSnapEnd, 150);
        });
    }

    // Initialer Start beim Laden der Seite
    checkVisibility();
    setTimeout(() => {
        highlightCenterCard();
    }, 100); 
});