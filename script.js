// =====================================================
// SUPABASE CONNECTION
// =====================================================
const SUPABASE_URL = 'https://fhameymrtkygqoipftid.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ai1CllplGqlEFxfRHJguRQ_n5Uy_xE1';

// Create supabase client

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

// =====================================================
// EXISTING FUNCTIONS (your original code)
// =====================================================

// Initialize the application
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

// Update display based on current mode
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

// Update flashcard display
function updateFlashcard(card) {
    document.getElementById('question-display').textContent = card.question;
    document.getElementById('answer-display').textContent = card.answer;
    isFlipped = false;
    document.querySelector('.flashcard').classList.remove('flipped');
}

// Update multiple choice display
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

// Update identification display
function updateIdentification(card) {
    document.getElementById('id-question').textContent = card.question;
    document.getElementById('id-answer').value = '';
    document.getElementById('id-feedback').innerHTML = '';
}

// Flip card function
function flipCard() {
    if (currentMode === 'flashcards') {
        isFlipped = !isFlipped;
        document.querySelector('.flashcard').classList.toggle('flipped');
    }
}

// Navigation functions
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

// Multiple choice functions
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

// Identification functions
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

// Mode switching
function switchMode(mode) {
    currentMode = mode;
    
    // Update active buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update active mode display
    document.querySelectorAll('.study-mode').forEach(mode => mode.classList.remove('active'));
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    studyData.progress.currentCardIndex = 0;
    updateDisplay();
}

// Progress tracking
function updateProgress() {
    const totalCards = studyData.cards.length;
    const completedCards = studyData.progress.completedCards.length;
    const progress = (completedCards / totalCards) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Data management functions
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

// Add new card
function addNewCard() {
    document.getElementById('edit-question').value = '';
    document.getElementById('edit-answer').value = '';
    document.getElementById('edit-type').value = 'flashcard';
    document.getElementById('mc-options-edit').style.display = 'none';
    document.getElementById('card-modal').style.display = 'block';
}
// Function to delete the current card being edited
function deleteCurrentCard() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this card?')) {
        
        // Get the current card based on the current mode and index
        const currentCards = studyData.cards.filter(card => 
            currentMode === 'flashcards' ? card.type === 'flashcard' :
            currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
            card.type === 'identification'
        );
        
        // Get the current card
        const currentIndex = studyData.progress.currentCardIndex;
        const currentCard = currentCards[currentIndex];
        
        if (currentCard) {
            // Find and remove the card from the main cards array
            const cardIndex = studyData.cards.findIndex(c => c.id === currentCard.id);
            
            if (cardIndex !== -1) {
                // Remove the card
                studyData.cards.splice(cardIndex, 1);
                
                // Adjust current index if needed
                if (studyData.cards.length === 0) {
                    // No cards left
                    studyData.progress.currentCardIndex = 0;
                } else if (cardIndex <= studyData.progress.currentCardIndex) {
                    // If we deleted a card before or at current index, adjust
                    studyData.progress.currentCardIndex = Math.max(0, studyData.progress.currentCardIndex - 1);
                }
                
                // Save changes
                saveData();
                
                // Update the display
                updateDisplay();
                updateProgress();
                
                // Close modal if it's open
                closeModal();
                
                alert('Card deleted successfully!');
            }
        }
    }
}
// =====================================================
// UNDO FUNCTIONALITY
// =====================================================

// Function to undo the last card deletion
function undoCard() {
    if (!lastAction) {
        alert('Nothing to undo!');
        return;
    }
    
    if (lastAction.type === 'delete' && deletedCardBackup) {
        // Restore the deleted card
        studyData.cards.splice(lastAction.index, 0, deletedCardBackup);
        
        // Restore the card index if needed
        if (lastAction.index <= studyData.progress.currentCardIndex) {
            studyData.progress.currentCardIndex++;
        }
        
        // Clear the backup
        deletedCardBackup = null;
        lastAction = null;
        
        // Save and update
        saveData();
        updateDisplay();
        updateProgress();
        
        alert('Card restored successfully!');
    } 
    else if (lastAction.type === 'add') {
        // Undo last add
        studyData.cards.pop();
        
        // Adjust index if needed
        if (studyData.progress.currentCardIndex >= studyData.cards.length) {
            studyData.progress.currentCardIndex = Math.max(0, studyData.cards.length - 1);
        }
        
        lastAction = null;
        
        // Save and update
        saveData();
        updateDisplay();
        updateProgress();
        
        alert('Last card addition undone!');
    }
    else if (lastAction.type === 'edit') {
        // Restore the original card
        if (lastAction.originalCard) {
            studyData.cards[lastAction.index] = lastAction.originalCard;
            
            lastAction = null;
            
            // Save and update
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

// Modified deleteCardById function with undo support
function deleteCardById(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        
        // Find the card index and backup the card
        const cardIndex = studyData.cards.findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
            // Backup the card being deleted
            deletedCardBackup = {...studyData.cards[cardIndex]};
            
            // Store action for undo
            lastAction = {
                type: 'delete',
                index: cardIndex
            };
            
            // Store current index for potential restore
            lastCardIndex = studyData.progress.currentCardIndex;
            
            // Remove the card
            studyData.cards.splice(cardIndex, 1);
            
            // Adjust current index if needed
            if (studyData.cards.length === 0) {
                studyData.progress.currentCardIndex = 0;
            } else if (cardIndex <= studyData.progress.currentCardIndex) {
                studyData.progress.currentCardIndex = Math.max(0, studyData.progress.currentCardIndex - 1);
            }
            
            // Save and update
            saveData();
            updateDisplay();
            updateProgress();
            
            // Close modal if it's open
            closeModal();
            
            alert('Card deleted! Use "Undo" to restore if needed.');
        }
    }
}

// Modified deleteCurrentCard function with undo support
function deleteCurrentCard() {
    if (confirm('Are you sure you want to delete this card?')) {
        
        // Get the current card based on the current mode and index
        const currentCards = studyData.cards.filter(card => 
            currentMode === 'flashcards' ? card.type === 'flashcard' :
            currentMode === 'multiple-choice' ? card.type === 'flashcard' && card.options : 
            card.type === 'identification'
        );
        
        // Get the current card
        const currentIndex = studyData.progress.currentCardIndex;
        const currentCard = currentCards[currentIndex];
        
        if (currentCard) {
            // Find the card index in the main array
            const cardIndex = studyData.cards.findIndex(c => c.id === currentCard.id);
            
            if (cardIndex !== -1) {
                // Backup the card being deleted
                deletedCardBackup = {...studyData.cards[cardIndex]};
                
                // Store action for undo
                lastAction = {
                    type: 'delete',
                    index: cardIndex
                };
                
                // Store current index
                lastCardIndex = studyData.progress.currentCardIndex;
                
                // Remove the card
                studyData.cards.splice(cardIndex, 1);
                
                // Adjust current index if needed
                if (studyData.cards.length === 0) {
                    studyData.progress.currentCardIndex = 0;
                } else if (cardIndex <= studyData.progress.currentCardIndex) {
                    studyData.progress.currentCardIndex = Math.max(0, studyData.progress.currentCardIndex - 1);
                }
                
                // Save and update
                saveData();
                updateDisplay();
                updateProgress();
                
                // Close modal if it's open
                closeModal();
                
                alert('Card deleted! Use "Undo" to restore.');
            }
        }
    }
}

// Modified saveCard function for add/edit with undo support
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
            // Backup original for undo
            const originalCard = {...studyData.cards[cardIndex]};
            
            // Update card
            studyData.cards[cardIndex].question = question;
            studyData.cards[cardIndex].answer = answer;
            studyData.cards[cardIndex].type = type;
            
            // Handle options for multiple choice
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
            
            // Store action for undo
            lastAction = {
                type: 'edit',
                index: cardIndex,
                originalCard: originalCard
            };
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
        
        // Store action for undo
        lastAction = {
            type: 'add'
        };
    }
    
    saveData();
    closeModal();
    updateDisplay();
    showCardList(); // Refresh card list if it's visible
    
    if (lastAction.type === 'add') {
        alert('Card added! Use "Undo" to remove if needed.');
    } else if (lastAction.type === 'edit') {
        alert('Card edited! Use "Undo" to revert if needed.');
    }
}

// Save card
function saveCard() {
    const question = document.getElementById('edit-question').value;
    const answer = document.getElementById('edit-answer').value;
    const type = document.getElementById('edit-type').value;
    
    if (!question || !answer) {
        alert('Please fill in all fields!');
        return;
    }
    
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
            newCard.correctOption = 0; // Default to first option
        }
    }
    
    studyData.cards.push(newCard);
    saveData();
    closeModal();
    updateDisplay();
}

// Reset progress
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

// Helper functions
function showNoCardsMessage() {
    const modeDisplay = document.getElementById(`${currentMode}-mode`);
    modeDisplay.innerHTML = `<div class="no-cards">No cards available in this mode. Add some cards to start studying!</div>`;
}

function closeModal() {
    document.getElementById('card-modal').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('import-file').addEventListener('change', importData);
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('card-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Show/hide multiple choice options based on type selection
    document.getElementById('edit-type').addEventListener('change', function(e) {
        const mcOptions = document.getElementById('mc-options-edit');
        mcOptions.style.display = e.target.value === 'flashcard' ? 'block' : 'none';
    });
}
// =====================================================
// PDF EXPORT/IMPORT FUNCTIONS
// =====================================================

// Export to PDF
async function exportToPDF() {
    try {
        // Check if jspdf is available, if not load it dynamically
        if (typeof window.jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Study Master - Flashcard Set', 20, 20);
        
        // Add date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Add statistics
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Cards: ${studyData.cards.length}`, 20, 40);
        
        // Count by type
        const flashcardCount = studyData.cards.filter(c => c.type === 'flashcard').length;
        const mcCount = studyData.cards.filter(c => c.type === 'flashcard' && c.options).length;
        const idCount = studyData.cards.filter(c => c.type === 'identification').length;
        
        doc.text(`Flashcards: ${flashcardCount}`, 20, 48);
        doc.text(`Multiple Choice: ${mcCount}`, 20, 56);
        doc.text(`Identification: ${idCount}`, 20, 64);
        
        // Add cards
        let yPosition = 80;
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('Cards:', 20, yPosition);
        yPosition += 10;
        
        studyData.cards.forEach((card, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`${index + 1}. ${card.question}`, 20, yPosition);
            yPosition += 7;
            
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`   Answer: ${card.answer}`, 20, yPosition);
            yPosition += 5;
            
            if (card.type === 'flashcard' && card.options) {
                doc.setTextColor(150, 100, 200);
                doc.text(`   Options: ${card.options.join(' • ')}`, 20, yPosition);
                doc.setTextColor(40, 150, 40);
                doc.text(`   Correct: ${card.options[card.correctOption]}`, 20, yPosition + 5);
                yPosition += 10;
            }
            
            doc.setTextColor(150, 150, 150);
            doc.text(`   Type: ${card.type}`, 20, yPosition);
            yPosition += 10;
            
            // Add separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition - 3, 190, yPosition - 3);
            yPosition += 5;
        });
        
        // Save the PDF
        doc.save('study-master-cards.pdf');
        alert('PDF exported successfully!');
        
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Error exporting to PDF. Please try again.');
    }
}

// Import from PDF (using OCR or structured PDF)
async function importFromPDF(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        // Check if pdf.js is available
        if (typeof window.pdfjsLib === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
        }
        
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                
                // Load the PDF
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                // Extract text from all pages
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                // Parse the text to extract cards
                const importedCards = parsePDFText(fullText);
                
                if (importedCards.length > 0) {
                    // Ask user how to handle import
                    const action = confirm(`Found ${importedCards.length} cards in PDF. Add to existing cards? Click OK to add, Cancel to replace.`);
                    
                    if (action) {
                        // Add to existing cards
                        importedCards.forEach(card => {
                            card.id = Date.now() + Math.random();
                            studyData.cards.push(card);
                        });
                        alert(`Added ${importedCards.length} cards to your collection!`);
                    } else {
                        // Replace existing cards
                        studyData.cards = importedCards.map((card, index) => ({
                            ...card,
                            id: index + 1
                        }));
                        studyData.progress.currentCardIndex = 0;
                        alert(`Replaced with ${importedCards.length} cards from PDF!`);
                    }
                    
                    saveData();
                    updateDisplay();
                    updateProgress();
                } else {
                    alert('No cards could be extracted from the PDF. Make sure it contains study cards in a readable format.');
                }
                
            } catch (error) {
                console.error('Error reading PDF:', error);
                alert('Error reading PDF file. Please make sure it\'s a valid PDF.');
            }
        };
        
        reader.readAsArrayBuffer(file);
        
    } catch (error) {
        console.error('Error loading PDF library:', error);
        alert('Error loading PDF library. Please try again.');
    }
}

// Helper function to parse PDF text into cards
function parsePDFText(text) {
    const cards = [];
    const lines = text.split('\n');
    
    let currentCard = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Look for question patterns
        if (line.match(/^\d+\.\s+.+/) || line.match(/^Q[:：]\s*.+/i) || line.match(/^Question[:：]\s*.+/i)) {
            // Save previous card if exists
            if (currentCard && currentCard.question && currentCard.answer) {
                cards.push(currentCard);
            }
            
            // Start new card
            currentCard = {
                id: cards.length + 1,
                question: line.replace(/^\d+\.\s*|^Q[:：]\s*|^Question[:：]\s*/i, '').trim(),
                answer: '',
                type: 'flashcard'
            };
        }
        // Look for answer patterns
        else if (currentCard && (line.match(/^A[:：]\s*.+/i) || line.match(/^Answer[:：]\s*.+/i))) {
            currentCard.answer = line.replace(/^A[:：]\s*|^Answer[:：]\s*/i, '').trim();
        }
        // Look for options (multiple choice)
        else if (currentCard && line.match(/^[a-dA-D][.)]\s*.+/)) {
            if (!currentCard.options) {
                currentCard.options = [];
                currentCard.type = 'flashcard'; // multiple choice
            }
            currentCard.options.push(line.replace(/^[a-dA-D][.)]\s*/, '').trim());
        }
        // If line has "answer" in it
        else if (currentCard && line.toLowerCase().includes('answer:')) {
            currentCard.answer = line.split('answer:')[1].trim();
        }
    });
    
    // Add last card
    if (currentCard && currentCard.question && currentCard.answer) {
        cards.push(currentCard);
    }
    
    return cards;
}

// Helper function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
function setupEventListeners() {
    document.getElementById('import-file').addEventListener('change', importData);
    
    // Add PDF import listener
    const pdfInput = document.getElementById('import-pdf-file');
    if (pdfInput) {
        pdfInput.addEventListener('change', importFromPDF);
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('card-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Show/hide multiple choice options based on type selection
    document.getElementById('edit-type').addEventListener('change', function(e) {
        const mcOptions = document.getElementById('mc-options-edit');
        mcOptions.style.display = e.target.value === 'flashcard' ? 'block' : 'none';
    });
}
// =====================================================
// SIMPLE TEST
// =====================================================
console.log("Supabase client created:", supabase ? "Yes" : "No");

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', init);