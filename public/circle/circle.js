var canvas = document.getElementById("myCanvs"),
    timeCont = document.getElementById("timer"),
    highScoreCon = document.getElementById("high-score"),
    highScoreContainer = document.querySelector(".high-score-con"),
    levelCon = document.getElementById("level"),
    instructCon = document.getElementById("instruct");
canvas.style.backgroundColor = "rgba(0, 128, 0, 0.8)";
var ctx = canvas.getContext("2d");
var add = 0;

let coord = {x:0 , y:0},
    //for controllable circle
    circlepos = {
        x: 65,
        y: 200,
        r: 25,
        sAng: 0,
        eAng: 2 * Math.PI
    },
    //for balls
    aballs = [],
    lastBall = 0,
    gameInterval,
    randomx,
    randomy,
    randomRadius,
    bigBallMoveInterval = "canceled",
    timer,
    time = 0,
    go = false,
    destroyed = false, 
    wait = false,
    highScore,
    level = {
        num: 1,
        balls: 10,
        ballsTime: 1,
        time: 1000
    };

// toggle instructions
function toggleHidden() {
    instructCon.classList.toggle("hidden");
};
//--------
//basic draw settings
//font      = "30px Comic Sans MS"
//fillStyle = "#e2e2e2"
//textAlign = "center"
//fillText  = "Hello World", canvas.width/2, canvas.height/2
//--------
//text draw
function drawText(font, fillStyle, textAlign, fillTexta, fillTextb, fillTextc) {
    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = textAlign;
    ctx.fillText(fillTexta, fillTextb, fillTextc);
}
//get mouse position
function getPosition(event){ 
    coord.x = event.clientX - canvas.offsetLeft; 
    coord.y = event.clientY - canvas.offsetTop;
    console.log(coord);
}

//canvas.addEventListener("mousemove", getPosition);

function getHighScore() {
    highScore = localStorage.getItem("highScore");
    if(highScore === null) {
        highScoreContainer.classList.add("hidden");
    } else {
        if(highScoreContainer.classList.contains("hidden")) {
            highScoreContainer.classList.remove("hidden");
        };
        highScoreCon.innerHTML = "Level " + (highScore);
    };
};

getHighScore();

//Starter circle
function starterCircle() {
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
    ctx.fill();
}

function startGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    starterCircle();
    //starter text
    drawText("30px Comic Sans MS", "white", "center", "Level 1", canvas.width/2, canvas.height/2);
    drawText("30px Comic Sans MS", "white", "center", "Press the space key to begin", canvas.width/2, canvas.height/2 + 30);
}

startGame();

canvas.addEventListener("keypress", function(event) {
    if(event.keyCode === 32) {
        if(destroyed === false) {
            go = (go === false)? true: false;
            if(go === true) {
                //show Circle and hide welcome
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                ctx.beginPath();
                ctx.fillStyle = "blue";
                ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                ctx.fill();
                //Start balls coming
                balls();
                //start Timer
                timer = setInterval(() => {
                    if((time/100) >= 30) {
                        aballs =[];
                        circlepos.x = 65;
                        circlepos.y = 200;
                        time = 0;
                        timeCont.innerHTML = 0;
                        clearInterval(timer);
                        nextLevel();
                        clearInterval(gameInterval);
                        clearInterval(bigBallMoveInterval);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "blue";
                        ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                        ctx.fill();
                        go = false;
                        drawText("50px Comic Sans MS", "white", "center", "Level " + level.num, canvas.width/2, canvas.height/2);
                    } else {
                        time += 1;
                        timeCont.innerHTML = (time/100).toFixed(2);
                    };
                }, 10)
            } else {
                starterCircle();
                clearInterval(timer);
                clearInterval(gameInterval);
                clearInterval(bigBallMoveInterval);
            };
        };
    } else if(event.keyCode === 13 && destroyed === true && wait === false) {
        aballs = [];
        circlepos.x = 65;
        circlepos.y = 200;
        startGame();
        time = 0;
        timeCont.innerHTML = "0.00";
        level.num = 1;
        levelCon.innerHTML = 1;
        go = false;
        add = 0;
        destroyed = false;
    };
});

canvas.addEventListener("keydown", (event) => {
    if((event.keyCode === 83 || event.keyCode === 87 || event.keyCode === 68 || event.keyCode === 65) && bigBallMoveInterval === "canceled") {
        bigBallMoveInterval = setInterval(() => {
            if(event.keyCode === 87) {
                //Move up
                if(circlepos.y >= 25 && go === true) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    circlepos.y -= 3;
                    ctx.fillStyle = "blue";
                    ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                    ctx.fill();
                    forAballs(1);
                }
            } else if(event.keyCode === 83) {
                //Move down
                if(circlepos.y <= 375 && go === true) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    circlepos.y += 3;
                    ctx.fillStyle = "blue";
                    ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                    ctx.fill();
                    forAballs(1);
                }
            } else if(event.keyCode === 65) {
                //Move left
                if(circlepos.x >= 25 && go === true) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    circlepos.x -= 3;
                    ctx.fillStyle = "blue";
                    ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                    ctx.fill();
                    forAballs(1);
                }
            } else if(event.keyCode === 68) {
                //Move right
                if(circlepos.x <= 675 && go === true) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); 
                    ctx.beginPath();
                    circlepos.x += 3;
                    ctx.fillStyle = "blue";
                    ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
                    ctx.fill();
                    forAballs(1);
                };
            };
        }, 25);
    };
});

canvas.addEventListener("keyup", (event) => {
    if(event.keyCode === 83 || event.keyCode === 87 || event.keyCode === 65 || event.keyCode === 68) { 
        clearInterval(bigBallMoveInterval);
        bigBallMoveInterval = "canceled";
    };
});

function balls() {
    if(go === true) {
        gameInterval = setInterval(() => {
            //clear canvas and put main circle
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);
            ctx.fill();
            //send little balls
            if(aballs.length < level.balls && lastBall > level.time) {
                ballNum();
                lastBall = 0;
            } else {
                lastBall += 50;
            }
            forAballs(3);
        }, 50);
    };
};

function forAballs(add) {
    aballs2(checkBlow(), add);
};

function moveBlownUp(i) {
    var n = Math.floor(Math.random() * 4);
    if(n === 0) {
        randomx[i] -= Math.floor(Math.random() * 6);
        randomy[i] -= Math.floor(Math.random() * 6);
    } else if(n === 1) {
        randomx[i] += Math.floor(Math.random() * 6);
        randomy[i] -= Math.floor(Math.random() * 6);
    } else if(n === 2) {
        randomx[i] -= Math.floor(Math.random() * 6);
        randomy[i] += Math.floor(Math.random() * 6);
    } else {
        randomx[i] += Math.floor(Math.random() * 6);
        randomy[i] += Math.floor(Math.random() * 6);
    };
};

function blowup() {
    //end Game
    clearInterval(gameInterval);
    clearInterval(timer);
    destroyed = true;
    go = false;
    ctx.beginPath();
    drawText("30px Comic Sans MS", "white", "center", "You made it to level " + level.num, canvas.width/2, canvas.height/2);
    if(level.num > highScore || highScore === null) {
        localStorage.setItem("highScore", level.num);
    };
    getHighScore();
    let c = 0;
    wait = true;
    let endGameInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        aballs2();
        drawText("30px Comic Sans MS", "white", "center", "You made it to level " + level.num, canvas.width/2, canvas.height/2);
        if(c < 50) {
            randomy = [];
            randomx = [];
            randomRadius = [];
            for(var i = 0; i < 10; i++) {
                let nx = circlepos.x + (Math.ceil(Math.random() * 10));
                let ny = circlepos.y + (Math.ceil(Math.random() * 10));
                let nr = circlepos.r - (Math.ceil(Math.random() * circlepos.r));
                let nra = (nr > 16) ? Math.ceil(Math.random() * 10): nr;
                randomx.push(nx);
                randomy.push(ny);
                randomRadius.push(nra);
                continue;
            };
        };
        if(c < 3000) {
            for(var i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.fillStyle = "blue";
                ctx.arc(randomx[i], randomy[i], randomRadius[i], circlepos.sAng, circlepos.eAng);
                ctx.fill();
                if(i > 0 && i < 4) {
                    moveBlownUp(i);
                } else {
                    moveBlownUp(i);
                };
            };
            c += 50;
        } else {
            clearInterval(endGameInterval);
            wait = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawText("30px Comic Sans MS", "white", "center", "You made it to level " + level.num, canvas.width/2, canvas.height/2);
            drawText("30px Comic Sans MS", "white", "center", "Press ENTER to restart.", canvas.width/2, canvas.height/2 - 25);
            level = {
                num: 1,
                balls: 10,
                ballsTime: 1,
                time: 1000
            };
        };
    }, 50);
};

function ballNum() {
    if(level.ballsTime === 1) {
        newSmallBall();
    } else if(level.ballsTime === 2) {
        newSmallBall();
        newSmallBall();
    } else if(level.ballsTime === 3) {
        newSmallBall();
        newSmallBall();
        newSmallBall();
    } else if(level.ballsTime === 4) {
        newSmallBall();
        newSmallBall();
        newSmallBall();
        newSmallBall();
    } else if(level.ballsTime === 5) {
        newSmallBall();
        newSmallBall();
        newSmallBall();
        newSmallBall();
        newSmallBall();
    };
};

function newSmallBall() {
    aballs.push({
        ballx: 700,
        bally: Math.floor(Math.random() * 400),
        ballr: 15,
        ballsAng: 0,
        balleAng: 2 * Math.PI
    });
    ctx.beginPath();
    ctx.fillStyle = "red"
    ctx.arc(aballs[aballs.length - 1].ballx, aballs[aballs.length - 1].bally,
            aballs[aballs.length - 1].ballr, aballs[aballs.length - 1].ballsAng,
            aballs[aballs.length - 1].balleAng);
    ctx.fill();
}

function aballs2(funct, add) {
    aballs.forEach(function(ball) {
        //check to move little balls
        if(add === 3) {
            ball.ballx -= 3;
            if(ball.ballx <= 0) {
                aballs.shift();
            };
        };
        //show little balls
        ctx.beginPath();
        ctx.fillStyle = "red"
        ctx.arc(ball.ballx, ball.bally, ball.ballr, ball.ballsAng, ball.balleAng);
        ctx.fill();
        funct;
    });
};

function checkBlow() {
    aballs.forEach(function(ball) {
        if((circlepos.y - 25) < (ball.bally + 15) && (ball.bally - 15) < (circlepos.y + 25) &&
          (circlepos.x - 25) < (ball.ballx + 15) && (ball.ballx - 15) < (circlepos.x + 25)) {
            blowup();
            clearInterval(bigBallMoveInterval);
            bigBallMoveInterval = "canceled";
        };
    });
};

function nextLevel() {
    level.num++;
    if(level.num > 10) {
        winGame();
    } else {
        levelSettings();
        levelCon.innerHTML = level.num;
    };
};

function levelSettings() {
    if(level.num === 2) {
        level.balls = 12;
        level.ballsTime = 1;
        level.time = 1000;
    } else if(level.num === 3) {
        level.balls = 15;
        level.ballsTime = 1;
        level.time = 750;
    } else if(level.num === 4) {
        level.balls = 35;
        level.ballsTime = 2;
        level.time = 750;
    } else if(level.num === 5) {
        level.balls = 22;
        level.ballsTime = 2;
        level.time = 1000;
    } else if(level.num === 6) {
        level.balls = 25;
        level.ballsTime = 2;
        level.time = 1250;
    } else if(level.num === 7) {
        level.balls = 30;
        level.ballsTime = 3;
        level.time = 1500;
    } else if(level.num === 8) {
        level.balls = 32;
        level.ballsTime = 3;
        level.time = 1500;
    } else if(level.num === 9) {
        level.balls = 65;
        level.ballsTime = 3;
        level.time = 1750;
    } else if(level.num === 10) {
        level.balls = 100;
        level.ballsTime = 5;
        level.time = 2000;
    };
};

function winGame() {
    level = {
        num: 1,
        balls: 10,
        ballsTime: 1,
        time: 1000
    };
    localStorage.setItem("highScore", "Won the Game!!");
    getHighScore();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText("30px Comic Sans MS", "white", "center", "You won!!!", canvas.width/2, canvas.height/2);
    drawText("30px Comic Sans MS", "white", "center", "Press ENTER to restart.", canvas.width/2, canvas.height/2 - 25);
    wait = false;
    destroyed = true;
}

//ctx.arc(circlepos.x, circlepos.y, circlepos.r, circlepos.sAng, circlepos.eAng);