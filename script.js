let studyData={
cards:[
{question:"What is JavaScript?",answer:"Programming language",type:"flashcards"},
{question:"CSS stands for?",answer:"Cascading Style Sheets",type:"multiple-choice",
options:["Cascading Style Sheets","Computer Style","Creative Style"],
correctOption:0},
{question:"HTML means?",answer:"Hyper Text Markup Language",type:"identification"}
],
currentIndex:0
};

let currentMode="flashcards";
let selectedOption=null;

document.addEventListener("DOMContentLoaded",updateDisplay);

function getFiltered(){
return studyData.cards.filter(c=>c.type===currentMode);
}

function updateDisplay(){
document.querySelectorAll(".study-mode").forEach(m=>m.classList.remove("active"));
document.getElementById(currentMode+"-mode").classList.add("active");

let cards=getFiltered();
if(cards.length===0){
document.getElementById("question-display").textContent="No cards yet";
return;
}

if(studyData.currentIndex>=cards.length) studyData.currentIndex=0;

let card=cards[studyData.currentIndex];

let counter=document.getElementById("card-counter");
if(counter) counter.textContent=(studyData.currentIndex+1)+" / "+cards.length;

if(currentMode==="flashcards"){
document.getElementById("question-display").textContent=card.question;
document.getElementById("answer-display").textContent=card.answer;
}

if(currentMode==="multiple-choice"){
document.getElementById("mc-question").textContent=card.question;
let box=document.getElementById("mc-options");
box.innerHTML="";
card.options.forEach((opt,i)=>{
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

if(currentMode==="identification"){
document.getElementById("id-question").textContent=card.question;
document.getElementById("id-feedback").textContent="";
document.getElementById("id-answer").value="";
}
}

function nextCard(){
let total=getFiltered().length;
if(total===0)return;
studyData.currentIndex=(studyData.currentIndex+1)%total;
updateDisplay();
}

function previousCard(){
let total=getFiltered().length;
if(total===0)return;
studyData.currentIndex=(studyData.currentIndex-1+total)%total;
updateDisplay();
}

function switchMode(mode){
currentMode=mode;
studyData.currentIndex=0;
document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
event.target.classList.add("active");
updateDisplay();
}

function flipCard(){
document.querySelector(".flashcard").classList.toggle("flipped");
}

function checkMCAnswer(){
let card=getFiltered()[studyData.currentIndex];
let feedback=document.getElementById("mc-feedback");
if(selectedOption===card.correctOption){
feedback.textContent="✅ Correct!";
}else{
feedback.textContent="❌ Wrong!";
}
}

function checkIDAnswer(){
let input=document.getElementById("id-answer").value.toLowerCase();
let card=getFiltered()[studyData.currentIndex];
let feedback=document.getElementById("id-feedback");
feedback.textContent=input===card.answer.toLowerCase()?"✅ Correct!":"❌ Wrong!";
}

function addNewCard(){
document.getElementById("card-modal").style.display="block";
}

function closeModal(){
document.getElementById("card-modal").style.display="none";
}

document.getElementById("edit-type").addEventListener("change",e=>{
document.getElementById("mc-options-edit").style.display=
e.target.value==="multiple-choice"?"block":"none";
});

function saveCard(){
let q=document.getElementById("edit-question").value;
let a=document.getElementById("edit-answer").value;
let t=document.getElementById("edit-type").value;
let opt=document.getElementById("edit-options").value;

if(!q||!a)return alert("Fill all fields");

let newCard={question:q,answer:a,type:t};

if(t==="multiple-choice"){
let arr=opt.split(",").map(x=>x.trim());
if(arr.length<2)return alert("Need 2+ options");
newCard.options=arr;
newCard.correctOption=0;
}

studyData.cards.push(newCard);
closeModal();
updateDisplay();
}

function deleteCurrentCard(){
let cards=getFiltered();
if(cards.length===0)return;

let globalIndex=studyData.cards.indexOf(cards[studyData.currentIndex]);
studyData.cards.splice(globalIndex,1);

studyData.currentIndex=0;
updateDisplay();
}

function resetProgress(){
studyData.currentIndex=0;
updateDisplay();
}
