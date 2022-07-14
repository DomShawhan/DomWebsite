const canvas1 = document.getElementById("canvas1"),
      ctx1 = canvas1.getContext("2d"),
      canvas2 = document.getElementById("canvas2"),
      ctx2 = canvas2.getContext("2d"),
      instructCon = document.getElementById("instruct"),
      highScoreCon = document.getElementById("high-score"),
      highScoreCon2 = document.querySelector(".high-score-con");
let rotate = 0,
    launchImg = new Image(),
    jetImg = new Image(),
    bomberImg = new Image(),
    fighterImg = new Image(),
    missileImg = new Image(),
    santaImg = new Image(),
    heliImg = new Image(),
    blowImg = new Image(),
    points = 0,
    nextMiss,
    missiles = [],
    newMissile = {
        ready: true,
        time: 250,
        timeTill: 250,
        max: 30,
        max2: 30
    },
    newMissileInterval,
    enemyInterval,
    missileInterval,
    blowInterval,
    blowIntervalNum = 0,
    missCountDown = 25,
    enemy = [],
    enemyTime = 500,
    level = {
        num: 1,
        enemyApart: 500,
        enemy: 0,
        enemyMax: 21,
        fighters: 5,
        jets: 5,
        bombers: 5,
        santa: 1,
        helicopters: 5,
        fightMax: 5,
        jetMax: 5,
        bombMax: 5,
        santaMax: 1,
        heliMax: 5
    },
    pos,
    blowImgScale,
    blowx = 0,
    blowy = 0,
    damage = 100,
    gameOver = true,
    blowLauncherInterval,
    blowLauncherIntervalNum = 0,
    blowLauncherScale,
    highScore;
launchImg.src = "/missile/images/launcher.png";
jetImg.src = "/missile/images/jet.png";
bomberImg.src = "/missile/images/bomber.png";
fighterImg.src = "/missile/images/Fighter.png";
missileImg.src = "/missile/images/missile.png";
santaImg.src = "/missile/images/santa.png";
heliImg.src = "/missile/images/helicopter.png";
blowImg.src = "/missile/images/blowup.png";

window.addEventListener('keydown', function(e) {
    if(e.key == " " && e.target === canvas2) {
      e.preventDefault();
    };
});

class Bomber {
    constructor() {
        this.type = "bomber";
        this.points = 3;
        this.speed = .5;
        this.damage = 20;
        this.width = 50;
        this.height = 40;
        this.x = 0;
        this.y = Math.floor(Math.random() * 100) + 100;
    };
};

class Helicopter {
    constructor() {
        this.type = "helicopter";
        this.points = 4;
        this.speed = .75;
        this.damage = 15;
        this.width = 45;
        this.height = 25;
        this.x = 0;
        this.y = Math.floor(Math.random() * 100) + 400;
    };
};

class Fighter {
    constructor() {
        this.type = "fighter";
        this.points = 5;
        this.speed = 1;
        this.damage = 10;
        this.width = 40;
        this.height = 30;
        this.x = 0;
        this.y = Math.floor(Math.random() * 100) + 200;
    };
};

class Santa {
    constructor() {
        this.type = "santa";
        this.points = -20;
        this.missiles = 5;
        this.speed = .8;
        this.damage = -50;
        this.width = 60;
        this.height = 50;
        this.x = 0;
        this.y = Math.floor(Math.random() * 500) + 100;
    };
};

class Jet {
    constructor() {
        this.type = "jet";
        this.points = 4;
        this.speed = 2;
        this.damage = 5;
        this.width = 30;
        this.height = 20;
        this.x = 0;
        this.y = Math.floor(Math.random() * 100) + 300;
    };
};

class Missile {
    constructor() {
        this.x = 340;
        this.y = 619; 
        this.speedx = 6;
        this.speedy = 6;
        this.width = 15;
        this.height = 30;
        this.rotate = 0;
    };
};

function background(add, pos) {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx1.fillStyle = "gray";
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    ctx1.font = "24px 'Press Start 2P'";
    ctx1.strokeStyle = "black";
    ctx1.beginPath();
    ctx1.moveTo(0, 300);
    ctx1.lineTo(100, 300);
    ctx1.lineTo(100, 350);
    ctx1.lineTo(200, 350);
    ctx1.lineTo(200, 300);
    ctx1.lineTo(300, 300);
    ctx1.lineTo(300, 350);
    ctx1.lineTo(400, 350);
    ctx1.lineTo(400, 300);
    ctx1.lineTo(500, 300);
    ctx1.lineTo(500, 350);
    ctx1.lineTo(600, 350);
    ctx1.lineTo(600, 300);
    ctx1.lineTo(700, 300);
    ctx1.stroke();
    if(pos) {
        ctx1.beginPath();
        ctx1.strokeStyle = "red";
        //ctx1.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
        ctx1.moveTo(pos.x - 15, pos.y);
        ctx1.lineTo(pos.x + 15, pos.y);
        ctx1.moveTo(pos.x, pos.y - 15);
        ctx1.lineTo(pos.x, pos.y + 15);
        ctx1.stroke();
    };
    if(add !== true) {
        backgroundText();
    }
};

function backgroundText() {
    ctx1.fillStyle = "white";
    ctx1.textAlign = "center";
    ctx1.font = "24px 'Press Start 2P'";
    if(newMissile.time < newMissile.timeTill){
        ctx1.fillText((missCountDown/100).toFixed(2), 350, 50);
    } else {
        ctx1.fillText("Launcher Ready to Fire", 350, 50);
    };
    ctx1.fillText(newMissile.max + "/" + newMissile.max2 + " Missiles Remaining", 350, 100);
    ctx1.fillText(damage + "%", 350, 150);
    ctx1.fillText(points, 350, 250);
    ctx1.fillStyle="#FF0000";
    ctx1.fillRect(275, 150, (damage/100)*150, 25);
    ctx1.strokeRect(275, 150, 150, 25);
}

function handleMouseDown(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    evt.target.style.cursor = 'none';
}
  
canvas2.addEventListener('mousedown', handleMouseDown, false);

document.fonts.ready.then(() => {
    background(true);
    ctx1.fillStyle = "white";
    ctx1.textAlign = "center";
    ctx1.font = "40px 'Press Start 2P'";
    ctx1.fillText("Click to begin", 350, 200);
});

function drawLauncher() {
    ctx2.setTransform(1, 0, 0, 1, 350, 619); // sets scale and origin
    ctx2.rotate(rotate/100);
    ctx2.drawImage(launchImg, -launchImg.width / 2, -launchImg.height / 2);
    ctx2.setTransform(1,0,0,1,0,0);
    drawMiss();
    drawPlanes();
};

launchImg.onload = function(){
    drawLauncher();
};

function startGame() {
    canvas2.addEventListener("keydown", keydownControls);
    canvas2.addEventListener("click", fire);
    canvas2.addEventListener("mousemove", moveLauncherMouse);
};

function keydownControls(event) {
    switch(event.key) {
        case "ArrowLeft": 
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            /*if(rotate > -79) {*/
                rotate -= 5;
            /*};*/
            draw(0, 0);
            break;
        case "ArrowRight": 
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            /*if(rotate < 79) {*/
                rotate += 5;
            /*};*/
            draw(0, 0);
            break;
        case " ":
            fire();
    };
}

function moveLauncherMouse(e) {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    pos = getMousePos(canvas2, e);
    background(false, pos);
    let slope = (pos.x - 350)/(pos.y - 619);
    var angle;
    if(slope === 0) {
        rotate = 0;
    } else if(slope < 0) {
        angle = Math.PI + Math.atan2(pos.x - 350, pos.y - 619);
        rotate = -angle.toFixed(2)*100;
    } else if(slope > 0) {
        angle = Math.PI*2 - Math.atan2(350 - pos.x, 619 - pos.y);
        rotate = angle.toFixed(2)*100;
    };
    blowGo();
    drawLauncher();
};

document.fonts.ready.then(function () {
    if(gameOver === false) {
        startGame();
        startEnemyInterval();
        background();
    } else {
        canvas2.addEventListener("click", clickFirstEvent);
    };
});

function clickFirstEvent() {
    gameOver = false;
    points = 0;
    level = {
        num: 1,
        enemyApart: 500,
        enemy: 0,
        enemyMax: 21,
        fighters: 5,
        jets: 5,
        bombers: 5,
        santa: 1,
        helicopters: 5,
        fightMax: 5,
        jetMax: 5,
        bombMax: 5,
        santaMax: 1,
        heliMax: 5
    };
    newMissile = {
        ready: true,
        time: 250,
        timeTill: 250,
        max: 30,
        max2: 30
    };
    enemyTime = 500;
    damage = 100;
    startGame()
    startEnemyInterval();
    background();
    canvas2.removeEventListener("click", clickFirstEvent);
};

function getMousePos(canvas, evt) {
    let rect = canvas2.getBoundingClientRect(), 
        scaleX = canvas2.width / rect.width,    
        scaleY = canvas2.height / rect.height;  
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   
      y: (evt.clientY - rect.top) * scaleY     
    };
};

function fire() {
    if(newMissile.time >= newMissile.timeTill && newMissile.max > 0) {
        let missile = new Missile();
        if(rotate === 0) {
            missile.speedx = 0;
            missile.speedy = -600;
            missile.rotate = 0;
        } else {
            missile.rotate = rotate;
            if(rotate/100 > 0) {
                missile.speedx = ((missile.speedx * (Math.sin(rotate/100)))* 100).toFixed(0) ;
            } else {
                missile.speedx = (((missile.speedx * Math.sin(rotate/100)))*100).toFixed(0);
            };
            if((missile.speedy * Math.sin(rotate/100)) > 0) {
                missile.speedy = -((missile.speedy * Math.cos(rotate/100)) * 100).toFixed(0);
            } else {
                missile.speedy = -((missile.speedy * Math.cos(rotate/100))*100).toFixed(0);
            };
        };
        missiles.push(missile);
        newMissile.time = 0;
        newMissile.max--;
        background();
        clearInterval(newMissileInterval);
        newMissileInterval = setInterval(() => {
            if(newMissile.time < newMissile.timeTill){
                newMissile.time += 10;
                ctx1.clearRect(0, 0, canvas1.width, canvas1.height)
                missCountDown--;
                background();
            } else {
                ctx1.clearRect(0, 0, canvas1.width, canvas1.height)
                missCountDown = 25;
                background();
                clearInterval(newMissileInterval);
            };
        }, 10);
        drawMissiles(true);
    };
}

function drawMissiles() {
    if(!missileInterval && missiles.length > 0) {
        missileInterval = setInterval(() => {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            draw(true, 0);
        }, 20);
    };
};

function drawMiss(add) {
    if(missiles.length > 0) {
        missiles.forEach((miss) => {
            checkBlowup();
            if(miss.y > 0) {
                if(add === true) {
                    miss.x += miss.speedx/100;
                    miss.y += miss.speedy/100;
                };
                ctx2.drawImage(missileImg, miss.x, miss.y, miss.width, miss.height);
            } else {
                missiles.shift();
            };
        });
    } else {
        clearInterval(missileInterval);
        missileInterval = undefined;
    };
};

function drawPlanes(add, add2) {
    if(enemy.length > 0) {
        let j;
        for(j = 0; j < enemy.length; j++) {
            if(enemy.length === 0) {
                if(add2 === true) {
                return nextLevel();
                };
            };
            if(enemy[j] !== undefined) {
                if(enemy[j].x > 700) {
                    damage -= enemy[j].damage;
                    if(damage > 100) {
                        damage = 100;
                    } else if(damage <= 0) {
                        damage = 0;
                        background();
                    };
                    if(enemy[j].type === "santa") {
                        if(newMissile.max + enemy[j].missiles > newMissile.max2) {
                            newMissile.max = newMissile.max2;
                        } else {
                            newMissile.max += 5;
                        };
                    };
                    points -= enemy[j].points;
                    background();
                    if(damage <= 0) {
                        if(missileInterval !== undefined) {
                            clearInterval(missileInterval);
                            missileInterval = undefined;
                        };
                        if(enemyInterval !== undefined) {
                            clearInterval(enemyInterval);
                            enemyInterval = undefined;
                        };
                        document.removeEventListener("keydown", keydownControls);
                        canvas2.removeEventListener("click", fire);
                        canvas2.removeEventListener("mousemove", moveLauncherMouse);
                        canvas2.addEventListener("click", clickFirstEvent);
                        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
                        ctx1.fillStyle = "white";
                        ctx1.fillText("Game over!", 350, 200);
                        ctx1.fillText("Your score was " + points, 350, 250);
                        ctx1.fillText("Click to restart", 350, 300);
                        alert("Game Over");
                        enemy = [];
                        missiles = [];
                        blowLauncher();
                        checkHighScore();
                        gameOver = true;
                        break;
                    } else {
                        delete enemy[j];
                        enemy.splice(j, 1);
                    };
                } else {
                    checkBlowup();
                    if(enemy[j] !== undefined) {
                        if(add === true) {
                            enemy[j].x += enemy[j].speed;
                        };
                        switch(enemy[j].type){
                            case "bomber": 
                                ctx2.drawImage(bomberImg, enemy[j].x, enemy[j].y, enemy[j].width, enemy[j].height);
                                break;
                            case "jet": 
                                ctx2.drawImage(jetImg, enemy[j].x, enemy[j].y, enemy[j].width, enemy[j].height);
                                break;
                            case "fighter": 
                                ctx2.drawImage(fighterImg, enemy[j].x, enemy[j].y, enemy[j].width, enemy[j].height);
                                break;
                            case "santa": 
                                ctx2.drawImage(santaImg, enemy[j].x, enemy[j].y, enemy[j].width, enemy[j].height);
                                break;
                            case "helicopter": 
                                ctx2.drawImage(heliImg, enemy[j].x, enemy[j].y, enemy[j].width, enemy[j].height);
                        };
                    };
                };
            };
        };
    } else {
        if(add2 === true) {
            if(damage <= 0) {
                if(missileInterval !== undefined) {
                    clearInterval(missileInterval);
                    missileInterval = undefined;
                };
                if(enemyInterval !== undefined) {
                    clearInterval(enemyInterval);
                    enemyInterval = undefined;
                };
                document.addEventListener("keydown", keydownControls);
                canvas2.removeEventListener("click", fire);
                canvas2.removeEventListener("mousemove", moveLauncherMouse);
                canvas2.addEventListener("click", clickFirstEvent);
                ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
                ctx1.fillStyle = "white";
                ctx1.fillText("Game over!", 350, 200);
                ctx1.fillText("Your score was " + points, 350, 250);
                ctx1.fillText("Click to restart", 350, 300);
                alert("Game Over");
                enemy = [];
                missiles = [];
                if(blowLauncherInterval === undefined) {
                    blowLauncher();
                };
                gameOver = true;
                checkHighScore();
                return false;
            } else {
                nextLevel();
            };
        };
    };
};

function checkHighScore() {
    highScore = localStorage.getItem("msHigh");
    if(highScore === null || points > highScore) {
        localStorage.setItem("msHigh", points);
        getHighScore();
    };
};

function getHighScore() {
    highScore = localStorage.getItem("msHigh");
    if(highScore !== null) {
        highScoreCon.innerHTML = highScore;
    } else {
        if(highScoreCon2.classList.contains("hidden") === false) {
            highScoreCon2.classList.add("hidden");
        };
    };
};

getHighScore();

function blowLauncher() {
    blowLauncherScale = .1;
    blowLauncherInterval = setInterval(() => {
        if(blowLauncherScale <= 1) {
            blowLauncherIntervalNum++;
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            ctx2.save();
            ctx2.translate(350 - blowImg.width * 0.5, 619 - blowImg.height * 0.5);
            ctx2.scale(blowLauncherScale, blowLauncherScale);
            ctx2.translate(-blowImg.width * 0.5, -blowImg.height * 0.5);
            ctx2.drawImage(blowImg, 0, 0, blowImg.width * blowImgScale, blowImg.height * blowImgScale);
            ctx2.restore();
            blowLauncherScale += .1;
        } else {
            clearInterval(blowLauncherInterval);
            blowLauncherInterval = undefined;
        };
    }, 25);
};

function nextLevel() {
    console.log("next")
    clearInterval(enemyInterval);
    enemyInterval = undefined;
    points += (newMissile.max * 5)
    level.num++;
    level.fightMax += 2;
    level.santaMax += 1;
    level.jetMax += 2;
    level.bombMax += 2;
    level.heliMax += 2;
    level.santa = level.santaMax;
    level.fighters = level.fightMax;
    level.bombers = level.bombMax;
    level.helicopters = level.heliMax;
    level.jets = level.jetMax;
    level.enemyMax += 9;
    level.enemy = 0;
    newMissile.max2 += 10;
    newMissile.max = newMissile.max2;
    enemyTime = level.enemyApart;
    background();
    startEnemyInterval();
};

function draw(add1, add2, add3) {
    drawLauncher();
    drawMiss(add1);
    drawPlanes(add2, add3);
    blowGo();
};

function checkBlowup() {
    if(enemy.length > 0 && missiles.length > 0) {
        let j, i;
        for(j = 0; j < enemy.length; j++) {
            if(enemy <= 0) {
                break;
            };
            for(i = 0; i < missiles.length; i++) {
                if(enemy[j] !== undefined && missiles[i] !== undefined) {
                    if((enemy[j].y - enemy[j].height/2) < (missiles[i].y + 15) && (missiles[i].y - 15) < (enemy[j].y + enemy[j].height/2) &&
                       (enemy[j].x - enemy[j].width/2) < (missiles[i].x + 15) && (missiles[i].x - 15) < (enemy[j].x + enemy[j].width/2)) {
                        //set blowImg center to be over plane center
                        blowx = enemy[j].x - blowImg.width *0.5;
                        blowy = enemy[j].y - blowImg.height *0.5;
                        //add points
                        points += enemy[j].points;
                        background();
                        delete enemy[j];
                        enemy.splice(j, 1);
                        delete missiles[i];
                        missiles.splice(i, 1);
                        if(enemy.length <= 0){
                            nextLevel();
                        };
                        blowAni();
                    };
                };
            };
        };
    };
};

function startEnemyInterval() {
    if(enemyInterval === undefined) {
        enemyInterval = setInterval(() => {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            if(level.enemy < level.enemyMax) {
                if(enemyTime >= level.enemyApart) {
                    let planes = [], newPlane;
                    if(level.fighters > 0) {
                        planes.push("fighter");
                    };
                    if(level.jets > 0) {
                        planes.push("jet");
                    };
                    if(level.bombers > 0) {
                        planes.push("bomber");
                    };
                    if(level.santa > 0) {
                        planes.push("santa");
                    };
                    if(level.helicopters > 0) {
                        planes.push("helicopter");
                    };
                    switch (planes[Math.floor(Math.random() * planes.length)]) {
                        case "fighter":
                            newPlane = new Fighter;
                            level.fighters--;
                            break;
                        case "jet":
                            newPlane = new Jet;
                            level.jets--;
                            break;
                        case "bomber":
                            newPlane = new Bomber;
                            level.bombers--;
                            break;
                        case "santa": 
                            newPlane = new Santa;
                            level.santa--;
                            break;
                        case "helicopter":
                            newPlane = new Helicopter;
                            level.helicopters--;
                    };
                    enemy.push(newPlane);
                    enemyTime = 0;
                    level.enemy++;
                } else {
                    enemyTime += 20;
                };
            };
            draw(0, true, true);
        }, 20);
    };
};

function blowGo(add) {
    if(blowInterval) {
        ctx2.save();
        ctx2.translate(blowx + blowImg.width * 0.5, blowy + blowImg.height * 0.5);
        ctx2.scale(blowImgScale, blowImgScale);
        ctx2.translate(-blowImg.width * 0.5, -blowImg.height * 0.5);
        ctx2.drawImage(blowImg, 0, 0, blowImg.width * blowImgScale, blowImg.height * blowImgScale);
        ctx2.restore();
        if(add === true) {
            blowImgScale += .1;
        };  
    };
};

function blowAni() {
    blowImgScale = .1;
    blowInterval = setInterval(() => {
        if(blowImgScale <= 1) {
            blowIntervalNum++;
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            draw();
            blowGo(true);
        } else {
            clearInterval(blowInterval);
            blowInterval = undefined;
        };
    }, 5);
};
//toggle instructions
function toggleHidden() {
    instructCon.classList.toggle("hidden");
};