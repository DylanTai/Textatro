import easyWords from "./Words/easy.js";
console.log(easyWords);
import mediumWords from "./Words/medium.js";
import hardWords from "./Words/hard.js";

/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let score = 0;
let money = 0;
let metQuota = 0;
let round = 1;
let quota = 100;
let testWord;
let outputWords;
let textInput = "";
let dict = [];
let baseTime = 60;
let time = baseTime;
let timerInterval;
let shopCantBuyMsg;
let inShop = false;
let quotaPU = 0;
let timePU = 0;
let bonusPU = 0;
let shortenPU = 0;
let combo = 0;
let firstShop = true;
let difficulty = 0; // 0 = easy, 1 = medium, 2 = hard

/*------------------------ Cached Element References ------------------------*/
const nameBannerEl = document.querySelector(".name-banner");
const diffButton = document.getElementById("diffButton");
const timerEl = document.getElementById("timer");
const inputEl = document.getElementById("myInput");
const outputEl = document.getElementById("myOutput");
const diffButtonEl = document.getElementById("diffButton");
const startButtonEl = document.getElementById("startButton");
const scoreEl = document.getElementById("score");
const infoEl = document.getElementById("info");
const imagesEl = document.querySelectorAll(".image-container img");
const imageTextsEl = document.querySelectorAll(".image-text");
const descBoxEl = document.getElementById("description-box");
const comboEl = document.getElementById("combo");

/*-------------------------------- Functions --------------------------------*/

//initialization function
const init = () => {
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
  infoEl.style.visibility = "hidden";
  imagesEl.forEach((img) => {
    img.style.visibility = "hidden";
  });
  imageTextsEl.forEach((text) => {
    text.style.visibility = "hidden";
  });
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
  comboEl.style.visibility = "visible";
  timerEl.style.visibility = "visible";
  inputEl.style.visibility = "visible";
  scoreEl.style.visibility = "visible";
  infoEl.style.visibility = "visible";
  nameBannerEl.style.visibility = "hidden";
  diffButtonEl.style.visibility = "hidden";
  startButtonEl.style.visibility = "hidden";
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
    img.dataset.description = "Reduces the quota permanently by 3.";
  if (img.alt === "time")
    img.dataset.description = "Extend the time permanently by 1 second.";
  if (img.alt === "bonus")
    img.dataset.description = "An extra dollar per letter per purchase.";
  if (img.alt === "shorten")
    img.dataset.description = "Shortens words by 1 letter.";
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
    if (powerUp === "quota") quota -= 3;
    else if (powerUp === "time") baseTime += 1;
    imagesEl.forEach((img) => {
      if (img.alt === powerUp) {
        img.classList.remove("shake");
        img.classList.add("shake");
      }
      imageTextsEl.forEach((text) => {
        if (img.alt === text.id) updateText(img, text);
      });
    });
  } else {
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
  console.log(ret);
  if (ret.length - shortenPU >= 1)
    return ret.substring(0, ret.length - shortenPU);
  return randomWord();
};

// resets the input and possibly resets the word if it's in the round or not
const resetInput = () => {
  if (!inShop) {
    testWord = randomWord();
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
// transition = 3 -> go to next round/win
// transition = 4 -> go to you lose screen
const roundOver = (transition) => {
  timerEl.style.visibility = "hidden";
  outputEl.classList.remove("shake-infinite");
  comboEl.classList.remove("fadeInOut");
  combo = 0;
  metQuota = 0;
  clearInterval(timerInterval);
  resetInput();
  if (transition === 1) {
    if (round != 9) {
      quota += 5;
      baseTime -= 5;
      infoEl.classList.add("shake");
      round++;
      shopStart();
    } else if (round === 9) winLoseScreen("You won!");
  } else if (transition === 2) {
    //need to code a screen when you beat a round that shows stats
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
  comboEl.style.visibility = "hidden";
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
        ? '\nHover over each power up to see what it does!\nType the highlighted word to purchase power ups!\nType "continue" to go to the next round!'
        : "");
};

//part of the win or lose screen transition
const winLoseScreen = (text) => {
  scoreEl.style.visibility = "hidden";
  infoEl.style.visibility = "hidden";
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  outputEl.textContent = text;
  setTimeout(() => {
    location.reload();
  }, 5000);
};

//updates the timer
const updateCountdown = () => {
  if (time <= 0) roundOver(4);
  else time--;

  timerEl.textContent = `Time remaining: ${time}`;
};

//updates the text in the shop for the descriptions
const updateText = (img, text) => {
  let pu = findPU(img.alt);
  let cost = parseInt(img.dataset.base) + parseInt(img.dataset.increment) * pu;
  text.textContent = `Times Purchased: ${pu}\nCost: ${cost}`;
  if (img.alt === "quota") text.textContent += `\nCurrent quota: ${quota}`;
  if (img.alt === "time")
    text.textContent += `\nCurrent starting time: ${baseTime}`;
};

const playSound = (soundName) => {
  const audio = new Audio("Sounds/" + soundName + ".mp3");
  audio.play();
};

/*----------------------------- Event Listeners -----------------------------*/
init();

//reads the file inputted
startButtonEl.addEventListener("click", function () {
  let words;
  if (difficulty === 0) words = easyWords;
  else if (difficulty === 1) words = mediumWords;
  else if (difficulty === 2) words = hardWords;
  // check if the word is an actual word
  for (let itr = 0; itr < words.length; itr++)
    if (/^[A-Za-z]+$/.test(words[itr])) dict.push(words[itr].toLowerCase());
  gameRoundStart();
  resetInput();
  // outputEl.textContent = dict; //debug
});

//event listener for typing
inputEl.addEventListener("input", (event) => {
  textInput = event.target.value;
  playSound("type");
  //what happens if you're playing the game and not in a shop
  if (!inShop) {
    //outputs the array to the window to show which letters are good, bad, and not found yet
    outputWords = checkWords(textInput.trim(), testWord);
    if (outputWords[0].length > 0 && outputWords[1].length === 0) {
      outputEl.classList.add("shake-infinite");
    } else {
      outputEl.classList.remove("shake-infinite");
      if (combo >= 3) playSound("combo-failed");
      combo = 0;
    }
    outputEl.innerHTML = `<span class="correct">${outputWords[0]}</span><span class="crossed-out">${outputWords[1]}</span><span class=leftover">${outputWords[2]}</span>`;

    //what happens when you complete the word
    if (outputWords[0] === testWord) {
      playSound("correct");
      scoreEl.classList.add("shake");
      score += testWord.length;
      money += testWord.length * (bonusPU + 1);
      metQuota += testWord.length;
      combo++;
      //display combo if it's 3 or more
      if (combo >= 3) {
        comboEl.textContent = `COMBO: ${combo}`;
        comboEl.classList.add("fadeInOut");
        score += combo;
        money += combo;
        metQuota += combo;
      }
      if (metQuota >= quota) {
        let timeBonus = Math.round(time * 0.5);
        score += timeBonus;
        money += timeBonus;
        roundOver(1);
      } else resetInput();
    }
    //console.log("Current typed text:", textInput); //debug
  } else {
    //what happens if you're in a shop and are typing
    outputWord = textInput.trim().split(" ")[0];
    //console.log(outputWords); //debug
    if (["quota", "time", "bonus", "shorten"].includes(outputWord)) {
      purchase(outputWord);
      resetInput();
    } else if (outputWord === "continue") roundOver(3);
  }
});

//event listener for shaking for the top left score
scoreEl.addEventListener("animationend", () => {
  scoreEl.classList.remove("shake");
});

//event listener for shaking for the top right info
infoEl.addEventListener("animationend", () => {
  infoEl.classList.remove("shake");
});

//event listener for the combo
comboEl.addEventListener("animationend", () => {
  comboEl.classList.remove("fadeInOut");
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
    purchase(img.alt);
    handleMouseEnter(img);
  });

  img.addEventListener("animationend", () => {
    img.classList.remove("shake");
  });
});

diffButton.addEventListener("click", () => {
  const difficulties = [
    { name: "Easy", color: "green" },
    { name: "Medium", color: "orange" },
    { name: "Hard", color: "red" },
  ];
  let itr = ++difficulty % difficulties.length;
  const currentDiff = difficulties[itr];
  diffButton.textContent = "Difficulty: " + currentDiff.name;
  diffButton.style.backgroundColor = currentDiff.color;
});
