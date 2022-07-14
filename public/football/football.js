"use strict";
const yardNum = document.getElementById("yard-num");
const homeScore = document.getElementById("ht-score");
const awayScore = document.getElementById("aw-score");
const passPlays = document.getElementsByClassName("pass");
const runPlays = document.getElementsByClassName("run");
const driveNum = document.getElementById("drive-num");
const quarter = document.getElementById("quarter");
const downht = document.getElementById("down");
const yardht = document.getElementById("yard");
const lastPlay = document.getElementById("last-play");
const lastPlayCon = document.getElementById("last-p-con");
const p1driveDots = document.getElementsByClassName("p1-drive");
const p2driveDots = document.getElementsByClassName("p2-drive");
const quarterN = document.getElementById("q-number");
const final = document.getElementById("final");
const set = document.getElementById("set");
const game2 = document.getElementById("game");
const oTN = document.getElementById("op-team-name");
const yTN = document.getElementById("yo-team-name");
const yTNH = document.getElementById("yo-t-n");
const oTNH = document.getElementById("op-t-n");
const dif = document.getElementById("difficulty");
const difficulty = document.getElementsByName("difficulty");
const players = document.getElementsByName("players");
const dots = document.getElementsByClassName("dot");
const p1Drive = document.getElementById("p1-drive");
const p2Drive = document.getElementById("p2-drive");
const fieldMarkings = document.getElementById("field-mark");
const homeEnd = document.getElementById("home-end");
const awayEnd = document.getElementById("away-end");
const yardt = document.getElementById("yard-mark");
const p1OverScore = document.getElementById("p1-over-score");
const p1OverName = document.getElementById("p1-over-name");
const p2OverScore = document.getElementById("p2-over-score");
const p2OverName = document.getElementById("p2-over-name");
const finalOver = document.getElementById("final-score");
const gameOverFin = document.getElementById("over");
const passResults = ["complete", "complete", "complete", "sack", "incomplete", "incomplete", "incomplete", "incomplete", "interception", "touchdown"];
const passSResults = ["complete", "complete", "complete", "sack", "complete", "incomplete", "incomplete", "incomplete", "interception", "touchdown"];
const passLResults = ["complete", "complete", "interception", "sack", "incomplete", "incomplete", "incomplete", "touchdown", "interception", "touchdown"];
const runResults = ["fumble", "loss", "gain", "loss", "gain", "loss", "gain", "gain", "gain", "touchdown"];
const initial = ["st", "nd", "rd", "th"];
const homeTScore = ["field goal", "touchdown", "interception", "fumble", "punt", "missed field goal"];
const rightArrow = "&rightarrow;";
const leftArrow = "&leftarrow;";
let game = {
    player: "player1",
    aScore: 0,
    hScore: 0,
    quarterNum: 1,
    p2DriveLeft: 2,
    p1DriveLeft: 2,
    awayTeamName: yTN.value,
    homeTeamName: oTN.value,
    twoPlayer: false,
    gameOver: false,
    yardNumber: 1,
    downNumber: 1,
    downYard: 10
};

let passYards, RunYards;
let z;

function undisable() {
    const buttons = document.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    };
};

function over() {
    p1OverName.innerHTML = game.awayTeamName;
    p2OverName.innerHTML = game.homeTeamName;
    p1OverScore.innerHTML = game.aScore;
    p2OverScore.innerHTML = game.hScore;
    gameOverFin.classList.remove("hidden");
    if (game.aScore > game.hScore) {
        finalOver.innerHTML = "Final <br><br><br> " + game.awayTeamName + " wins!";
    } else if (game.aScore < game.hScore) {
        finalOver.innerHTML = "Final <br><br><br> " + game.homeTeamName + " wins!";
    } else {
        finalOver.innerHTML = "Final <br><br><br> Tie!!"
    };
};

function dot() {
    for (var i = 0; i < p1driveDots.length; i++) {
        if (p1driveDots[i].classList.contains("hidden") !== true) {
            p1driveDots[i].classList.add("hidden");
        };
    };
    for (var i = 0; i < p2driveDots.length; i++) {
        if (p2driveDots[i].classList.contains("hidden") !== true) {
            p2driveDots[i].classList.add("hidden");
        };
    };
    for (var i = 0; i < (game.p1DriveLeft + 1); i++) {
        if (p1driveDots[i].classList.contains("hidden")) {
            p1driveDots[i].classList.remove("hidden");
        };
    };
    for (var i = 0; i < (game.p2DriveLeft + 1); i++) {
        if (p2driveDots[i].classList.contains("hidden")) {
            p2driveDots[i].classList.remove("hidden");
        };
    };
};

function lastPlayFunc(player, thing) {
    lastPlay.innerHTML = player + thing;
    lastPlayCon.style.visibility = "visible";
    lastPlayCon.style.opacity = 1;
    setTimeout(() => {
        lastPlayCon.style.visibility = "hidden";
        lastPlayCon.style.opacity = 0;
    }, 1850);
};

function color() {
    if (game.player === "player1") {
        yardt.style.backgroundColor = "orange";
        yardNum.style.backgroundColor = "gray";
    } else if (game.player === "player2") {
        yardt.style.backgroundColor = "gray";
        yardNum.style.backgroundColor = "orange";
    };
};

function passMax(max) {
    if ((100 - game.yardNumber) >= max) {
        return max;
    } else if (100 - game.yardNumber < max) {
        return 100 - game.yardNumber;
    };
};

function passplay(array, max, min) {
    if (game.gameOver === false) {
        lastPlay.innerHTML = "";
        let i = Math.floor(Math.random() * array.length);
        if (array[i] === "complete") {
            complete(max, min);
        } else if (array[i] === "incomplete") {
            incomplete();
        } else if (array[i] === "interception") {
            turnover("interception");
        } else if (array[i] === "sack") {
            sack();
        } else if (array[i] === "touchdown") {
            touchdown();
        };
    };
};

function runplay() {
    if (game.gameOver === false) {
        lastPlay.innerHTML = "";
        let r = Math.floor(Math.random() * runResults.length);
        if (runResults[r] === "loss") {
            loss();
        } else if (runResults[r] === "touchdown") {
            touchdown();
        } else if (runResults[r] === "fumble") {
            turnover("fumble");
        } else if (runResults[r] === "gain") {
            gain();
        };
    };
};

function onePlayer() {
    if (dif.classList.contains("hidden")) {
        dif.classList.remove("hidden");
        oTN.value = "Computer";
    };
};

function twoPlayer2() {
    if (dif.classList.contains("hidden") === false) {
        dif.classList.add("hidden");
        oTN.value = "P2";
    };
};

function checkDown() {
    if (game.downNumber === 4) {
        if (game.twoPlayer === false) {
            game.p1DriveLeft--;
            setTimeout(() => {
                lastPlayFunc(game.awayTeamName, " -- Turnover on Downs");
            }, 2000);
            disable();
            setTimeout(() => {
                homeTeamScore();
            }, 2000);
            setTimeout(() => {
                if (game.p1DriveLeft < 0 && game.quarterNum === 4) {
                    game.gameOver = true;
                    disable();
                    over();
                    game.downNumber = 1;
                    game.downYard = 10;
                    downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                    yardht.innerHTML = game.downYard;
                } else if (game.p1DriveLeft < 0 && game.quarterNum !== 4) {
                    game.quarterNum++;
                    game.p1DriveLeft = 2;
                    game.p2DriveLeft = 2;
                    game.downNumber = 1;
                    game.downYard = 10;
                    downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                    yardht.innerHTML = game.downYard;
                    dot();
                    quarterN.innerHTML = game.quarterNum + initial[game.quarterNum - 1];
                    z = Math.floor(Math.random() * 50);
                    if (z === 0) {
                        z = 1;
                    };
                    game.yardNumber = z;
                    yard();
                    setTimeout(() => {
                        lastPlayFunc(game.awayTeamName, "'s ball at the " + game.yardNumber + " yard line.");
                        undisable();
                    }, 4000);
                } else {
                    drive();
                    undisable();
                };
            }, 6850);
        } else if (game.twoPlayer === true) {
            if (game.player === "player1") {
                game.p1DriveLeft--;
            } else if (game.player === "player2") {
                game.p2DriveLeft--;
            };
            if (game.p1DriveLeft < 0 && game.p2DriveLeft < 0 && game.quarterNum === 4) {
                tod();
                game.gameOver = true;
                disable();
                over();
                game.downNumber = 1;
                game.downYard = 10;
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
            } else if (game.p1DriveLeft < 0 && game.p2DriveLeft < 0 && game.quarterNum !== 4) {
                tod();
                setTimeout(() => {
                    game.quarterNum++;
                    quarterN.innerHTML = game.quarterNum + initial[game.quarterNum - 1];
                    game.p1DriveLeft = 2;
                    game.p2DriveLeft = 2;
                    drive("tod");
                }, 4000);
            } else {
                tod();
                setTimeout(() => {
                    drive("tod");
                }, 2000);
            };
        };
    } else {
        game.downNumber++;
    };
};

function downYards() {
    if (game.player === "player1") {
        if ((100 - game.yardNumber) < 10 && game.downNumber === 1) {
            return yardht.innerHTML = " goal";
        };
    } else {
        if ((game.yardNumber) < 10 && game.downNumber === 1) {
            return yardht.innerHTML = " goal";
        };
    };
};

function drive(h) {
    if (game.twoPlayer === true) {
        if (game.player === "player1") {
            game.downNumber = 1;
            game.downYard = 10;
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            z = Math.floor(Math.random() * 50);
            if (z === 0) {
                z = 1;
            };
            if (h === "fumble" || h === "tod") {
                game.yardNumber += 0;
                if (game.yardNumber > 50 && game.yardNumber < 100) {
                    setTimeout(() => {
                        let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                        lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                    }, 2000);
                } else {
                    setTimeout(() => {
                        let kickRet = " has the ball at " + game.awayTeamName + "'s ";
                        lastPlayFunc(game.homeTeamName, kickRet + (game.yardNumber) + " yard line");
                    }, 2000);
                };
            } else {
                if (z + 50 === 100) {
                    game.yardNumber = 99;
                    if (h === "touch") {
                        let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                        lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                    } else {
                        setTimeout(() => {
                            let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                            lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                        }, 2000);
                    };
                } else {
                    game.yardNumber = z + 50;
                    if (h === "touch") {
                        let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                        lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                    } else {
                        setTimeout(() => {
                            let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                            lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                        }, 2000);
                    };
                };
            };
            dots[1].classList.add("hidden");
            dots[0].classList.remove("hidden");
            game.player = "player2";
            dot();
            yard();
            color();
        } else if (game.player === "player2") {
            game.downNumber = 1;
            game.downYard = 10;
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            z = Math.floor(Math.random() * 50);
            if (z === 0) {
                z = 1;
            };
            if (h === "fumble" || h === "tod") {
                game.yardNumber += 0;
                if (game.yardNumber > 50 && game.yardNumber < 100) {
                    setTimeout(() => {
                        let kickRet = " has the ball at " + game.homeTeamName + "'s ";
                        lastPlayFunc(game.awayTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                    }, 2000);
                } else {
                    let kickRet = " has the ball at " + game.awayTeamName + "'s ";
                    lastPlayFunc(game.awayTeamName, kickRet + (game.yardNumber) + " yard line");
                };
            } else {
                game.yardNumber = z;
                if (h === "touch") {
                    let kickRet = " has the ball at " + game.awayTeamName + "'s ";
                    lastPlayFunc(game.awayTeamName, kickRet + (game.yardNumber) + " yard line");
                } else {
                    setTimeout(() => {
                        let kickRet = " has the ball at " + game.awayTeamName + "'s ";
                        lastPlayFunc(game.awayTeamName, kickRet + (game.yardNumber) + " yard line");
                    }, 2000);
                };
            };
            dots[0].classList.add("hidden");
            dots[1].classList.remove("hidden");
            game.player = "player1";
            yard();
            color();
            dot();
        };
    } else {
        dot();
        game.downNumber = 1;
        game.downYard = 10;
        downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
        yardht.innerHTML = game.downYard;
        z = Math.floor(Math.random() * 50);
        if (z === 0) {
            z = 1;
        };
        game.yardNumber = z;
        yard();
        lastPlayFunc(game.awayTeamName, "'s ball at the " + game.yardNumber + " yard line.");
    };
};

function disable() {
    const buttons = document.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    };
};

function yard() {
    downYards();
    if (game.twoPlayer === false) {
        if (game.yardNumber < 50) {
            yardNum.innerHTML = game.yardNumber + rightArrow;
            fieldMarkings.style.right = -50 + game.yardNumber - 10 + "vw";
        } else if (game.yardNumber > 50 && game.yardNumber < 100) {
            fieldMarkings.style.right = game.yardNumber - 50 - 10 + "vw";
            let yard50t100 = 100 - game.yardNumber;
            yardNum.innerHTML = yard50t100 + rightArrow;
        } else {
            yardNum.innerHTML = 50 + rightArrow;
        };
    } else {
        if (game.player === "player1") {
            if (game.yardNumber < 50) {
                yardNum.innerHTML = game.yardNumber + rightArrow;
                fieldMarkings.style.right = -50 + game.yardNumber - 10 + "vw";
            } else if (game.yardNumber > 50 && game.yardNumber < 100) {
                fieldMarkings.style.right = game.yardNumber - 50 - 10 + "vw";
                let yard50t100 = 100 - game.yardNumber;
                yardNum.innerHTML = yard50t100 + rightArrow;
            } else {
                yardNum.innerHTML = 50 + rightArrow;
            };
        } else if (game.player === "player2") {
            if (game.yardNumber < 50) {
                yardNum.innerHTML = leftArrow + game.yardNumber;
                fieldMarkings.style.right = -50 + game.yardNumber - 10 + "vw";
            } else if (game.yardNumber > 50 && game.yardNumber < 100) {
                fieldMarkings.style.right = game.yardNumber - 50 - 10 + "vw";
                let yard50t100 = 100 - game.yardNumber;
                yardNum.innerHTML = leftArrow + yard50t100;
            } else {
                yardNum.innerHTML = leftArrow + 50;
            };
        };
    };
};

function homeTeamScore() {
    setTimeout(() => {
        let h = Math.floor(Math.random() * (homeTScore.length - 1));
        lastPlay.innerHTML = "";
        if (homeTScore[h] === "field goal") {
            game.hScore += 3;
            lastPlayFunc(game.homeTeamName, " Made a field goal");
        } else if (homeTScore[h] === "touchdown") {
            game.hScore += 7;
            lastPlayFunc(game.homeTeamName, " scored a Touchdown");
        } else if (homeTScore[h] === "fumble") {
            lastPlayFunc(game.homeTeamName, " fumbles");
        } else if (homeTScore[h] === "interception") {
            lastPlayFunc(game.homeTeamName, " throws an interception");
        } else if (homeTScore[h] === "punt") {
            lastPlayFunc(game.homeTeamName, " punts");
        } else if (homeTScore[h] === "missed field goal") {
            lastPlayFunc(game.homeTeamName, " misses a field goal");
        };
        game.p2DriveLeft--;
        dot();
        homeScore.innerHTML = game.hScore;
        disable();
    }, 2000);
};

function newGame() {
    window.location.reload(true);
};

function startGame() {
    game.hScore = 0;
    game.aScore = 0;
    homeScore.innerHTML = game.hScore;
    awayScore.innerHTML = game.aScore;
    game.gameOver = false;
    game.p1DriveLeft = 2;
    game.p2DriveLeft = 2;
    game.quarterNum = 1;
    lastPlay.innerHTML = "";
    oTNH.innerHTML = oTN.value;
    yTNH.innerHTML = yTN.value;
    set.classList.add("hidden");
    game2.classList.remove("hidden");
    game.homeTeamName = oTN.value;
    game.awayTeamName = yTN.value;
    homeEnd.innerHTML = yTN.value;
    awayEnd.innerHTML = oTN.value;
    playerNum();
    if (game.twoPlayer === false) {
        if (difficulty[1].checked === true) {
            homeTScore.push("field goal", "touchdown");
            runResults.push("loss");
            passResults.push("incomplete");
            passSResults.push("incomplete");
            passLResults.push("incomplete");
        } else if (difficulty[2].checked === true) {
            homeTScore.push("field goal", "touchdown", "touchdown");
            runResults.push("loss", "fumble");
            passSResults.push("incomplete", "interception");
            passResults.push("incomplete", "interception");
            passLResults.push("incomplete", "interception");
        };
    };
    z = Math.floor(Math.random() * 50);
    if (z === 0) {
        z = 1;
    };
    if (game.twoPlayer === true) {
        if (game.player === "player2") {
            if (z + 50 === 100) {
                game.yardNumber = 99;
                setTimeout(() => {
                    let kickRet = " returns the ball to  " + game.homeTeamName + "'s ";
                    lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                }, 2000);
            } else {
                game.yardNumber = 100 - z;
                setTimeout(() => {
                    let kickRet = " returns the ball to  " + game.homeTeamName + "'s ";
                    lastPlayFunc(game.homeTeamName, kickRet + (100 - game.yardNumber) + " yard line");
                }, 2000);
            };
        } else {
            game.yardNumber = z;
            setTimeout(() => {
                let kickRet = " returns the ball to  " + game.awayTeamName + "'s ";
                lastPlayFunc(game.awayTeamName, kickRet + (game.yardNumber) + " yard line");
            }, 2000);
        };
        game.p1DriveLeft = 2;
        game.p2DriveLeft = 2;
    } else {
        game.yardNumber = z;
        setTimeout(() => {
            let kickRet = " returns the ball to  " + game.awayTeamName + "'s ";
            lastPlayFunc(game.awayTeamName, kickRet + (game.yardNumber) + " yard line");
        }, 2000);
    };
    awayScore.innerHTML = game.aScore;
    homeScore.innerHTML = game.hScore;
    yard();
    quarterN.innerHTML = game.quarterNum + initial[game.quarterNum - 1];
};

function playerNum() {
    if (players[0].checked) {
        dots[0].classList.add("hidden");
        lastPlayFunc(game.awayTeamName, " receives the ball");
        game.twoPlayer = false;
        game.player = "player1";
    } else {
        game.twoPlayer = true;
        dot();
        let math = Math.ceil(Math.random() * 2);
        if (math === 1) {
            dots[1].classList.add("hidden");
            lastPlayFunc(game.homeTeamName, " receives the ball");
            game.player = "player2";
        } else {
            dots[0].classList.add("hidden");
            lastPlayFunc(game.awayTeamName, " receives the ball");
            game.player = "player1";
        };
        color();
    };
};

function touchdown() {
    if (game.twoPlayer === true) {
        if (game.player === "player1") {
            game.aScore += 7;
            awayScore.innerHTML = game.aScore;
            lastPlayFunc(game.awayTeamName, " breaks away for a " + (100 - game.yardNumber) + " yard  Touchdown!!");
            fieldMarkings.style.right = "48vw";
            disable();
            setTimeout(() => {
                check("touch");
            }, 2000);
        } else if (game.player === "player2") {
            game.hScore += 7;
            homeScore.innerHTML = game.hScore;
            lastPlayFunc(game.homeTeamName, " breaks away for a " + (game.yardNumber) + " yard  Touchdown!!");
            fieldMarkings.style.right = "-68vw";
            disable();
            setTimeout(() => {
                check("touch");
            }, 2000);
        };
    } else {
        game.aScore += 7;
        awayScore.innerHTML = game.aScore;
        lastPlayFunc(game.awayTeamName, " breaks away for a " + (100 - game.yardNumber) + " yard  Touchdown!!");
        fieldMarkings.style.right = "48vw";
        disable();
        setTimeout(() => {
            check("touch");
        }, 2000);
    };
};

function turnover(turn) {
    if (game.twoPlayer === true) {
        if (game.player === "player1") {
            if (turn === "interception") {
                lastPlayFunc(game.awayTeamName, " throws an " + turn);
                check("not");
            } else if (turn === "fumble") {
                lastPlayFunc(game.awayTeamName, " fumbles");
                check("fumble");
            } else {
                check("not");
            };
        } else if (game.player === "player2") {
            if (turn === "interception") {
                lastPlayFunc(game.homeTeamName, " throws an " + turn);
            } else if (turn === "fumble") {
                lastPlayFunc(game.homeTeamName, " fumbles");
            };
            if (turn === "fumble") {
                check("fumble");
            } else {
                check("not");;
            };
        };
    } else {
        if (turn === "interception") {
            lastPlayFunc(game.awayTeamName, " throws an " + turn);
            check("not");
        } else if (turn === "fumble") {
            lastPlayFunc(game.awayTeamName, " fumbles");
            check("fumble");
        } else {
            check("not");
        };
    };
};

function change() {
    if (game.player === "player1") {
        dots[1].classList.add("hidden");
        dots[0].classList.remove("hidden");
        game.player = "player2";
    } else if (game.player === "player2") {
        dots[0].classList.add("hidden");
        dots[1].classList.remove("hidden");
        game.player = "player1";
    };
};

function check(h) {
    if (game.twoPlayer === true) {
        if (game.player === "player1") {
            game.p1DriveLeft--;
        } else if (game.player === "player2") {
            game.p2DriveLeft--;
        };
        if (game.p1DriveLeft < 0 && game.p2DriveLeft < 0 && game.quarterNum === 4) {
            game.gameOver = true;
            disable();
            over();
        } else if (game.p1DriveLeft < 0 && game.p2DriveLeft < 0 && game.quarterNum !== 4) {
            game.quarterNum++;
            quarterN.innerHTML = game.quarterNum + initial[game.quarterNum - 1];
            game.p1DriveLeft = 2;
            game.p2DriveLeft = 2;
            drive(h);
            undisable();
        } else {
            drive(h);
            undisable();
        };
    } else {
        game.p1DriveLeft--;
        homeTeamScore();
        setTimeout(() => {
            if (game.p1DriveLeft < 0 && game.quarterNum === 4) {
                game.gameOver = true;
                disable();
                over();
            } else if (game.p1DriveLeft < 0 && game.quarterNum !== 4) {
                game.quarterNum++;
                game.p1DriveLeft = 2;
                game.p2DriveLeft = 2;
                game.downNumber = 1;
                game.downYard = 10;
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
                dot();
                quarterN.innerHTML = game.quarterNum + initial[game.quarterNum - 1];
                z = Math.floor(Math.random() * 50);
                if (z === 0) {
                    z = 1;
                };
                game.yardNumber = z;
                yard();
                lastPlayFunc(game.awayTeamName, "'s ball at the " + game.yardNumber + " yard line.");
                undisable();
            } else {
                setTimeout(() => {
                    drive();
                    undisable();
                }, 2000);
            };
        }, 3850);
    };
};

function loss() {
    let g;
    if ((game.yardNumber > 15 && game.player === "player1") || (game.yardNumber < 85 && game.player === "player2")) {
        g = Math.floor(Math.random() * 10);
        if (game.player === "player2") {
            game.yardNumber += g;
        } else {
            game.yardNumber -= g;
        };
        yard();
        game.downYard += g;
        checkDown();
        downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
        yardht.innerHTML = game.downYard;
        inner("Ran for a " + g + " yard loss");
    } else if ((game.yardNumber > 1 && game.yardNumber < 15 && game.player === "player1") || (game.yardNumber > 85 && game.yardNumber < 99 && game.player === "player2")) {
        if (game.player === "player2") {
            g = Math.floor(Math.random() * (100 - game.yardNumber + 1));
            game.yardNumber += g;
        } else {
            g = Math.floor(Math.random() * game.yardNumber - 1);
            game.yardNumber -= g;
        };
        game.downYard += g;
        checkDown();
        downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
        yardht.innerHTML = game.downYard;
        yard();
        inner("Ran for a " + g + " yard loss");
    } else {
        g = 0;
        if (game.player === "player2") {
            game.yardNumber += g;
        } else {
            game.yardNumber -= g;
        };
        game.downYard += g;
        checkDown();
        downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
        yardht.innerHTML = game.downYard;
        yard();
        if (game.twoPlayer === true) {
            if (game.player === "player1") {
                lastPlayFunc(game.awayTeamName, " -- Ran for no gain");
            } else if (game.player === "player2") {
                lastPlayFunc(game.homeTeamName, " -- Ran for no gain");
            }
        } else {
            lastPlayFunc(game.awayTeamName, " -- Ran for no gain");
        };
    };
};

function gain() {
    let g;
    if ((game.yardNumber < 90 && game.player === "player1") || (game.yardNumber > 10 && game.player === "player2")) {
        let f = (100 - game.yardNumber) / 2;
        g = Math.floor(Math.random() * f);
        if (game.player === "player2") {
            game.yardNumber -= g;
        } else {
            game.yardNumber += g;
        };
        yard();
        if (g >= game.downYard) {
            game.downNumber = 1;
            game.downYard = 10;
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Ran for a " + g + " yard gain");
        } else {
            game.downYard -= g;
            checkDown();
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Ran for a " + g + " yard gain");
        };
    } else if ((game.yardNumber > 90 && game.player === "player1") || (game.yardNumber < 10 && game.player === "player2")) {
        let f = 10;
        g = Math.floor(Math.random() * f);
        if (((g + game.yardNumber) >= 100 && game.player === "player1") || ((game.yardNumber - g) <= 0 && game.player === "player2")) {
            touchdown();
        } else {
            if (g >= game.downYard) {
                game.downNumber = 1;
                game.downYard = 10;
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
                inner("Ran for a " + g + " yard gain");
            } else {
                game.downYard -= g;
                checkDown();
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
                inner("Ran for a " + g + " yard gain");
            };
            if (game.player === "player2") {
                game.yardNumber -= g;
            } else {
                game.yardNumber += g;
            };
            yard();
        };
    };
};

function complete(max, min) {
    if ((game.yardNumber <= 89 && game.player === "player1") || (game.yardNumber >= 11 && game.player === "player2")) {
        let j = Math.floor(Math.random() * passMax(max));
        if (j < min) {
            j = min;
        };
        if (j + game.yardNumber >= 100) {
            touchdown();
        } else {
            if (j >= game.downYard) {
                game.downNumber = 1;
                game.downYard = 10;
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
            } else {
                game.downYard -= j;
                checkDown();
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
            };
            game.yardNumber += j;
            yard();
            inner("Passed for " + j + " yards");
        };
    } else {
        let j = Math.floor(Math.random() * 10);
        if (j + game.yardNumber >= 100) {
            touchdown();
        } else {
            if (j >= game.downYard) {
                game.downNumber = 1;
                game.downYard = 10;
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
            } else {
                game.downYard -= j;
                checkDown();
                downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
                yardht.innerHTML = game.downYard;
            }
            inner("Passed for " + j + " yards");
            game.yardNumber += j;
            yard();
        };
    };
};

function sack() {
    if (game.player === "player1") {
        if (game.yardNumber > 5) {
            game.yardNumber -= 5;
            game.downYard += 5;
            checkDown();
            yard();
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Sacked for a 5 yard loss");
        } else {
            game.yardNumber -= 0;
            game.downYard += 0;
            checkDown();
            yard();
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Sacked for a 0 yard loss");
        };
    } else if (game.player === "player2") {
        if (game.yardNumber < 95) {
            game.yardNumber += 5;
            game.downYard += 5;
            checkDown();
            yard();
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Sacked for a 5 yard loss");
        } else {
            game.yardNumber -= 0;
            game.downYard += 0;
            checkDown();
            yard();
            downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
            yardht.innerHTML = game.downYard;
            inner("Sacked for a 0 yard loss");
        };
    };
};

function incomplete() {
    checkDown();
    downht.innerHTML = game.downNumber + initial[game.downNumber - 1];
    inner("Incomplete pass");
};

function inner(h) {
    if (game.twoPlayer === true) {
        if (game.player === "player1") {
            lastPlayFunc(game.awayTeamName, " -- " + h);
        } else if (game.player === "player2") {
            lastPlayFunc(game.homeTeamName, " -- " + h);
        }
    } else {
        lastPlayFunc(game.awayTeamName, " -- " + h);
    };
};

function tod() {
    setTimeout(() => {
        if (game.player === "player1") {
            lastPlayFunc(game.awayTeamName, " -- Turnover On Downs");
        } else if (game.player === "player2") {
            lastPlayFunc(game.homeTeamName, " -- Turnover On Downs");
        };
    }, 2000);
};