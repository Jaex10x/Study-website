// Load data from localStorage or use defaults
let studyData = {
    cards: [],
    currentIndex: 0,
    score: 0,
    totalAttempts: 0,
    history: []
};

// Load from localStorage immediately when script runs
function loadFromStorage() {
    const saved = localStorage.getItem('studyMasterData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            studyData.cards = parsed.cards || [];
            studyData.score = parsed.score || 0;
            studyData.totalAttempts = parsed.totalAttempts || 0;
            console.log('Loaded from storage:', studyData.cards.length, 'cards');
        } catch (e) {
            console.error('Failed to load from storage', e);
            setDefaultCards();
        }
    } else {
        console.log('No saved data, using defaults');
        setDefaultCards();
    }
}

// Set default cards
function setDefaultCards() {
    studyData.cards = [
        {question: "What is JavaScript?", answer: "Programming language"},
        {question: "CSS stands for?", answer: "Cascading Style Sheets"},
        {question: "HTML means?", answer: "Hyper Text Markup Language"}
    ];
    saveToStorage(); // Save defaults to storage
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('studyMasterData', JSON.stringify({
        cards: studyData.cards,
        score: studyData.score,
        totalAttempts: studyData.totalAttempts
    }));
    console.log('Saved to storage:', studyData.cards.length, 'cards');
}

// Load data when page starts
loadFromStorage();

let currentMode = "flashcards";
let selectedOption = null;
let previousState = null;

document.addEventListener("DOMContentLoaded", function() {
    updateDisplay();
    updateScore();
});

/* MODE SWITCH */
function switchMode(mode, btn) {
    currentMode = mode;
    studyData.currentIndex = 0;
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    updateDisplay();
}

/* DISPLAY */
function updateDisplay() {
    document.querySelectorAll(".study-mode").forEach(m => m.classList.remove("active"));
    document.getElementById(currentMode + "-mode").classList.add("active");

    if (studyData.cards.length === 0) {
        document.getElementById("question-display").textContent = "No questions yet";
        document.getElementById("card-counter").textContent = "0 / 0";
        return;
    }

    if (studyData.currentIndex >= studyData.cards.length)
        studyData.currentIndex = 0;

    let card = studyData.cards[studyData.currentIndex];

    document.getElementById("card-counter").textContent = 
        (studyData.currentIndex + 1) + " / " + studyData.cards.length;

    /* FLASHCARD */
    if (currentMode === "flashcards") {
        document.querySelector(".flashcard").classList.remove("flipped");
        document.getElementById("question-display").textContent = card.question;
        document.getElementById("answer-display").textContent = card.answer;
    }

    /* MULTIPLE CHOICE */
    if (currentMode === "multiple-choice") {
        document.getElementById("mc-question").textContent = card.question;
        let box = document.getElementById("mc-options");
        box.innerHTML = "";
        selectedOption = null;

        let options = generateOptions(card.answer);

        options.forEach((opt, i) => {
            let div = document.createElement("div");
            div.textContent = opt;
            div.className = "option";
            div.onclick = () => {
                selectedOption = i;
                document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
                div.classList.add("selected");
            };
            box.appendChild(div);
        });
        
        let feedback = document.getElementById("mc-feedback");
        feedback.textContent = "";
        feedback.className = "feedback";
    }

    /* IDENTIFICATION */
    if (currentMode === "identification") {
        document.getElementById("id-question").textContent = card.question;
        document.getElementById("id-answer").value = "";
        
        let feedback = document.getElementById("id-feedback");
        feedback.textContent = "";
        feedback.className = "feedback";
    }
}

/* GENERATE MC OPTIONS */
function generateOptions(correct) {
    let fake = [
        "Computer System", "Programming Tool", "Web Language",
        "Markup Tool", "Data Format", "Software Code"
    ];

    let options = [correct];
    while (options.length < 4) {
        let r = fake[Math.floor(Math.random() * fake.length)];
        if (!options.includes(r)) options.push(r);
    }
    return options.sort(() => Math.random() - 0.5);
}

/* NAVIGATION */
function nextCard() {
    savePreviousState();
    studyData.currentIndex = (studyData.currentIndex + 1) % studyData.cards.length;
    updateDisplay();
}

function previousCard() {
    savePreviousState();
    studyData.currentIndex = 
        (studyData.currentIndex - 1 + studyData.cards.length) % studyData.cards.length;
    updateDisplay();
}

/* SAVE PREVIOUS STATE FOR UNDO */
function savePreviousState() {
    if (studyData.cards.length > 0) {
        previousState = {
            index: studyData.currentIndex,
            card: {...studyData.cards[studyData.currentIndex]}
        };
    }
}

/* UNDO LAST ACTION */
function undoLastAction() {
    if (previousState) {
        let prevIndex = studyData.cards.findIndex(card => 
            card.question === previousState.card.question && 
            card.answer === previousState.card.answer
        );
        
        if (prevIndex !== -1) {
            studyData.currentIndex = prevIndex;
            updateDisplay();
            showUndoMessage("↩️ Went back to previous card!");
        } else {
            if (previousState.index < studyData.cards.length) {
                studyData.currentIndex = previousState.index;
                updateDisplay();
                showUndoMessage("↩️ Went back to previous card!");
            } else {
                showUndoMessage("⚠️ Previous card not available");
            }
        }
    } else {
        previousCard();
        showUndoMessage("↩️ Went to previous card!");
    }
}

/* SHOW UNDO MESSAGE */
function showUndoMessage(message) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "undo-message";
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

/* CHECK ANSWERS WITH SCORING */
function checkMCAnswer() {
    let correct = studyData.cards[studyData.currentIndex].answer;
    let chosen = document.querySelector(".option.selected");
    
    if (!chosen) {
        alert("Please select an answer!");
        return;
    }
    
    let isCorrect = chosen.textContent === correct;
    let feedback = document.getElementById("mc-feedback");
    
    if (isCorrect) {
        feedback.textContent = "✅ Correct! +1 point";
        feedback.className = "feedback correct";
        studyData.score++;
    } else {
        feedback.textContent = `❌ Wrong! The correct answer is: ${correct}`;
        feedback.className = "feedback wrong";
    }
    
    studyData.totalAttempts++;
    updateScore();
    saveToStorage(); // Save after scoring
}

function checkIDAnswer() {
    let input = document.getElementById("id-answer").value.trim().toLowerCase();
    let correct = studyData.cards[studyData.currentIndex].answer.toLowerCase();
    let isCorrect = input === correct;
    let feedback = document.getElementById("id-feedback");
    
    if (!input) {
        alert("Please type an answer!");
        return;
    }
    
    if (isCorrect) {
        feedback.textContent = "✅ Correct! +1 point";
        feedback.className = "feedback correct";
        studyData.score++;
    } else {
        feedback.textContent = `❌ Wrong! The correct answer is: ${studyData.cards[studyData.currentIndex].answer}`;
        feedback.className = "feedback wrong";
    }
    
    studyData.totalAttempts++;
    updateScore();
    saveToStorage(); // Save after scoring
}

/* SCORE FUNCTIONS */
function updateScore() {
    document.getElementById("score-display").textContent = studyData.score;
    document.getElementById("total-attempts").textContent = studyData.totalAttempts;
    
    let percentage = studyData.totalAttempts > 0 
        ? Math.round((studyData.score / studyData.totalAttempts) * 100) 
        : 0;
    document.getElementById("percentage-display").textContent = percentage + "%";
}

/* FLIP */
function flipCard() {
    document.querySelector(".flashcard").classList.toggle("flipped");
}

/* MODAL */
function addNewCard() {
    document.getElementById("card-modal").style.display = "block";
    document.getElementById("edit-question").value = "";
    document.getElementById("edit-answer").value = "";
}

function closeModal() {
    document.getElementById("card-modal").style.display = "none";
}

/* FIXED: Save card and persist to storage */
function saveCard() {
    let q = document.getElementById("edit-question").value;
    let a = document.getElementById("edit-answer").value;
    
    if (!q || !a) {
        alert("Fill all fields");
        return;
    }
    
    // Add new card
    studyData.cards.push({question: q, answer: a});
    
    // CRITICAL: Save to localStorage immediately
    saveToStorage();
    
    closeModal();
    updateDisplay();
    showUndoMessage("➕ Question added!");
    
    console.log('Card added. Total cards:', studyData.cards.length);
}

/* FIXED: Delete card and persist to storage */
function deleteCurrentCard() {
    if (studyData.cards.length === 0) return;
    
    savePreviousState();
    
    // Remove current card
    studyData.cards.splice(studyData.currentIndex, 1);
    
    // Adjust index if needed
    if (studyData.cards.length > 0) {
        studyData.currentIndex = Math.min(studyData.currentIndex, studyData.cards.length - 1);
    } else {
        studyData.currentIndex = 0;
    }
    
    // CRITICAL: Save to localStorage immediately
    saveToStorage();
    
    updateDisplay();
    showUndoMessage("🗑️ Card deleted!");
    
    console.log('Card deleted. Total cards:', studyData.cards.length);
}

/* FIXED: Reset progress but keep cards */
function resetProgress() {
    studyData.currentIndex = 0;
    studyData.score = 0;
    studyData.totalAttempts = 0;
    previousState = null;
    
    // Save to localStorage
    saveToStorage();
    
    updateDisplay();
    updateScore();
    showUndoMessage("🔄 Progress reset!");
}

/* NEW: Clear all cards (optional) */
function clearAllCards() {
    if (confirm('Are you sure you want to delete ALL cards?')) {
        studyData.cards = [];
        studyData.currentIndex = 0;
        studyData.score = 0;
        studyData.totalAttempts = 0;
        
        // Save to localStorage
        saveToStorage();
        
        updateDisplay();
        updateScore();
        showUndoMessage("🗑️ All cards deleted!");
    }
}

/* NEW: Export cards to file (backup) */
function exportCards() {
    const dataStr = JSON.stringify(studyData.cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'study-cards-backup.json';
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/* NEW: Import cards from file */
function importCards() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const importedCards = JSON.parse(event.target.result);
                if (Array.isArray(importedCards)) {
                    studyData.cards = importedCards;
                    studyData.currentIndex = 0;
                    saveToStorage();
                    updateDisplay();
                    showUndoMessage("📥 Cards imported!");
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error importing file');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Save before page unload
window.addEventListener('beforeunload', function() {
    saveToStorage();
});

// Check storage on load
console.log('Initial cards:', studyData.cards.length);