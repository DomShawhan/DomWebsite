var nhover = document.querySelectorAll(".nhover");
var aboutHover = document.querySelectorAll(".play");
var dhover = document.querySelectorAll(".dhove");
var p1Class = document.querySelectorAll(".p1C");
var p2Class = document.querySelectorAll(".p2C");
var p3Class = document.querySelectorAll(".p3C");
var p1 = document.querySelector("#p1");   
var p2 = document.querySelector("#p2"); 
var p3 = document.querySelector("#p3");
var winnerss = document.querySelector("#winners");
var bidIn = document.querySelector("#bidd");
var bidded;
var chgWscore = document.querySelector("#chg-w-score");
var wScoreDisplay = document.querySelector("#win-score");
var winScore = 1500;
var chngP1N = document.querySelector("#chgP1N");
var chngP2N = document.querySelector("#chgP2N");
var chngP3N = document.querySelector("#chgP3N");
var points = [
    document.querySelector("#p1points"),
    document.querySelector("#p2points"),
    document.querySelector("#p3points")];
var points2 = [0, 0, 0];
var addt;
var roundScore = [
    document.querySelector("#p1rs"),
    document.querySelector("#p2rs"),
    document.querySelector("#p3rs")];
var rScore = [0, 0, 0];
var mScore = [0, 0, 0];
var meldScore = [
    document.querySelector("#p1ms"),
    document.querySelector("#p2ms"),
    document.querySelector("#p3ms")];
var tScore = [0, 0, 0];
var totalScore = [
    document.querySelector("#p1ts"),
    document.querySelector("#p2ts"),
    document.querySelector("#p3ts")];
var twoT = document.querySelector("#twop")
var addRS = document.querySelector("#rb");
var pin = document.querySelector("#pin");
var run = document.querySelector("#run");
var mar = document.querySelector("#mar");
var mart = document.querySelector("#mart");
var aa = document.querySelector("#aa");
var ka = document.querySelector("#ka");
var qa = document.querySelector("#qa");
var ja = document.querySelector("#ja");
var nt = document.querySelector("#nt");
var dpin = document.querySelector("#dpin");
var drun = document.querySelector("#drun");
var dmar = document.querySelector("#dmar");
var daa = document.querySelector("#daa");
var dka = document.querySelector("#dka");
var dqa = document.querySelector("#dqa");
var dja = document.querySelector("#dja");
var mara = document.querySelector("#mara");
var nh = document.querySelector("#nh");
var p1b = document.querySelector("#p1b");
var p2b = document.querySelector("#p2b");
var p3b = document.querySelector("#p3b");
var p1meld = document.querySelector("#p1rm");
var p2meld = document.querySelector("#p2rm");
var p3meld = document.querySelector("#p3rm");
var p1total = document.querySelector("#p1tm");
var p2total = document.querySelector("#p2tm");
var p3total = document.querySelector("#p3tm");
var p1e2 = document.querySelectorAll(".p1e2");
var body = document.querySelector("body");
var gQS = document.querySelector(".glyphicon-question-sign");
var tutor = document.querySelectorAll(".tutorial");
var restartGame = document.querySelector("#rg");
var changeTheme = document.querySelectorAll(".chg-theme");
var setup = document.querySelectorAll(".setup");
var startGame = document.querySelector(".start-game");
var playGame = document.querySelectorAll(".play-game");
var p1e2a = document.querySelectorAll(".p1e2a");
var clickMeld = document.querySelector(".click-meld");
var endGame = document.querySelector(".end-game");
var digits = [
    document.querySelector("#Ones"),
    document.querySelector("#Tens")];
var roundNumber = document.querySelector("#round-number");
var roundN = 1;
var threePlayer = true;
var addRScore = false;

for(var i = 0; i < changeTheme.length; i++) {
    changeTheme[i].addEventListener("click", toggleTheme);
};

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

function toggleTheme() {
   if(localStorage.getItem('theme') === 'theme-dark'){
       setTheme('theme-light');
   } else {
       setTheme('theme-dark');
   }
}

(function () {
   if(localStorage.getItem('theme') === 'theme-dark') {
       setTheme('theme-dark');
   } else {
       setTheme('theme-light');
   }
})();

function digits1() {
    if(digits[0].checked) {
        bidIn.min = 15;
        bidIn.max = 175;
    } else if(digits[1].checked){
        bidIn.min = 150;
        bidIn.max = 1750;
    };
};

function pclicked() {
    p1.classList.remove("pclicked");
    p2.classList.remove("pclicked");
    p3.classList.remove("pclicked");
};

function btmList() {
    roundNumber.innerHTML += "<br><div>Hand #" + roundN++ + "</div><br><br><hr class=\"hrms\">";
    p1total.innerHTML += "<div>Meld = " + mScore[0] + "</div>" + "<div>Points = " + points2[0] * 10 + "</div>" + "<div>Total = " + tScore[0] + "</div>" + "<hr class=\"hrms\">";
    p2total.innerHTML += "<div>Meld = " + mScore[1] + "</div>" + "<div>Points = " + points2[1] * 10 + "</div>" + "<div>Total = " + tScore[1] + "</div>" + "<hr class=\"hrms\">";
    p3total.innerHTML += "<div>Meld = " + mScore[2] + "</div>" + "<div>Points = " + points2[2] * 10 + "</div>" + "<div>Total = " + tScore[2] + "</div>" + "<hr class=\"hrms\">";
};

function winner () {
    if(tScore[0] >= winScore) {
        p1Class[5].classList.add("winner");
        p1.classList.add("winner");
        pclicked();
        gameOver = true;
        winnerss.innerHTML = p1.innerHTML + " WINS!!! "
        setup1();
        clickMeld.classList.add("hidden");
        endGame.classList.add("center");
        endGame.classList.remove("col-xs-6");
    } else if(tScore[1] >= winScore) {
        p2Class[5].classList.add("winner");
        p2.classList.add("winner");
        pclicked();
        gameOver = true;
        winnerss.innerHTML = p2.innerHTML + " WINS!!! "
        setup1();
        clickMeld.classList.add("hidden");
        endGame.classList.add("center");
        endGame.classList.remove("col-xs-6");
    } else if(tScore[2] >= winScore) {
        p3Class[6].classList.add("winner");
        p3.classList.add("winner");
        pclicked();
        gameOver = true;
        winnerss.innerHTML = p3.innerHTML +" WINS!!! "
        setup1();
        clickMeld.classList.add("hidden");
        endGame.classList.add("center");
        endGame.classList.remove("col-xs-6");
    };
};

function newhand() {
    if(gameOver === false) {
        addRScore = false;
        
        mScore[0] = 0;
        mScore[1] = 0;
        mScore[2] = 0;
    
        points2[0] = 0;
        points2[1] = 0;
        points2[2] = 0;

        rScore[0] = 0;
        rScore[1] = 0;
        rScore[2] = 0;

        meldScore[0].textContent = mScore[0];
        meldScore[1].textContent = mScore[1];
        meldScore[2].textContent = mScore[2];

        roundScore[0].textContent = rScore[0];
        roundScore[1].textContent = rScore[1];
        roundScore[2].textContent = rScore[2];
        
        p1meld.innerHTML = "";
        p2meld.innerHTML = "";
        p3meld.innerHTML = "";
        
        points[0].value = 0;
        points[1].value = 0;
        points[2].value = 0;
        
        bidIn.value = 0;
        bidIn.select();
        bidded = 0;
        
        pclicked();
    };
};

function meld(num, name) {
    if(p1.classList.contains("pclicked")) {
        mScore[0] += Number(num);
        rScore[0] += Number(num);
        roundScore[0].textContent = rScore[0];
        meldScore[0].textContent = mScore[0];
        p1meld.innerHTML += "<div> " + name + "</div>";
    } else if(p2.classList.contains("pclicked")) {
        mScore[1] += Number(num);
        rScore[1] += Number(num);
        roundScore[1].textContent = rScore[1];
        meldScore[1].textContent = mScore[1];
        p2meld.innerHTML += "<div> " + name + "</div>";
    } else if(p3.classList.contains("pclicked")) {
        mScore[2] += Number(num);
        rScore[2] += Number(num);
        roundScore[2].textContent = rScore[2];
        meldScore[2].textContent = mScore[2];
        p3meld.innerHTML += "<div> " + name + "</div>";
    } else {
        alert("CLICK A PLAYER!!!!!!!");
    };
};

function addRSC() {
    if(addt !== 0){
        if(points2[0] == 0) {
            rScore[0] = 0;
        };
        if(points2[1] == 0) {
            rScore[1] = 0;
        };
        if(points2[2] == 0) {
            rScore[2] = 0;
        };
    };
    
    tScore[0] += rScore[0];
    tScore[1] += rScore[1];
    tScore[2] += rScore[2];
    
    pclicked();
    bidShow();

    totalScore[0].textContent = tScore[0];
    totalScore[1].textContent = tScore[1];
    totalScore[2].textContent = tScore[2];
    
    winner();
    
    addRScore = true;
};

function bidShow() {
    if(p1b.checked) {
        p1total.innerHTML += "<div>Bid = " + bidded + "</div>";
        p2total.innerHTML += "<br>";
        p3total.innerHTML += "<br>";
        btmList();
    } else if(p2b.checked) {
        p1total.innerHTML += "<br>";
        p2total.innerHTML += "<div>Bid = " + bidded + "</div>";
        p3total.innerHTML += "<br>";
        btmList();
    } else if(p3b.checked) {
        p1total.innerHTML += "<br>";
        p2total.innerHTML += "<br>";
        p3total.innerHTML += "<div>Bid = " + bidded + "</div>";
        btmList();
    };
};

function newGamef() {
    gameOver = false;
    addRScore = false;
    
    mScore[0] = 0;
    mScore[1] = 0;
    mScore[2] = 0;
    
    points2[0] = 0;
    points2[1] = 0;
    points2[2] = 0;
    
    rScore[0] = 0;
    rScore[1] = 0;
    rScore[2] = 0;
    
    tScore[0] = 0;
    tScore[1] = 0;
    tScore[2] = 0;
    
    meldScore[0].textContent = mScore[0];
    meldScore[1].textContent = mScore[1];
    meldScore[2].textContent = mScore[2];

    roundScore[0].textContent = rScore[0];
    roundScore[1].textContent = rScore[1];
    roundScore[2].textContent = rScore[2];
    
    totalScore[0].textContent = tScore[0];
    totalScore[1].textContent = tScore[1];
    totalScore[2].textContent = tScore[2];
    
    p1.classList.remove("winner");
    p2.classList.remove("winner");
    p3.classList.remove("winner");
    
    pclicked();
    
    p1Class[5].classList.remove("winner");
    p2Class[5].classList.remove("winner");
    p3Class[6].classList.remove("winner");
    
    p1meld.innerHTML = "";
    p2meld.innerHTML = "";
    p3meld.innerHTML = "";
    
    p1total.innerHTML = "";
    p2total.innerHTML = "";
    p3total.innerHTML = "";
    roundNumber.innerHTML = "";
    winnerss.innerHTML = "";
        
    points[0].value = 0;
    points[1].value = 0;
    points[2].value = 0;
        
    bidIn.value = 0;
    bidIn.select();
    bidded = 0;
};

function p2e1add() {
    for(var i = 0; i < p1e2.length; i++) {
        p1e2[i].classList.remove("col-xs-4");
        p1e2[i].classList.add("col-xs-6");
    };
};

function p2e1remove() {
    for(var i = 0; i < p1e2.length; i++) {
        p1e2[i].classList.remove("col-xs-6");
        p1e2[i].classList.add("col-xs-4");
    };
};

function p2e1aadd() {
    for(var i = 0; i < p1e2a.length; i++) {
        p1e2a[i].classList.remove("col-xs-3");
        p1e2a[i].classList.add("col-xs-4");
    };
};

function p2e1aremove() {
    for(var i = 0; i < p1e2a.length; i++) {
        p1e2a[i].classList.remove("col-xs-4");
        p1e2a[i].classList.add("col-xs-3");
    };
};

function setup1() {
    for(var i = 0; i < setup.length; i++) {
        if(gameOver === true) {
            setup[i].classList.remove("hidden");
        } else if(gameOver === false) {
            setup[i].classList.add("hidden");
        };
    };
};

function playG() {
    for(var i = 0; i < playGame.length; i++) {
        if(gameOver === true) {
            playGame[i].classList.add("hidden");
        } else if(gameOver === false) {
            playGame[i].classList.remove("hidden");
        };
    };
};

function meldss() {
    if(digits[0].checked) {
        pinpts2.value = 4;
        runpts2.value = 15;
        marpts2.value = 2;
        martpts2.value = 4;
        aapts2.value = 10;
        kapts2.value = 8;
        qapts2.value = 6;
        japts2.value = 4;
        ntpts2.value = 1;
        marapts2.value = 24;

        dpinpts2.value = 40;
        drunpts2.value = 150;
        dmarpts2.value = 40;
        daapts2.value = 100;
        dkapts2.value = 80;
        dqapts2.value = 60;
        djapts2.value = 40;

        pinpts = Number(pinpts2.value);
        runpts = Number(runpts2.value);
        marpts = Number(marpts2.value);
        martpts = Number(martpts2.value);
        acepts = Number(aapts2.value);
        kingpts = Number(kapts2.value);
        queenpts = Number(qapts2.value);
        jackpts = Number(japts2.value);
        ninepts = Number(ntpts2.value);
        marapts = Number(marapts2.value);

        dPinPts = Number(dpinpts2.value);
        dRunPts = Number(drunpts2.value);
        dMarPts = Number(dmarpts2.value);
        dAcesPts = Number(daapts2.value);
        dkingsPts = Number(dkapts2.value);
        dQueensPts = Number(dqapts2.value);
        dJacksPts = Number(djapts2.value);
        chgWscore.value = 150;
        bidIn.step = 1;
        winScore = Number(chgWscore.value);
    } else {
        pinpts2.value = 40;
        runpts2.value = 150;
        marpts2.value = 20;
        martpts2.value = 40;
        aapts2.value = 100;
        kapts2.value = 80;
        qapts2.value = 60;
        japts2.value = 40;
        ntpts2.value = 10;
        marapts2.value = 240;

        dpinpts2.value = 400;
        drunpts2.value = 1500;
        dmarpts2.value = 400;
        daapts2.value = 1000;
        dkapts2.value = 800;
        dqapts2.value = 600;
        djapts2.value = 400;

        pinpts = Number(pinpts2.value);
        runpts = Number(runpts2.value);
        marpts = Number(marpts2.value);
        martpts = Number(martpts2.value);
        acepts = Number(aapts2.value);
        kingpts = Number(kapts2.value);
        queenpts = Number(qapts2.value);
        jackpts = Number(japts2.value);
        ninepts = Number(ntpts2.value);
        marapts = Number(marapts2.value);

        dPinPts = Number(dpinpts2.value);
        dRunPts = Number(drunpts2.value);
        dMarPts = Number(dmarpts2.value);
        dAcesPts = Number(daapts2.value);
        dkingsPts = Number(dkapts2.value);
        dQueensPts = Number(dqapts2.value);
        dJacksPts = Number(djapts2.value);
        chgWscore.value = 1500;
        bidIn.step = 10;
        winScore = Number(chgWscore.value);
    };
};

gQS.addEventListener("click", function() {
    for(var i = 0; i < tutor.length; i++) {
        tutor[i].classList.toggle("hidden");
    };
});


restartGame.addEventListener("click", function(){
    gameOver = true;
    setup1();
    endGame.classList.remove("col-xs-6");
    endGame.classList.add("center");
    clickMeld.classList.add("hidden");
});

digits[0].addEventListener("click", function() {
    meldss();
});

digits[1].addEventListener("click", function() {
    meldss();
});

startGame.addEventListener("mouseover", function() {
    this.classList.add("startG");
    this.classList.remove("start-game");
});

startGame.addEventListener("mouseout", function(){
    this.classList.remove("startG");
    this.classList.add("start-game");
});

startGame.addEventListener("click", function() {
    gameOver = false;
    digits1();
    setup1();
    playG();
    newGamef();
    endGame.classList.add("col-xs-6");
    endGame.classList.remove("center");
    roundN = 1;
    wScoreDisplay.innerHTML = winScore;
});

twoT.addEventListener("click", function() {
    if(threePlayer === true) {
        for(var i = 0; i < p3Class.length; i++) {
            p3Class[i].classList.add("hidden");
        };
        p2e1add();
        p2e1aadd();
        chngP1N.placeholder = "Change Team 1 Name";
        chngP2N.placeholder = "Change Team 2 Name";
        p1.textContent = "Team 1";
        p2.textContent = "Team 2";
        twoT.textContent = "3 players";
        threePlayer = false;
    } else {
        for(var i = 0; i < p3Class.length; i++) {
            p3Class[i].classList.remove("hidden");
        };
        p2e1remove();
        p2e1aremove();
        chngP1N.placeholder = "Change Player 1 Name";
        chngP2N.placeholder = "Change Player 2 Name";
        p1.textContent = "Player 1";
        p2.textContent = "Player 2";
        twoT.textContent = "2 teams";
        threePlayer = true;
    };
});

for(var i = 0; i < points.length; i++) {
    points[i].addEventListener("click", function() {
        this.select();
    });
};

chngP1N.addEventListener("change", function() {
    if(this.value === "") {
        p1.textContent = "Player 1";
    } else {
        p1.textContent = this.value;
    }
});

chngP2N.addEventListener("change", function() {
    if(this.value === "") {
        p2.textContent = "Player 2";
    } else {
        p2.textContent = this.value;
    }
});

chngP3N.addEventListener("change", function() {
    if(this.value === "") {
        p3.textContent = "Player 3";
    } else {
        p3.textContent = this.value;
    }
});

chgWscore.addEventListener("change", function() {
    if(Number(this.value == 0)) {
        winScore = 1500;
        wScoreDisplay.textContent = winScore;
    } else {
        winScore = Number(this.value);
        wScoreDisplay.textContent = winScore;
    };
});

for(var i = 0; i < nhover.length; i++) {
    nhover[i].addEventListener("mouseover", function() {
        this.classList.add("hover");
        this.classList.remove("nhover")
    });
    nhover[i].addEventListener("mouseout", function(){
        this.classList.remove("hover");
        this.classList.add("nhover");
    });
};

for(var i = 0; i < aboutHover.length; i++) {
    aboutHover[i].addEventListener("mouseover",   function(){
        this.classList.add("hover2");
        this.classList.remove("play");
    });
    aboutHover[i].addEventListener("click", function() {
        this.classList.remove("hover2");
    });
    aboutHover[i].addEventListener("mouseout",     function(){
        this.classList.remove("hover2");
        this.classList.add("play");
    })
};

for(var i = 0; i < dhover.length; i++) {
    dhover[i].addEventListener("mouseover", function(){
        this.classList.add("dhover");
        this.classList.remove("dhove");
    });
    dhover[i].addEventListener("mouseout", function(){
        this.classList.remove("dhover");
        this.classList.add("dhove");
    });
};

bidIn.addEventListener("change", function() {
    if(gameOver === false) {
        bid = Number(this.value);
        bidded = bid;
    };
});

p1.addEventListener("click", function(){
    if(gameOver === false) {
        p2.classList.remove("pclicked");
        p3.classList.remove("pclicked");
        this.classList.toggle("pclicked");
    };
});
p2.addEventListener("click", function(){
    if(gameOver === false) {
        p1.classList.remove("pclicked");
        p3.classList.remove("pclicked");
        this.classList.toggle("pclicked");
    };
});
p3.addEventListener("click", function(){
    if(gameOver === false) {
        p1.classList.remove("pclicked");
        p2.classList.remove("pclicked");
        this.classList.toggle("pclicked");
    };
});

points[0].addEventListener("change", function() {
    if(gameOver === false) {
        points2[0] = Number(this.value);
        if(digits[0].checked) {
            rScore[0] = (Number(this.value)) + mScore[0];
        } else if(digits[1].checked) {
            rScore[0] = (Number(this.value) * 10) + mScore[0];
        };
        roundScore[0].textContent = rScore[0];
    };
});

points[1].addEventListener("change", function() {
    if(gameOver === false) {
        points2[1] = Number(this.value);
        if(digits[0].checked) {
            rScore[1] = (Number(this.value)) + mScore[1];
        } else if(digits[1].checked) {
            rScore[1] = (Number(this.value) * 10) + mScore[1];
        };
        roundScore[1].textContent = rScore[1];
    };
});

points[2].addEventListener("change", function() {
    if(gameOver === false) {
        points2[2] = Number(this.value);
        if(digits[0].checked) {
            rScore[2] = (Number(this.value)) + mScore[2];
        } else if(digits[1].checked) {
            rScore[2] = (Number(this.value) * 10) + mScore[2];
        };
        roundScore[2].textContent = rScore[2];
    };
});


addRS.addEventListener("click", function(){
    if(gameOver === false) {
        addt = points2[0] + points2[1] + points2[2];
        if(addRScore === false){
            if(addt > 25) {
                alert("TOO MANY POINTS!!");
            } else if(addt < 25 && addt > 0) {
                alert("NOT ENOUGH POINTS!!");
            } else {
                if(bidded === 0) {
                    alert("Enter Bid!!!!!!!!!");
                }else if(p1b.checked && rScore[0] >= bidded) {
                    addRSC();
                } else if(p2b.checked && rScore[1] >= bidded) {
                    addRSC();
                } else if(p3b.checked && rScore[2] >= bidded) {
                    addRSC();
                } else if(p1b.checked && rScore[0] < bidded) {
                    if(addt !== 0){
                        if(points2[0] == 0) {
                            rScore[0] = 0;
                        };
                        if(points2[1] == 0) {
                            rScore[1] = 0;
                        };
                        if(points2[2] == 0) {
                            rScore[2] = 0;
                        };
                    };
                    tScore[0] -= Number(bidIn.value);
                    tScore[1] += rScore[1];
                    tScore[2] += rScore[2];
                    
                    
                    totalScore[0].textContent = tScore[0];
                    totalScore[1].textContent = tScore[1];
                    totalScore[2].textContent = tScore[2];

                    roundNumber.innerHTML += "<br><div>Hand #" + roundN++ + "</div><br><br><hr class=\"hrms\">";
                    p1total.innerHTML += "<div>Bid = " + bidded + "</div> <div class=\"missed-bid\">Meld = " + mScore[0] + "</div>" + "<div class=\"missed-bid\">Points = " + points2[0] * 10 + "</div>" + "<div>Total = " + tScore[0] + "</div>" + "<hr class=\"hrms\">";
                    p2total.innerHTML += "<br><div>Meld = " + mScore[1] + "</div>" + "<div>Points = " + points2[1] * 10 + "</div>" + "<div>Total = " + tScore[1] + "</div>" + "<hr class=\"hrms\">";
                    p3total.innerHTML += "<br><div>Meld = " + mScore[2] + "</div>" + "<div>Points = " + points2[2] * 10 + "</div>" + "<div>Total = " + tScore[2] + "</div>" + "<hr class=\"hrms\">";
                    
                    addRScore = true;
                    
                    winner();
                } else if(p2b.checked && rScore[1] < bidded) {
                    if(addt !== 0){
                        if(points2[0] == 0) {
                            rScore[0] = 0;
                        };
                        if(points2[1] == 0) {
                            rScore[1] = 0;
                        };
                        if(points2[2] == 0) {
                            rScore[2] = 0;
                        };
                    };
                    
                    tScore[0] += rScore[0];
                    tScore[1] -= Number(bidIn.value);
                    tScore[2] += rScore[2];
                    
                    roundNumber.innerHTML += "<br><div>Hand #" + roundN++ + "</div><br><br><hr class=\"hrms\">";
                    p1total.innerHTML += "<br><div>Meld = " + mScore[0] + "</div>" + "<div>Points = " + points2[0] * 10 + "</div>" + "<div>Total = " + tScore[0] + "</div>" + "<hr class=\"hrms\">";
                    p2total.innerHTML += "<div>Bid = " + bidded + "</div> <div class=\"missed-bid\">Meld = " + mScore[1] + "</div>" + "<div class=\"missed-bid\">Points = " + points2[1] * 10 + "</div>" + "<div>Total = " + tScore[1] + "</div>" + "<hr class=\"hrms\">";
                    p3total.innerHTML += "<br><div>Meld = " + mScore[2] + "</div>" + "<div>Points = " + points2[2] * 10 + "</div>" + "<div>Total = " + tScore[2] + "</div>" + "<hr class=\"hrms\">";
                    
                    totalScore[0].textContent = tScore[0];
                    totalScore[1].textContent = tScore[1];
                    totalScore[2].textContent = tScore[2];
                    
                    addRScore = true;
                    
                    winner();
                } else if(p3b.checked && rScore[2] < bidded) {
                    if(addt !== 0){
                        if(points2[0] == 0) {
                            rScore[0] = 0;
                        };
                        if(points2[1] == 0) {
                            rScore[1] = 0;
                        };
                        if(points2[2] == 0) {
                            rScore[2] = 0;
                        };
                    };
                    
                    tScore[0] += rScore[0];
                    tScore[1] += rScore[1];
                    tScore[2] -= Number(bidIn.value);
                    
                    roundNumber.innerHTML += "<br><div>Hand #" + roundN++ + "</div><br><br><hr class=\"hrms\">";
                    p1total.innerHTML += "<br><div>Meld = " + mScore[0] + "</div>" + "<div>Points = " + points2[0] * 10 + "</div>" + "<div>Total = " + tScore[0] + "</div>" + "<hr class=\"hrms\">";
                    p2total.innerHTML += "<br><div>Meld = " + mScore[1] + "</div>" + "<div>Points = " + points2[1] * 10 + "</div>" + "<div>Total = " + tScore[1] + "</div>" + "<hr class=\"hrms\">";
                    p3total.innerHTML += "<div>Bid = " + bidded + "</div> <div class=\"missed-bid\">Meld = " + mScore[2] + "</div>" + "<div class=\"missed-bid\">Points = " + points2[2] * 10 + "</div>" + "<div>Total = " + tScore[2] + "</div>" + "<hr class=\"hrms\">";
                    
                    totalScore[0].textContent = tScore[0];
                    totalScore[1].textContent = tScore[1];
                    totalScore[2].textContent = tScore[2];
                    
                    addRScore = true;
                    
                    winner();
                } else {
                    alert("No Bid!!!");
                };
            };
        };
    };
});

nh.addEventListener("click", newhand);

pin.addEventListener("click", function() {
    if(gameOver === false) {
        meld(pinpts, "Pinochle");
    };
});
run.addEventListener("click", function() {
    if(gameOver === false) {
        meld(runpts, "Run");
    };
});
mar.addEventListener("click", function() {
    if(gameOver === false) {
        meld(marpts, "Marriage");
    };
});
mart.addEventListener("click", function() {
    if(gameOver === false) {
        meld(martpts, "Marriage of Trump");
    };
});
aa.addEventListener("click", function() {
    if(gameOver === false) {
        meld(acepts, "Aces Around");
    };
});
ka.addEventListener("click", function() {
    if(gameOver === false) {
        meld(kingpts, "Kings Around");
    };
});
qa.addEventListener("click", function() {
    if(gameOver === false) {
        meld(queenpts, "Queens Around");
    };
});
ja.addEventListener("click", function() {
    if(gameOver === false) {
        meld(jackpts, "Jacks Around");
    };
});
nt.addEventListener("click", function() {
    if(gameOver === false) {
        meld(ninepts, "Nine of Trump");
    };
});
mara.addEventListener("click", function() {
    if(gameOver === false) {
        meld(marapts, "Marriages Around");
    };
})
dpin.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dPinPts, "Double Pinochle");
    };
});
drun.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dRunPts, "Double Run");
    };
});
dmar.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dMarPts, "Double Marriage");
    };
});
daa.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dAcesPts, "Double Aces");
    };
});
dka.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dkingsPts, "Double Kings");
    };
});
dqa.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dQueensPts, "Double Queens");
    };
});
dja.addEventListener("click", function() {
    if(gameOver === false) {
        meld(dJacksPts, "Double Jacks");
    };
});