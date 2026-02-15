let studyData = {
    cards: [
        {question: "What is JavaScript?", answer: "Programming language"},
        {question: "CSS stands for?", answer: "Cascading Style Sheets"},
        {question: "HTML means?", answer: "Hyper Text Markup Language"}
    ],
    currentIndex: 0,
    score: 0,
    totalAttempts: 0,
    history: [] // Store previous states for undo
};

let currentMode = "flashcards";
let selectedOption = null;
let previousState = null; // Store previous card state

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
    // Save current state before moving
    savePreviousState();
    studyData.currentIndex = (studyData.currentIndex + 1) % studyData.cards.length;
    updateDisplay();
}

function previousCard() {
    // Save current state before moving
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

/* UNDO LAST ACTION - GO BACK TO PREVIOUS CARD */
function undoLastAction() {
    if (previousState) {
        // Find the index of the previous card
        let prevIndex = studyData.cards.findIndex(card => 
            card.question === previousState.card.question && 
            card.answer === previousState.card.answer
        );
        
        if (prevIndex !== -1) {
            studyData.currentIndex = prevIndex;
            updateDisplay();
            showUndoMessage("↩️ Went back to previous card!");
        } else {
            // If card was deleted, just go to previous index
            if (previousState.index < studyData.cards.length) {
                studyData.currentIndex = previousState.index;
                updateDisplay();
                showUndoMessage("↩️ Went back to previous card!");
            } else {
                showUndoMessage("⚠️ Previous card not available");
            }
        }
    } else {
        // If no previous state, just go to previous card
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

function saveCard() {
    let q = document.getElementById("edit-question").value;
    let a = document.getElementById("edit-answer").value;
    
    if (!q || !a) {
        alert("Fill all fields");
        return;
    }
    
    studyData.cards.push({question: q, answer: a});
    closeModal();
    updateDisplay();
    showUndoMessage("➕ Question added!");
}

/* DELETE */
function deleteCurrentCard() {
    if (studyData.cards.length === 0) return;
    
    // Save current state before deleting
    savePreviousState();
    
    studyData.cards.splice(studyData.currentIndex, 1);
    
    if (studyData.cards.length > 0) {
        studyData.currentIndex = Math.min(studyData.currentIndex, studyData.cards.length - 1);
    } else {
        studyData.currentIndex = 0;
    }
    
    updateDisplay();
    showUndoMessage("🗑️ Card deleted!");
}

function resetProgress() {
    studyData.currentIndex = 0;
    studyData.score = 0;
    studyData.totalAttempts = 0;
    previousState = null; // Clear previous state on reset
    updateDisplay();
    updateScore();
    showUndoMessage("🔄 Progress reset!");
}