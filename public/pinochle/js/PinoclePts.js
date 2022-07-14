var pinpts2 = document.querySelector("#pinpts");
var runpts2 = document.querySelector("#runpts");
var marpts2 = document.querySelector("#marpts");
var martpts2 = document.querySelector("#martpts");
var aapts2 = document.querySelector("#aapts");
var kapts2 = document.querySelector("#kapts");
var qapts2 = document.querySelector("#qapts");
var japts2 = document.querySelector("#japts");
var ntpts2 = document.querySelector("#ntpts");
var marapts2 = document.querySelector("#marapts");
var dpinpts2 = document.querySelector("#dpinpts");
var drunpts2 = document.querySelector("#drunpts");
var dmarpts2 = document.querySelector("#dmarpts");
var daapts2 = document.querySelector("#daapts");
var dkapts2 = document.querySelector("#dkapts");
var dqapts2 = document.querySelector("#dqapts");
var djapts2 = document.querySelector("#djapts");

var pinpts = Number(pinpts2.value);
var runpts = Number(runpts2.value);
var marpts = Number(marpts2.value);
var martpts = Number(martpts2.value);
var aapts = Number(aapts2.value);
var kapts = Number(kapts2.value);
var qapts = Number(qapts2.value);
var japts = Number(japts2.value);
var ninepts = Number(ntpts2.value);
var marapts = Number(marapts2.value);

var dpinpts = Number(dpinpts2.value);
var drunpts = Number(drunpts2.value);
var dmarpts = Number(dmarpts2.value);
var daapts = Number(daapts2.value);
var dkapts = Number(dkapts2.value);
var dqapts = Number(dqapts2.value);
var djapts = Number(djapts2.value);
var gameOver = true;

pinpts2.addEventListener("change", function() {
    pinpts = Number(this.value);
});

runpts2.addEventListener("change", function() {
    runpts = Number(this.value);
});

marpts2.addEventListener("change", function() {
    marpts = Number(this.value);
});

martpts2.addEventListener("change", function() {
    martpts = Number(this.value);
});

aapts2.addEventListener("change", function() {
    aapts = Number(this.value);
});

kapts2.addEventListener("change", function() {
    kapts = Number(this.value);
});

qapts2.addEventListener("change", function() {
    qapts = Number(this.value);
});

japts2.addEventListener("change", function() {
    japts = Number(this.value);
});

ntpts2.addEventListener("change", function() {
    ntpts = Number(this.value);
});

marapts2.addEventListener("change", function() {
    marapts = Number(this.value);
});

dpinpts2.addEventListener("change", function() {
    dpinpts = Number(this.value);
});

drunpts2.addEventListener("change", function() {
    drunpts = Number(this.value);
});

dmarpts2.addEventListener("change", function() {
    dmarpts = Number(this.value);
});

daapts2.addEventListener("change", function() {
    daapts = Number(this.value);
});

dkapts2.addEventListener("change", function() {
    dkapts = Number(this.value);
});

dqapts2.addEventListener("change", function() {
    dqapts = Number(this.value);
});

djapts2.addEventListener("change", function() {
    djapts = Number(this.value);
});

var chgMScoreBut = document.querySelector(".chg-m-score");
var chgMScore = document.querySelectorAll(".scores");

chgMScoreBut.addEventListener("click", function() {
    for(var i = 0; i < chgMScore.length; i++) {
        chgMScore[i].classList.toggle("hidden");
    };
});

chgMScoreBut.addEventListener("mouseover", function(){
        this.classList.add("chg-m-score2");
        this.classList.remove("chg-m-score");
});
chgMScoreBut.addEventListener("mouseout", function(){
        this.classList.add("chg-m-score");
        this.classList.remove("chg-m-score2");
});