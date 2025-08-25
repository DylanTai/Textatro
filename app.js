import easyWords from "./Words/easy.js";
import mediumWords from "./Words/medium.js";
import hardWords from "./Words/hard.js";

/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let baseTime = 60;
let bonusPU = 0;
let combo = 0;
let dict = [];
let difficulty = 0; // 0 = easy, 1 = medium, 2 = hard
let firstShop = true;
let inShop = false;
let largestCombo = 0;
let metQuota = 0;
let money = 0;
let moneyRound = 0;
let outputWords;
let quota = 100;
let quotaPU = 0;
let round = 1;
let score = 0;
let shopCantBuyMsg;
let shortenPU = 0;
let showInstruct = false;
let testWord = "";
let textInput = "";
let time = baseTime;
let timePU = 0;
let timerInterval;

/*------------------------ Cached Element References ------------------------*/
const comboEl = document.getElementById("combo");
const descBoxEl = document.getElementById("description-box");
const diffButtonEl = document.getElementById("diffButton");
const imageTextsEl = document.querySelectorAll(".image-text");
const imagesEl = document.querySelectorAll(".image-container img");
const infoEl = document.getElementById("info");
const inputEl = document.getElementById("myInput");
const instructButtonEl = document.getElementById("instructButton");
const nameBannerEl = document.querySelector(".name-banner");
const outputEl = document.getElementById("myOutput");
const resultsEl = document.querySelector(".results-container");
const scoreEl = document.getElementById("score");
const startButtonEl = document.getElementById("startButton");
const timerEl = document.getElementById("timer");

/*-------------------------------- Functions --------------------------------*/

//initialization function
const init = () => {
  startButtonEl.classList.add("shake-infinite");
  timerEl.style.visibility = "hidden";
  inputEl.style.display = "none";
  scoreEl.style.visibility = "hidden";
  infoEl.style.visibility = "hidden";
  imagesEl.forEach((img) => {
    img.style.visibility = "hidden";
  });
  imageTextsEl.forEach((text) => {
    text.style.visibility = "hidden";
  });
  resultsEl.style.display = "none";
};

//checks to see how much of a word is finished and returns an array that has:
//[correct letters in a string, incorrect letters in a string, rest of the leftover letters]
const checkWords = (answer, tester) => {
  let correct = "";
  let incorrect = "";
  let leftovers = "";
  let itr;
  for (itr = 0; itr < tester.length; itr++) {
    if (
      itr < answer.length &&
      answer[itr] === tester[itr] &&
      incorrect.length === 0
    )
      correct += answer[itr];
    else if (itr < answer.length) incorrect += answer[itr];
    else leftovers += tester[itr];
  }
  for (itr; itr < answer.length; itr++) incorrect += answer[itr];
  return [correct, incorrect, leftovers];
};

//input a string, outputs the amount of times that power-up was bought
const findPU = (powerUp) => {
  if (powerUp === "quota") return quotaPU;
  else if (powerUp === "time") return timePU;
  else if (powerUp === "bonus") return bonusPU;
  else if (powerUp === "shorten") return shortenPU;
  console.error("findPU: Incorrect powerUp input");
};

//what happens when the game starts
const gameRoundStart = () => {
  inShop = false;
  time = baseTime;
  timerEl.textContent = `Time remaining: ${baseTime}`;
  timerInterval = setInterval(updateCountdown, 1000);
  nameBannerEl.remove();
  diffButtonEl.remove();
  startButtonEl.remove();
  instructButtonEl.remove();
  comboEl.style.visibility = "visible";
  timerEl.style.visibility = "visible";
  inputEl.style.display = "block";
  outputEl.style.visibility = "visible";
  scoreEl.style.visibility = "visible";
  infoEl.style.visibility = "visible";
  imagesEl.forEach((img) => {
    img.style.visibility = "hidden";
  });
  imageTextsEl.forEach((text) => {
    text.style.visibility = "hidden";
  });
};

//this handles what happens when you hover over the mouse. in a function so it can update when you purchase something by clicking as well
const handleMouseEnter = (img) => {
  if (img.alt === "quota")
    img.dataset.description = "Reduces the quota permanently by 10.";
  if (img.alt === "time")
    img.dataset.description = "Extend the time permanently by 3 seconds.";
  if (img.alt === "bonus")
    img.dataset.description = "An extra dollar per letter per purchase.";
  if (img.alt === "shorten")
    img.dataset.description =
      "Shortens words by 1 letter. If the word is too small to be shortened, displays one letter.";
  descBoxEl.textContent = img.dataset.description;
  descBoxEl.style.visibility = "visible";
};

//input a string, increments the corresponding power up
const incrementPU = (powerUp) => {
  if (powerUp === "quota") quotaPU++;
  else if (powerUp === "time") timePU++;
  else if (powerUp === "bonus") bonusPU++;
  else if (powerUp === "shorten") shortenPU++;
  else console.error("incrementPU: Incorrect powerUp input");
};

//plays the sound name of a file in the Sounds folder
const playSound = (soundName) => {
  const audio = new Audio("Sounds/" + soundName + ".mp3");
  audio.play();
};

const purchase = (powerUp) => {
  //determine the price
  let price;
  imagesEl.forEach((img) => {
    if (img.alt === powerUp) {
      price =
        parseInt(img.dataset.base) +
        parseInt(img.dataset.increment) * findPU(powerUp);
    }
  });
  //console.log(price); //debug

  //purchase the item or tell the user they don't have the money for it
  if (money >= price) {
    playSound("purchase");
    money -= price;
    incrementPU(powerUp);
    if (powerUp === "quota") quota -= 10;
    else if (powerUp === "time") baseTime += 3;
    imagesEl.forEach((img) => {
      if (img.alt === powerUp) {
        img.classList.remove("shake");
        img.classList.add("shake");
      }
      imageTextsEl.forEach((text) => {
        if (img.alt === text.id) updateText(img, text);
      });
    });
  } else if (money < price) {
    playSound("combo-failed");
    outputEl.textContent =
      `You need $${price - money} to purchase that.` +
      (firstShop ? "\n\n\n\n" : "");
    clearTimeout(shopCantBuyMsg);
    shopCantBuyMsg = setTimeout(showShopMessage, 3500);
  }
  resetInput();
  scoreEl.classList.add("shake");
};

//returns a random word from the list of words
const randomWord = () => {
  let ret = dict[Math.floor(Math.random() * dict.length)];
  if (ret.length - shortenPU >= 1)
    return ret.substring(0, ret.length - shortenPU);
  return ret.substring(0, 1);
};

// resets the input and possibly resets the word if it's in the round or not
const resetInput = () => {
  if (!inShop) {
    let prevWord = testWord;
    //makes sure you cant get the same word twice in a row
    while (prevWord === testWord) testWord = randomWord();
    outputEl.classList.remove("shake-infinite");
    outputEl.textContent = testWord;
  }
  //console.log("Score: " + score); //debug
  inputEl.value = "";
  scoreEl.textContent = `Score: ${score}\nMoney: $${money}\nQuota: ${metQuota}/${quota}`;
  infoEl.textContent = `Round: ${round}\n`;
};

// what happens when each round is over
// transition = 1 -> go to shop
// transition = 2 -> go to stat screen
// transition = 3 -> go to next round/win
// transition = 4 -> go to you lose screen
const roundOver = (transition) => {
  timerEl.style.visibility = "hidden";
  comboEl.style.visibility = "hidden";
  outputEl.classList.remove("shake-infinite");
  comboEl.classList.remove("fadeInOut");
  combo = 0;
  metQuota = 0;
  clearInterval(timerInterval);
  resetInput();
  if (transition === 1) {
    if (round != 9) {
      infoEl.classList.add("shake");
      quota += 50;
      round++;
      shopStart();
    } else if (round === 9) winLoseScreen("You won!");
  } else if (transition === 2) {
    inputEl.value = "";
    //need to code a screen when you beat a round that shows stats'
    statRoundStart();
  } else if (transition === 3) {
    firstShop = false;
    gameRoundStart();
    resetInput();
  } else if (transition === 4) {
    winLoseScreen("You lost!");
  } else console.error("Transition output incorrect");
};

//what happens when you enter the shop
const shopStart = () => {
  inShop = true;
  resetInput();
  showShopMessage();
  resultsEl.style.display = "none";
  inputEl.style.display = "block";
  outputEl.style.visibility = "visible";
  scoreEl.style.visibility = "visible";
  infoEl.style.visibility = "visible";
  imagesEl.forEach((img) => {
    img.style.visibility = "visible";
    imageTextsEl.forEach((text) => {
      text.style.visibility = "visible";
      if (img.alt === text.id) updateText(img, text);
    });
  });
};

//function to show the chat
const showShopMessage = () => {
  if (inShop)
    outputEl.textContent =
      "Welcome to the shop!" +
      (firstShop
        ? '\nHover over each power up to see what it does!\nType the highlighted word to purchase!\nType "continue" to go to the next round!'
        : "");
};

const statRoundStart = () => {
  updateResults();
  resultsEl.style.display = "block";
  inputEl.style.display = "none";
  outputEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
  infoEl.style.visibility = "hidden";
};

//part of the win or lose screen transition
const winLoseScreen = (text) => {
  resultsEl.style.display = "none";
  outputEl.style.visibility = "visible";
  outputEl.textContent = text + `\nYour final score was ${score}!`;
  setTimeout(() => {
    location.reload();
  }, 5000);
};

//updates the timer
const updateCountdown = () => {
  if (time <= 0) roundOver(2);
  else time--;

  timerEl.textContent = `Time remaining: ${time}`;
};

// Call this whenever you have fresh values for the round
function updateResults() {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = `
      <tr>
        <td>${score}</td>
        <td>${time} seconds (+$${Math.round(time * 0.5)}!)</td>
        <td>$${moneyRound}</td>
        <td>${largestCombo}</td>
      </tr>
      <td colspan="4" class="continue-text">Press Enter to continue!</td>
    `;
  moneyRound = 0;
  largestCombo = 0;
}

//updates the text in the shop for the descriptions
const updateText = (img, text) => {
  let pu = findPU(img.alt);
  let cost = parseInt(img.dataset.base) + parseInt(img.dataset.increment) * pu;
  text.textContent = `Times Purchased: ${pu}\nCost: ${cost}`;
  if (img.alt === "quota") text.textContent += `\nCurrent quota: ${quota}`;
  if (img.alt === "time")
    text.textContent += `\nCurrent starting time: ${baseTime}`;
};

/*----------------------------- Event Listeners -----------------------------*/
init();

//global check for pressing enter for results
document.addEventListener("keydown", (event) => {
  if (
    window.getComputedStyle(resultsEl).display === "block" &&
    event.key === "Enter"
  ) {
    if (time <= 0) roundOver(4);
    else roundOver(1);
  }
});

//event listener for shaking for the top right info
infoEl.addEventListener("animationend", () => {
  infoEl.classList.remove("shake");
});

//event listener for the combo
comboEl.addEventListener("animationend", () => {
  comboEl.classList.remove("fadeInOut");
});

descBoxEl; // only manipulated inside other listeners, no addEventListener

//difficulty button
diffButton.addEventListener("click", () => {
  playSound("click");
  const difficulties = [
    { name: "Easy", color: "green" },
    { name: "Medium", color: "orange" },
    { name: "Hard", color: "red" },
  ];
  difficulty = (difficulty + 1) % difficulties.length;
  const currentDiff = difficulties[difficulty];
  diffButton.textContent = "Difficulty: " + currentDiff.name;
  diffButton.style.backgroundColor = currentDiff.color;
});

//what happens when you click the instruct button
instructButtonEl.addEventListener("click", () => {
  playSound("click");
  if (!showInstruct) {
    startButtonEl.style.display = "none";
    diffButtonEl.style.display = "none";
    instructButtonEl.textContent = "Back";
    outputEl.style.visibility = "visible";
    outputEl.style.textAlign = "left";
    outputEl.textContent =
      "How to Play:\n1.) Cycle and choose Difficulty with the button.\n2.) Press Start! to begin.\n3.) Type the word shown as fast and accurately as you can.\n4.) Fill the Quota (enough letters typed) before the Timer runs out.\n5.) After each round, enter the Shop:\n\t-Type quota, time, bonus, or shorten to buy upgrades.\n\t-Type continue to start the next round.\n6.) Each new round gets an extra 50 quota.\n7.) Chain perfect words to build Combos for extra points.\n8.) Beat all 9 rounds to win- run out of time and you lose.";
  } else {
    startButtonEl.style.display = "block";
    diffButtonEl.style.display = "block";
    instructButtonEl.textContent = "Instructions";
    outputEl.style.visibility = "hidden";
    outputEl.style.textAlign = "center";
    outputEl.textContent = "";
  }
  showInstruct = !showInstruct;
});

//event listener for typing
inputEl.addEventListener("input", (event) => {
  textInput = event.target.value;
  playSound("type");
  if (!inShop) {
    outputWords = checkWords(textInput.trim(), testWord);
    if (outputWords[0].length > 0 && outputWords[1].length === 0) {
      outputEl.classList.add("shake-infinite");
    } else {
      outputEl.classList.remove("shake-infinite");
      if (combo >= 3) playSound("combo-failed");
      combo = 0;
    }
    outputEl.innerHTML = `<span class="correct">${outputWords[0]}</span><span class="crossed-out">${outputWords[1]}</span><span class=leftover">${outputWords[2]}</span>`;

    if (outputWords[0] === testWord) {
      playSound("correct");
      scoreEl.classList.add("shake");
      score += testWord.length;
      money += testWord.length * (bonusPU + 1);
      moneyRound += testWord.length * (bonusPU + 1);
      metQuota += testWord.length;
      combo++;
      if (combo >= 3) {
        comboEl.textContent = `COMBO: ${combo}`;
        comboEl.classList.add("fadeInOut");
        score += combo;
        money += combo;
        moneyRound += combo;
        metQuota += combo;
        largestCombo = combo > largestCombo ? combo : largestCombo;
      }
      if (metQuota >= quota) {
        let timeBonus = Math.round(time * 0.5);
        score += timeBonus;
        money += timeBonus;
        moneyRound += timeBonus;
        roundOver(2);
      } else resetInput();
    }
  } else {
    let outputWord = textInput.trim().split(" ")[0];
    if (["quota", "time", "bonus", "shorten"].includes(outputWord)) {
      purchase(outputWord);
      resetInput();
    } else if (outputWord === "continue") roundOver(3);
  }
});

//event listener for every single image in the shop
imagesEl.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    handleMouseEnter(img);
  });

  img.addEventListener("mouseleave", () => {
    descBoxEl.style.visibility = "hidden";
  });

  img.addEventListener("click", () => {
    playSound("click");
    purchase(img.alt);
    handleMouseEnter(img);
  });

  img.addEventListener("animationend", () => {
    img.classList.remove("shake");
  });
});

//event listener for shaking for the top left score
scoreEl.addEventListener("animationend", () => {
  scoreEl.classList.remove("shake");
});

//reads the file inputted
startButtonEl.addEventListener("click", function () {
  let words;
  playSound("click");
  if (difficulty === 0) words = easyWords;
  else if (difficulty === 1) words = mediumWords;
  else if (difficulty === 2) words = hardWords;

  for (let itr = 0; itr < words.length; itr++)
    if (/^[A-Za-z]+$/.test(words[itr])) dict.push(words[itr].toLowerCase());
  gameRoundStart();
  resetInput();
});
