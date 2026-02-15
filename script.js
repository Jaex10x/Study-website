let studyData={
cards:[
{question:"What is JavaScript?",answer:"Programming language"},
{question:"CSS stands for?",answer:"Cascading Style Sheets"},
{question:"HTML means?",answer:"Hyper Text Markup Language"}
],
currentIndex:0
};

let currentMode="flashcards";
let selectedOption=null;

document.addEventListener("DOMContentLoaded",updateDisplay);

/* MODE SWITCH */
function switchMode(mode,btn){
currentMode=mode;
studyData.currentIndex=0;
document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
updateDisplay();
}

/* DISPLAY */
function updateDisplay(){

document.querySelectorAll(".study-mode").forEach(m=>m.classList.remove("active"));
document.getElementById(currentMode+"-mode").classList.add("active");

if(studyData.cards.length===0){
document.getElementById("question-display").textContent="No questions yet";
return;
}

if(studyData.currentIndex>=studyData.cards.length)
studyData.currentIndex=0;

let card=studyData.cards[studyData.currentIndex];

document.getElementById("card-counter").textContent=
(studyData.currentIndex+1)+" / "+studyData.cards.length;

/* FLASHCARD */
if(currentMode==="flashcards"){
document.querySelector(".flashcard").classList.remove("flipped");
document.getElementById("question-display").textContent=card.question;
document.getElementById("answer-display").textContent=card.answer;
}

/* MULTIPLE CHOICE */
if(currentMode==="multiple-choice"){
document.getElementById("mc-question").textContent=card.question;
let box=document.getElementById("mc-options");
box.innerHTML="";
selectedOption=null;

let options=generateOptions(card.answer);

options.forEach((opt,i)=>{
let div=document.createElement("div");
div.textContent=opt;
div.className="option";
div.onclick=()=>{
selectedOption=i;
document.querySelectorAll(".option").forEach(o=>o.classList.remove("selected"));
div.classList.add("selected");
};
box.appendChild(div);
});
document.getElementById("mc-feedback").textContent="";
}

/* IDENTIFICATION */
if(currentMode==="identification"){
document.getElementById("id-question").textContent=card.question;
document.getElementById("id-answer").value="";
document.getElementById("id-feedback").textContent="";
}
}

/* GENERATE MC OPTIONS */
function generateOptions(correct){
let fake=[
"Computer System","Programming Tool","Web Language",
"Markup Tool","Data Format","Software Code"
];

let options=[correct];
while(options.length<4){
let r=fake[Math.floor(Math.random()*fake.length)];
if(!options.includes(r)) options.push(r);
}
return options.sort(()=>Math.random()-0.5);
}

/* NAVIGATION */
function nextCard(){
studyData.currentIndex=(studyData.currentIndex+1)%studyData.cards.length;
updateDisplay();
}

function previousCard(){
studyData.currentIndex=
(studyData.currentIndex-1+studyData.cards.length)%studyData.cards.length;
updateDisplay();
}

/* CHECK ANSWERS */
function checkMCAnswer(){
let correct=studyData.cards[studyData.currentIndex].answer;
let chosen=document.querySelector(".option.selected");
if(!chosen)return;
document.getElementById("mc-feedback").textContent=
chosen.textContent===correct?"✅ Correct!":"❌ Wrong!";
}

function checkIDAnswer(){
let input=document.getElementById("id-answer").value.toLowerCase();
let correct=studyData.cards[studyData.currentIndex].answer.toLowerCase();
document.getElementById("id-feedback").textContent=
input===correct?"✅ Correct!":"❌ Wrong!";
}

/* FLIP */
function flipCard(){
document.querySelector(".flashcard").classList.toggle("flipped");
}

/* MODAL */
function addNewCard(){
document.getElementById("card-modal").style.display="block";
}

function closeModal(){
document.getElementById("card-modal").style.display="none";
}

function saveCard(){
let q=document.getElementById("edit-question").value;
let a=document.getElementById("edit-answer").value;
if(!q||!a)return alert("Fill all fields");

studyData.cards.push({question:q,answer:a});
closeModal();
updateDisplay();
}

/* DELETE */
function deleteCurrentCard(){
if(studyData.cards.length===0)return;
studyData.cards.splice(studyData.currentIndex,1);
studyData.currentIndex=0;
updateDisplay();
}

function resetProgress(){
studyData.currentIndex=0;
updateDisplay();
}
