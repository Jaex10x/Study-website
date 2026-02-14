// =====================================================
// SUPABASE CONNECTION
// =====================================================
const SUPABASE_URL = 'https://fhameymrtkygqoipftid.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ai1CllplGqlEFxfRHJguRQ_n5Uy_xE1';

// Create supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================================
// STUDY DATA STRUCTURE
// =====================================================
let studyData = {
    cards: [
        {
            id: 1,
            question: "What is JavaScript?",
            answer: "A programming language for web development",
            type: "flashcard"
        },
        {
            id: 2,
            question: "What does CSS stand for?",
            answer: "Cascading Style Sheets",
            type: "flashcard",
            options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"],
            correctOption: 0
        },
        {
            id: 3,
            question: "HTML stands for Hyper Text Markup Language",
            answer: "True",
            type: "identification"
        }
    ],
    progress: {
        currentCardIndex: 0,
        completedCards: [],
        scores: {
            multipleChoice: 0,
            identification: 0
        }
    }
};

// Current state
let currentMode = 'flashcards';
let isFlipped = false;
let selectedOption = null;
let currentUser = null;

// Undo functionality variables
let lastAction = null;
let deletedCardBackup = null;
let lastCardIndex = 0;
let currentEditingCardId = null;

// =====================================================
// INITIALIZATION
// =====================================================

function init() {
    loadData();
    updateDisplay();
    updateProgress();
    setupEventListeners();
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('studyMasterData');
    if (savedData) {
        studyData = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('studyMasterData', JSON.stringify(studyData));
}

// =====================================================
// DISPLAY FUNCTIONS
// =====================================================

function updateDisplay() {
    const currentCards = studyData.cards.filter(card => 
        currentMode === 'flashcards' ? card.type === 'flashcard' :
        currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
        card.type === 'identification'
    );
    
    if (currentCards.length === 0) {
        showNoCardsMessage();
        return;
    }
    
    const currentIndex = studyData.progress.currentCardIndex;
    const currentCard = currentCards[currentIndex];
    
    if (!currentCard) {
        studyData.progress.currentCardIndex = 0;
        updateDisplay();
        return;
    }
    
    switch(currentMode) {
        case 'flashcards':
            updateFlashcard(currentCard);
            break;
        case 'multiple-choice':
            updateMultipleChoice(currentCard);
            break;
        case 'identification':
            updateIdentification(currentCard);
            break;
    }
    
    document.getElementById('card-counter').textContent = 
        `${currentIndex + 1} / ${currentCards.length}`;
}

function updateFlashcard(card) {
    document.getElementById('question-display').textContent = card.question;
    document.getElementById('answer-display').textContent = card.answer;
    isFlipped = false;
    document.querySelector('.flashcard').classList.remove('flipped');
}

function updateMultipleChoice(card) {
    document.getElementById('mc-question').textContent = card.question;
    const optionsContainer = document.getElementById('mc-options');
    optionsContainer.innerHTML = '';
    
    card.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionDiv);
    });
    
    document.getElementById('mc-feedback').innerHTML = '';
    selectedOption = null;
}

function updateIdentification(card) {
    document.getElementById('id-question').textContent = card.question;
    document.getElementById('id-answer').value = '';
    document.getElementById('id-feedback').innerHTML = '';
}

// =====================================================
// CARD INTERACTION FUNCTIONS
// =====================================================

function flipCard() {
    if (currentMode === 'flashcards') {
        isFlipped = !isFlipped;
        document.querySelector('.flashcard').classList.toggle('flipped');
    }
}

function nextCard() {
    const currentCards = studyData.cards.filter(card => 
        currentMode === 'flashcards' ? card.type === 'flashcard' :
        currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
        card.type === 'identification'
    );
    
    if (studyData.progress.currentCardIndex < currentCards.length - 1) {
        studyData.progress.currentCardIndex++;
    } else {
        studyData.progress.currentCardIndex = 0;
    }
    
    updateDisplay();
    updateProgress();
    saveData();
}

function previousCard() {
    const currentCards = studyData.cards.filter(card => 
        currentMode === 'flashcards' ? card.type === 'flashcard' :
        currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
        card.type === 'identification'
    );
    
    if (studyData.progress.currentCardIndex > 0) {
        studyData.progress.currentCardIndex--;
    } else {
        studyData.progress.currentCardIndex = currentCards.length - 1;
    }
    
    updateDisplay();
    updateProgress();
    saveData();
}

// =====================================================
// ANSWER CHECKING FUNCTIONS
// =====================================================

function selectOption(index) {
    selectedOption = index;
    document.querySelectorAll('.option').forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
}

function checkMCAnswer() {
    if (selectedOption === null) {
        alert('Please select an answer!');
        return;
    }
    
    const currentCards = studyData.cards.filter(card => card.type === 'flashcard' && card.options);
    const currentCard = currentCards[studyData.progress.currentCardIndex];
    const feedback = document.getElementById('mc-feedback');
    
    if (selectedOption === currentCard.correctOption) {
        feedback.className = 'feedback correct';
        feedback.textContent = '✅ Correct! Well done!';
        studyData.progress.scores.multipleChoice++;
    } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = `❌ Incorrect. The correct answer is: ${currentCard.options[currentCard.correctOption]}`;
    }
    
    saveData();
}

function checkIDAnswer() {
    const userAnswer = document.getElementById('id-answer').value.trim().toLowerCase();
    const currentCards = studyData.cards.filter(card => card.type === 'identification');
    const currentCard = currentCards[studyData.progress.currentCardIndex];
    const feedback = document.getElementById('id-feedback');
    
    if (userAnswer === currentCard.answer.toLowerCase()) {
        feedback.className = 'feedback correct';
        feedback.textContent = '✅ Correct! Well done!';
        studyData.progress.scores.identification++;
    } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = `❌ Incorrect. The correct answer is: ${currentCard.answer}`;
    }
    
    saveData();
}

function nextMCQuestion() {
    nextCard();
}

function nextIDQuestion() {
    nextCard();
}

// =====================================================
// MODE SWITCHING
// =====================================================

function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.study-mode').forEach(mode => mode.classList.remove('active'));
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    studyData.progress.currentCardIndex = 0;
    updateDisplay();
}

// =====================================================
// PROGRESS TRACKING
// =====================================================

function updateProgress() {
    const totalCards = studyData.cards.length;
    const completedCards = studyData.progress.completedCards.length;
    const progress = (completedCards / totalCards) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
}

// =====================================================
// DATA MANAGEMENT
// =====================================================

function exportData() {
    const dataStr = JSON.stringify(studyData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'studymaster-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            studyData = JSON.parse(e.target.result);
            saveData();
            updateDisplay();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

function addNewCard() {
    currentEditingCardId = null;
    document.getElementById('edit-question').value = '';
    document.getElementById('edit-answer').value = '';
    document.getElementById('edit-type').value = 'flashcard';
    document.getElementById('mc-options-edit').style.display = 'none';
    document.getElementById('card-modal').style.display = 'block';
}

function deleteCurrentCard() {
    if (confirm('Are you sure you want to delete this card?')) {
        
        const currentCards = studyData.cards.filter(card => 
            currentMode === 'flashcards' ? card.type === 'flashcard' :
            currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
            card.type === 'identification'
        );
        
        const currentIndex = studyData.progress.currentCardIndex;
        const currentCard = currentCards[currentIndex];
        
        if (currentCard) {
            const cardIndex = studyData.cards.findIndex(c => c.id === currentCard.id);
            
            if (cardIndex !== -1) {
                studyData.cards.splice(cardIndex, 1);
                
                if (studyData.cards.length === 0) {
                    studyData.progress.currentCardIndex = 0;
                } else if (cardIndex <= studyData.progress.currentCardIndex) {
                    studyData.progress.currentCardIndex = Math.max(0, studyData.progress.currentCardIndex - 1);
                }
                
                saveData();
                updateDisplay();
                updateProgress();
                closeModal();
                
                alert('Card deleted successfully!');
            }
        }
    }
}

function deleteCardById(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        
        const cardIndex = studyData.cards.findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
            deletedCardBackup = {...studyData.cards[cardIndex]};
            
            lastAction = {
                type: 'delete',
                index: cardIndex
            };
            
            lastCardIndex = studyData.progress.currentCardIndex;
            
            studyData.cards.splice(cardIndex, 1);
            
            if (studyData.cards.length === 0) {
                studyData.progress.currentCardIndex = 0;
            } else if (cardIndex <= studyData.progress.currentCardIndex) {
                studyData.progress.currentCardIndex = Math.max(0, studyData.progress.currentCardIndex - 1);
            }
            
            saveData();
            updateDisplay();
            updateProgress();
            closeModal();
            
            alert('Card deleted! Use "Undo" to restore if needed.');
        }
    }
}

function saveCard() {
    const question = document.getElementById('edit-question').value;
    const answer = document.getElementById('edit-answer').value;
    const type = document.getElementById('edit-type').value;
    
    if (!question || !answer) {
        alert('Please fill in all fields!');
        return;
    }
    
    if (currentEditingCardId) {
        // EDIT existing card
        const cardIndex = studyData.cards.findIndex(c => c.id === currentEditingCardId);
        if (cardIndex !== -1) {
            const originalCard = {...studyData.cards[cardIndex]};
            
            studyData.cards[cardIndex].question = question;
            studyData.cards[cardIndex].answer = answer;
            studyData.cards[cardIndex].type = type;
            
            if (type === 'flashcard') {
                const options = document.getElementById('edit-options').value.split(',').map(opt => opt.trim());
                if (options.length >= 2) {
                    studyData.cards[cardIndex].options = options;
                    if (!studyData.cards[cardIndex].correctOption) {
                        studyData.cards[cardIndex].correctOption = 0;
                    }
                }
            } else {
                delete studyData.cards[cardIndex].options;
                delete studyData.cards[cardIndex].correctOption;
            }
            
            lastAction = {
                type: 'edit',
                index: cardIndex,
                originalCard: originalCard
            };
            
            alert('Card edited! Use "Undo" to revert if needed.');
        }
    } else {
        // ADD new card
        const newCard = {
            id: Date.now(),
            question: question,
            answer: answer,
            type: type
        };
        
        if (type === 'flashcard') {
            const options = document.getElementById('edit-options').value.split(',').map(opt => opt.trim());
            if (options.length >= 2) {
                newCard.options = options;
                newCard.correctOption = 0;
            }
        }
        
        studyData.cards.push(newCard);
        
        lastAction = {
            type: 'add'
        };
        
        alert('Card added! Use "Undo" to remove if needed.');
    }
    
    saveData();
    closeModal();
    updateDisplay();
    if (document.getElementById('card-list-container')) {
        showCardList();
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        studyData.progress = {
            currentCardIndex: 0,
            completedCards: [],
            scores: {
                multipleChoice: 0,
                identification: 0
            }
        };
        saveData();
        updateDisplay();
        updateProgress();
    }
}

// =====================================================
// UNDO FUNCTIONALITY
// =====================================================

function undoCard() {
    if (!lastAction) {
        alert('Nothing to undo!');
        return;
    }
    
    if (lastAction.type === 'delete' && deletedCardBackup) {
        studyData.cards.splice(lastAction.index, 0, deletedCardBackup);
        
        if (lastAction.index <= studyData.progress.currentCardIndex) {
            studyData.progress.currentCardIndex++;
        }
        
        deletedCardBackup = null;
        lastAction = null;
        
        saveData();
        updateDisplay();
        updateProgress();
        
        alert('Card restored successfully!');
    } 
    else if (lastAction.type === 'add') {
        studyData.cards.pop();
        
        if (studyData.progress.currentCardIndex >= studyData.cards.length) {
            studyData.progress.currentCardIndex = Math.max(0, studyData.cards.length - 1);
        }
        
        lastAction = null;
        
        saveData();
        updateDisplay();
        updateProgress();
        
        alert('Last card addition undone!');
    }
    else if (lastAction.type === 'edit') {
        if (lastAction.originalCard) {
            studyData.cards[lastAction.index] = lastAction.originalCard;
            
            lastAction = null;
            
            saveData();
            updateDisplay();
            updateProgress();
            
            alert('Edit undone!');
        }
    }
    else {
        alert('Nothing to undo!');
    }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function showNoCardsMessage() {
    const modeDisplay = document.getElementById(`${currentMode}-mode`);
    modeDisplay.innerHTML = `<div class="no-cards">No cards available in this mode. Add some cards to start studying!</div>`;
}

function closeModal() {
    document.getElementById('card-modal').style.display = 'none';
}

function toggleCardList() {
    let cardListDiv = document.getElementById('card-list-container');
    
    if (cardListDiv) {
        cardListDiv.remove();
    } else {
        showCardList();
    }
}

function showCardList() {
    const existingList = document.getElementById('card-list-container');
    if (existingList) existingList.remove();
    
    const container = document.createElement('div');
    container.id = 'card-list-container';
    container.className = 'card-list-container';
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>📋 All Cards (${studyData.cards.length})</h3>
            <button onclick="toggleCardList()" class="btn secondary small">Close</button>
        </div>
        <div class="card-list">
    `;
    
    studyData.cards.forEach((card, index) => {
        const isCurrentCard = index === studyData.progress.currentCardIndex;
        html += `
            <div class="card-list-item ${isCurrentCard ? 'selected' : ''}" 
                 onclick="jumpToCard(${card.id})">
                <div class="card-info">
                    <strong>${card.question.substring(0, 30)}${card.question.length > 30 ? '...' : ''}</strong>
                    <span class="card-type">${card.type}</span>
                </div>
                <div>
                    <button onclick="editCard(${card.id}); event.stopPropagation();" 
                            class="btn small primary" style="margin-right: 5px;">✏️</button>
                    <button onclick="deleteCardById(${card.id}); event.stopPropagation();" 
                            class="btn small warning">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelector('.data-management').appendChild(container);
}

function jumpToCard(cardId) {
    const cardIndex = studyData.cards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
        studyData.progress.currentCardIndex = cardIndex;
        updateDisplay();
    }
}

function editCard(cardId) {
    const card = studyData.cards.find(c => c.id === cardId);
    if (!card) return;
    
    currentEditingCardId = cardId;
    document.getElementById('edit-question').value = card.question;
    document.getElementById('edit-answer').value = card.answer;
    document.getElementById('edit-type').value = card.type;
    
    if (card.type === 'flashcard' && card.options) {
        document.getElementById('mc-options-edit').style.display = 'block';
        document.getElementById('edit-options').value = card.options.join(', ');
    } else {
        document.getElementById('mc-options-edit').style.display = 'none';
    }
    
    document.getElementById('card-modal').style.display = 'block';
}

// =====================================================
// PDF FUNCTIONS
// =====================================================

// =====================================================
// ENHANCED PDF IMPORT FUNCTION
// =====================================================

async function importFromPDF(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'feedback';
    loadingMsg.textContent = '📄 Processing PDF... Please wait.';
    loadingMsg.style.background = '#fff3cd';
    loadingMsg.style.color = '#856404';
    document.querySelector('.data-management').prepend(loadingMsg);
    
    try {
        // Load PDF.js library if not available
        if (typeof window.pdfjsLib === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
        
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                
                // Load the PDF
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                console.log(`PDF loaded with ${pdf.numPages} pages`);
                
                // Extract text from all pages with better formatting
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    // Group text items by their Y position to preserve line structure
                    const lines = [];
                    let lastY = null;
                    let currentLine = '';
                    
                    // Sort items by vertical position
                    const items = textContent.items.sort((a, b) => {
                        if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                            return a.transform[4] - b.transform[4];
                        }
                        return b.transform[5] - a.transform[5];
                    });
                    
                    items.forEach(item => {
                        const y = Math.round(item.transform[5]);
                        if (lastY !== null && Math.abs(y - lastY) > 5) {
                            lines.push(currentLine);
                            currentLine = item.str;
                        } else {
                            currentLine += (currentLine ? ' ' : '') + item.str;
                        }
                        lastY = y;
                    });
                    
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    
                    fullText += lines.join('\n') + '\n';
                }
                
                console.log('Extracted text:', fullText);
                
                // Try multiple parsing methods
                const importedCards = parsePDFTextEnhanced(fullText);
                
                // Remove loading message
                loadingMsg.remove();
                
                if (importedCards.length > 0) {
                    // Show preview
                    let previewText = `Found ${importedCards.length} cards:\n\n`;
                    importedCards.slice(0, 3).forEach((card, i) => {
                        previewText += `${i+1}. ${card.question.substring(0, 50)}${card.question.length > 50 ? '...' : ''}\n`;
                    });
                    
                    const action = confirm(
                        `${previewText}\n\nClick OK to ADD to existing cards.\nClick Cancel to REPLACE existing cards.`
                    );
                    
                    if (action) {
                        // Add to existing cards
                        importedCards.forEach(card => {
                            card.id = Date.now() + Math.random();
                            studyData.cards.push(card);
                        });
                        alert(`✅ Successfully added ${importedCards.length} cards to your collection!`);
                    } else {
                        // Replace existing cards
                        studyData.cards = importedCards.map((card, index) => ({
                            ...card,
                            id: index + 1
                        }));
                        studyData.progress.currentCardIndex = 0;
                        alert(`✅ Successfully imported ${importedCards.length} cards (replaced existing)!`);
                    }
                    
                    saveData();
                    updateDisplay();
                    updateProgress();
                    
                    if (document.getElementById('card-list-container')) {
                        showCardList();
                    }
                } else {
                    // Try alternative parsing with different patterns
                    const simpleCards = parseSimpleTextFormat(fullText);
                    
                    if (simpleCards.length > 0) {
                        const action = confirm(
                            `Found ${simpleCards.length} cards using simple format.\n\nClick OK to import.`
                        );
                        
                        if (action) {
                            simpleCards.forEach(card => {
                                card.id = Date.now() + Math.random();
                                studyData.cards.push(card);
                            });
                            saveData();
                            updateDisplay();
                            updateProgress();
                            alert(`✅ Imported ${simpleCards.length} cards!`);
                        }
                    } else {
                        // Show the extracted text to help debug
                        alert(`❌ No cards could be extracted.\n\nExtracted text starts with:\n${fullText.substring(0, 300)}...\n\nCheck console (F12) for full text.`);
                    }
                }
                
            } catch (error) {
                loadingMsg.remove();
                console.error('Error reading PDF:', error);
                alert('❌ Error reading PDF file: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(file);
        
    } catch (error) {
        loadingMsg.remove();
        console.error('Error loading PDF library:', error);
        alert('❌ Error loading PDF library. Please check your internet connection.');
    }
}

// =====================================================
// ENHANCED PDF PARSING FUNCTION
// =====================================================

function parsePDFTextEnhanced(text) {
    const cards = [];
    
    // Split into lines and clean up
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    console.log('Processing lines:', lines);
    
    let currentCard = null;
    let collectingAnswer = false;
    let answerText = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Pattern 1: Numbered questions (1. Question?)
        if (line.match(/^\d+[.)]\s*.+\?/)) {
            // Save previous card
            if (currentCard && currentCard.question && currentCard.answer) {
                cards.push({...currentCard});
            }
            
            // Start new card
            currentCard = {
                question: line.replace(/^\d+[.)]\s*/, '').trim(),
                answer: '',
                type: 'flashcard'
            };
            collectingAnswer = false;
        }
        
        // Pattern 2: Question: format
        else if (line.match(/^Question[:：]\s*.+/i)) {
            if (currentCard && currentCard.question && currentCard.answer) {
                cards.push({...currentCard});
            }
            
            currentCard = {
                question: line.replace(/^Question[:：]\s*/i, '').trim(),
                answer: '',
                type: 'flashcard'
            };
            collectingAnswer = false;
        }
        
        // Pattern 3: Q: format
        else if (line.match(/^Q[:：]\s*.+/i)) {
            if (currentCard && currentCard.question && currentCard.answer) {
                cards.push({...currentCard});
            }
            
            currentCard = {
                question: line.replace(/^Q[:：]\s*/i, '').trim(),
                answer: '',
                type: 'flashcard'
            };
            collectingAnswer = false;
        }
        
        // Pattern 4: Any line ending with ? could be a question
        else if (line.includes('?') && !currentCard) {
            currentCard = {
                question: line,
                answer: '',
                type: 'flashcard'
            };
            collectingAnswer = false;
        }
        
        // Look for answer patterns
        else if (currentCard) {
            // Answer: format
            if (line.match(/^Answer[:：]\s*.+/i)) {
                currentCard.answer = line.replace(/^Answer[:：]\s*/i, '').trim();
                collectingAnswer = false;
                
                // Card is complete
                if (currentCard.question && currentCard.answer) {
                    cards.push({...currentCard});
                    currentCard = null;
                }
            }
            
            // A: format
            else if (line.match(/^A[:：]\s*.+/i)) {
                currentCard.answer = line.replace(/^A[:：]\s*/i, '').trim();
                collectingAnswer = false;
                
                if (currentCard.question && currentCard.answer) {
                    cards.push({...currentCard});
                    currentCard = null;
                }
            }
            
            // If we're collecting a multi-line answer
            else if (collectingAnswer) {
                answerText += ' ' + line;
                currentCard.answer = answerText;
            }
            
            // If this line might be the answer (shorter line after question)
            else if (currentCard.question && !currentCard.answer && line.length < 200) {
                currentCard.answer = line;
                
                if (currentCard.question && currentCard.answer) {
                    cards.push({...currentCard});
                    currentCard = null;
                }
            }
            
            // Start collecting multi-line answer (if line starts with answer indicator)
            else if (line.toLowerCase().includes('answer')) {
                collectingAnswer = true;
                answerText = line.replace(/.*answer[:：]\s*/i, '').trim();
            }
        }
    }
    
    // Don't forget the last card
    if (currentCard && currentCard.question && currentCard.answer) {
        cards.push(currentCard);
    }
    
    // If no cards found with the above method, try the simple format
    if (cards.length === 0) {
        return parseSimpleTextFormat(text);
    }
    
    return cards;
}

// =====================================================
// SIMPLE TEXT FORMAT PARSING
// =====================================================

function parseSimpleTextFormat(text) {
    const cards = [];
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length - 1; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];
        
        // Look for question/answer pairs
        if (currentLine.includes('?') && !nextLine.includes('?')) {
            cards.push({
                question: currentLine,
                answer: nextLine,
                type: 'flashcard'
            });
            i++; // Skip the answer line
        }
        // Look for numbered items without question marks
        else if (currentLine.match(/^\d+[.)]\s+.+/) && nextLine.length < 200) {
            const question = currentLine.replace(/^\d+[.)]\s*/, '');
            cards.push({
                question: question,
                answer: nextLine,
                type: 'flashcard'
            });
            i++; // Skip the answer line
        }
    }
    
    return cards;
}

// =====================================================
// DEBUG FUNCTION - Test PDF parsing with sample text
// =====================================================

function testPDFParsing() {
    const sampleText = createSamplePDFContent();
    const cards = parsePDFTextEnhanced(sampleText);
    console.log('Test parsing result:', cards);
    alert(`Test found ${cards.length} cards. Check console for details.`);
    return cards;
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    document.getElementById('import-file').addEventListener('change', importData);
    
    const pdfInput = document.getElementById('import-pdf-file');
    if (pdfInput) {
        pdfInput.addEventListener('change', importFromPDF);
    }
    
    window.onclick = function(event) {
        const modal = document.getElementById('card-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    document.getElementById('edit-type').addEventListener('change', function(e) {
        const mcOptions = document.getElementById('mc-options-edit');
        mcOptions.style.display = e.target.value === 'flashcard' ? 'block' : 'none';
    });
}

// =====================================================
// INITIALIZE
// =====================================================

console.log("Supabase client created:", supabase ? "Yes" : "No");

document.addEventListener('DOMContentLoaded', init);