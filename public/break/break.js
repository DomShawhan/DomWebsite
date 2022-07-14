const selectors = [
    document.getElementById('red'),
    document.getElementById('blue'),
    document.getElementById('green'),
    document.getElementById('yellow'),
    document.getElementById('black'),
    document.getElementById('white'),
],
clearRound = document.getElementById('clear-round'),
submitRound = document.getElementById('submit'),
selectorBox = document.getElementById('select-box'),
restartGameBtn = document.getElementById('restart');
//Game object
let game = {
    round: 1,
    previousRounds: [],
    roundObj: [],
    att: 'att-1',
    dot: 'first',
    secretCode: [],
}
//Replaces not-selected dots with the correct color
const selectorsListen = (i) => {
    let dot = document.querySelector('.' + game.att + ' > .guess > .' + game.dot);
    switch (i) {
        case 0:
            dot.classList.replace('not-selected', 'red');
            game.roundObj.push('red');
            break;
        case 1:
            dot.classList.replace('not-selected', 'blue');
            game.roundObj.push('blue');
            break;
        case 2:
            dot.classList.replace('not-selected', 'green');
            game.roundObj.push('green');
            break;
        case 3:
            dot.classList.replace('not-selected', 'yellow');
            game.roundObj.push('yellow');
            break;
        case 4:
            dot.classList.replace('not-selected', 'black');
            game.roundObj.push('black');
            break;
        case 5:
            dot.classList.replace('not-selected', 'white');
            game.roundObj.push('white');
            break;
    }
    checkGameDot();
}
//Check which dot in the row is next
const checkGameDot = () => {
    switch (game.dot) {
        case 'first':
            clearRound.disabled = false;
            game.dot = 'second';
            break;
        case 'second': 
            game.dot = 'third';
            break;
        case 'third':
            game.dot = 'fourth';
            break;
        case 'fourth': 
            selectorBox.style.visibility = 'hidden';
            selectorBox.style.opacity = 0;
            submitRound.disabled = false;
            break;
    }
}
//Add Event Listeners to selector dots
for(let i = 0; i < selectors.length; i++) {
    selectors[i].addEventListener('click', (e) => { selectorsListen(i); });
};
//Submit Round
submitRound.addEventListener('click', (e) => {
    let secretCode = [];
    game.secretCode.forEach((part) => {
        secretCode.push(part);
    });
    let guess = [];
    game.roundObj.forEach((part) => {
        guess.push(part);
    });
    let resultDot = document.querySelectorAll('.' + game.att + ' > .result > .small-circle');
    let resultDotNum = 0;
    let numCorrect = 0;
    guess.forEach((code1, i) => {
        if(code1 === secretCode[i]) {
            guess[i] = 0;
            secretCode[i] = 0;
            resultDot[resultDotNum].classList.replace('not-selected', 'red');
            resultDotNum++;
            numCorrect++;
        } 
    });
    secretCode.forEach((secCode, i) => {
        if(secCode !== 0) {
            for(let index = 0; index < game.roundObj.length; index++) {
                if(game.roundObj[index] === secCode && guess[index] !== 0) {
                    secretCode[i] = 0;
                    guess[index] = 0;
                    resultDot[resultDotNum].classList.replace('not-selected', 'white');
                    resultDotNum++;
                    break;
                }
            }
        };
    });
    if(numCorrect === 4) {
        showPopup('Congradulations', 'You cracked the code!');
    } else if(game.round === 10) {
        showPopup('Failed', 'You failed to crack the code! <br> Try again.');
    } else {
        game.round++;
        game.att = 'att-' + game.round;
        let gameRound = {
            round: game.att,
            guess: game.roundObj,
        };
        game.previousRounds.push(gameRound);
        submitRound.disabled = true;
        clearRound.disabled = true;
        selectorBox.style.visibility = 'visible';
        selectorBox.style.opacity = 1;
        game.dot = 'first';
        game.roundObj = [];
    }
});
//Clear Round
clearRound.addEventListener('click', (e) => {
    game.roundObj = [];
    changeDotsColorToOriginal(game.att, false);
    if(submitRound.disabled === false) {
        submitRound.disabled = true;
    }
    clearRound.disabled = true;
    game.dot = 'first';
    selectorBox.style.visibility = 'visible';
    selectorBox.style.opacity = 1;
})
//Create code
const createCode = () => {
    let secretDots = [
        Math.floor(Math.random()*6),
        Math.floor(Math.random()*6),
        Math.floor(Math.random()*6),
        Math.floor(Math.random()*6)
    ]
    secretDots.forEach((dot, i) => {
        switch (dot) {
            case 0:
                secretDots[i] = 'red';
                break;
            case 1:
                secretDots[i] = 'blue';
                break;
            case 2:
                secretDots[i] = 'green';
                break;
            case 3:
                secretDots[i] = 'yellow';
                break;
            case 4:
                secretDots[i] = 'black';
                break;
            case 5:
                secretDots[i] = 'white';
                break;
            default: 
                break;
        };
    });
    game.secretCode = secretDots;
}

const showPopup = (title, description) => {
    const solutionCon = document.getElementById('solution');
    const popup = document.getElementById('sol-popup');
    const header = document.getElementById('header');
    const subHeader = document.getElementById('sub-header');
    let solutionDotsHTML = document.querySelectorAll('.solution > .circle');
    solutionDotsHTML[0].classList.replace('not-selected', game.secretCode[0]);
    solutionDotsHTML[1].classList.replace('not-selected', game.secretCode[1]);
    solutionDotsHTML[2].classList.replace('not-selected', game.secretCode[2]);
    solutionDotsHTML[3].classList.replace('not-selected', game.secretCode[3]);

    header.innerHTML = title;
    subHeader.innerHTML = description;
    
    solutionCon.classList.remove('hidden');
    popup.classList.remove('hidden');
}

restartGameBtn.addEventListener('click', (e) => {
    const solutionCon = document.getElementById('solution');
    const popup = document.getElementById('sol-popup');
    
    game = {
        round: 1,
        previousRounds: [],
        roundObj: [],
        att: 'att-1',
        dot: 'first',
        secretCode: [],
    }

    for(let i = 1; i < 11; i++) {
        changeDotsColorToOriginal('att-' + i, true);
    }

    selectorBox.style.visibility = 'visible';
    selectorBox.style.opacity = 1;
    submitRound.disabled = true;

    solutionCon.classList.add('hidden');
    popup.classList.add('hidden');

    createCode();
})

const changeDotsColorToOriginal = (att, changeSmallCircle) => {
    let dots = [
        document.querySelector('.' + att + ' > .guess > .first'),
        document.querySelector('.' + att + ' > .guess > .second'),
        document.querySelector('.' + att + ' > .guess > .third'),
        document.querySelector('.' + att + ' > .guess > .fourth')
    ];

    if(changeSmallCircle === true) {
        const smallCirles = document.querySelectorAll('.' + att + ' > .result > .small-circle');

        dots.push(...smallCirles);
        
        let solutionDotsHTML = document.querySelectorAll('.solution > .circle');

        dots.push(...solutionDotsHTML);
    }

    dots.forEach((dot) => {
        if(dot.classList.contains('red')) {
            dot.classList.replace('red', 'not-selected');
        } else if(dot.classList.contains('blue')) {
            dot.classList.replace('blue', 'not-selected');
        } else if(dot.classList.contains('green')) {
            dot.classList.replace('green', 'not-selected');
        } else if(dot.classList.contains('yellow')) {
            dot.classList.replace('yellow', 'not-selected');
        } else if(dot.classList.contains('black')) {
            dot.classList.replace('black', 'not-selected');
        } else if(dot.classList.contains('white')) {
            dot.classList.replace('white', 'not-selected');
        };
    });
}

createCode();
