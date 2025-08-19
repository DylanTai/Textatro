/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let score = (money = metQuota = 0);
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
let quotaPU = (timePU = bonusPU = shortenPU = 0);
let combo = 0;

/*------------------------ Cached Element References ------------------------*/
const timerEl = document.getElementById("timer");
const inputEl = document.getElementById("myInput");
const outputEl = document.getElementById("myOutput");
const browseButtonEl = document.getElementById("browseButton");
const startButtonEl = document.getElementById("startButton");
const scoreEl = document.getElementById("score");
const infoEl = document.getElementById("info");
const images = document.querySelectorAll(".image-container img");
const descBoxEl = document.getElementById("description-box");
const comboEl = document.getElementById("combo");

/*-------------------------------- Functions --------------------------------*/

//initialization function
const init = () => {
  outputEl.textContent =
    "Please input the text file with which words you want!";
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  comboEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
  infoEl.style.visibility = "hidden";
  images.forEach((img) => {
    img.style.visibility = "hidden";
  });
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
  browseButtonEl.style.visibility = "hidden";
  startButtonEl.style.visibility = "hidden";
  images.forEach((img) => {
    img.style.visibility = "hidden";
  });
};

// what happens when each round is over
// transition = 1 -> go to shop
// transition = 2 -> go to next round
// transition = 3 -> go to you lose screen
const roundOver = (transition) => {
  timerEl.style.visibility = "hidden";
  outputEl.classList.remove("shake-infinite");
  comboEl.classList.remove("fadeInOut");
  combo = 0;
  metQuota = 0;
  clearInterval(timerInterval);
  if (transition === 1) {
    if (round != 9) {
      quota += 5;
      baseTime -= 5;
      infoEl.classList.add("shake");
      shopStart();
    } else if (round === 9) {
      outputEl.textContent = "You win!";
      setTimeout(() => {
        location.reload();
      }, 5000);
    }
    round++;
  } else if (transition === 2) {
    gameRoundStart();
    resetInput();
  } else if (transition === 3) {
    scoreEl.style.visibility = "hidden";
    infoEl.style.visibility = "hidden";
    timerEl.style.visibility = "hidden";
    inputEl.style.visibility = "hidden";
    outputEl.textContent = "You lost!";
    setTimeout(() => {
      location.reload();
    }, 5000);
  } else console.error("Transition output incorrect");
};

//function to show the chat
const showShopMessage = () => {
  if (inShop)
    outputEl.textContent =
      'Welcome to the shop!\nHover over each power up to see what it does!\nClick on the button or type "buy name-of-item" when you want to buy something.\nType "continue" to go to the next round!';
};

const shopStart = () => {
  inShop = true;
  showShopMessage();
  comboEl.style.visibility = "hidden";
  images.forEach((img) => {
    img.style.visibility = "visible";
  });
};

const purchase = (powerUp) => {
  //determine the price
  let price;
  images.forEach((img) => {
    if (img.alt === powerUp) {
      price = parseInt(img.dataset.base);
      if (powerUp === "quota")
        price += parseInt(img.dataset.increment) * quotaPU;
      else if (powerUp === "time")
        price += parseInt(img.dataset.increment) * timePU;
      else if (powerUp === "bonus")
        price += parseInt(img.dataset.increment) * bonusPU;
      else if (powerUp === "shorten")
        price += parseInt(img.dataset.increment) * shortenPU;
    }
  });
  //console.log(price); //debug

  //purchase the item or tell the user they don't have the money for it
  if (money >= price) {
    money -= price;
    if (powerUp === "quota") {
      quotaPU++;
      quota -= 3;
    } else if (powerUp === "time") {
      timePU++;
      baseTime += 1;
    } else if (powerUp === "bonus") bonusPU++;
    else if (powerUp === "shorten") shortenPU++;
    else console.error("Power up not found");
    infoEl.classList.add("shake");
  } else {
    outputEl.textContent = "You do not have enough money to purchase that.";
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
  if (quotaPU > 0) infoEl.textContent += `Quota Level ${quotaPU}\n`;
  if (timePU > 0) infoEl.textContent += `Time Level ${timePU}\n`;
  if (bonusPU > 0) infoEl.textContent += `Bonus Level ${bonusPU}\n`;
  if (shortenPU > 0) infoEl.textContent += `Shorten Level ${shortenPU}\n`;
  if (inShop) infoEl.textContent += `Total time: ${baseTime}\n`;
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

//updates the timer
const updateCountdown = () => {
  if (time <= 0) roundOver(3);
  else time--;

  timerEl.textContent = `Time remaining: ${time}`;
};

//this handles what happens when you hover over the mouse. in a function so it can update when you purchase something by clicking as well
const handleMouseEnter = (img) => {
  if (img.alt === "quota")
    img.dataset.description =
      "Reduces the quota permanently by 3.\nCost: " +
      (
        parseInt(img.dataset.base) +
        parseInt(img.dataset.increment) * quotaPU
      ).toString() +
      '\n"buy quota"';
  if (img.alt === "time")
    img.dataset.description =
      "Extend the time permanently by 1 second.\nCost: " +
      (
        parseInt(img.dataset.base) +
        parseInt(img.dataset.increment) * timePU
      ).toString() +
      '\n"buy time"';
  if (img.alt === "bonus")
    img.dataset.description =
      "Gives more gold per word typed. Each level is another gold.\nCost: " +
      (
        parseInt(img.dataset.base) +
        parseInt(img.dataset.increment) * bonusPU
      ).toString() +
      '\n"buy bonus"';
  if (img.alt === "shorten")
    img.dataset.description =
      "Shortens words by 1 letter.\nCost: " +
      (
        parseInt(img.dataset.base) +
        parseInt(img.dataset.increment) * shortenPU
      ).toString() +
      '\n"buy shorten"';
  descBoxEl.textContent = img.dataset.description;
  descBoxEl.style.visibility = "visible";
};

/*----------------------------- Event Listeners -----------------------------*/
init();

//reads the file inputted
startButtonEl.addEventListener("click", function () {
  const file = browseButtonEl.files[0]; // Get the first selected file
  //
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result; // Get the file content as a string
      // Split content by new lines into an array
      dict = fileContent.split("\n");
      // check if the word is an actual word
      for (let itr = 0; itr < dict.length; itr++) {
        if (!/^[A-Za-z]+$/.test(dict[itr])) dict.splice(itr--, 1);
        else dict[itr] = dict[itr].toLowerCase();
      }
      gameRoundStart();
      resetInput();
      // outputEl.textContent = dict; //debug
    };
    reader.onerror = function (event) {
      console.error("Error reading file:", event);
      outputEl.textContent = "Error reading file.";
    };
    reader.readAsText(file); // Read the file as plain text
  } else {
    outputEl.textContent = "Please select a file.";
  }
});

//event listener for typing
inputEl.addEventListener("input", (event) => {
  textInput = event.target.value;
  //what happens if you're playing the game and not in a shop
  if (!inShop) {
    //outputs the array to the window to show which letters are good, bad, and not found yet
    outputWords = checkWords(textInput.trim(), testWord);
    if (outputWords[0].length > 0 && outputWords[1].length === 0) {
      outputEl.classList.add("shake-infinite");
    } else {
      outputEl.classList.remove("shake-infinite");
      combo = 0;
    }
    outputEl.innerHTML = `<span class="correct">${outputWords[0]}</span><span class="crossed-out">${outputWords[1]}</span><span class=leftover">${outputWords[2]}</span>`;

    //what happens when you complete the word
    if (outputWords[0] === testWord) {
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
      if (metQuota >= quota) roundOver(1);
      resetInput();
    }
    //console.log("Current typed text:", textInput); //debug
  } else {
    //what happens if you're in a shop
    outputWords = textInput.trim().split(" ");
    //console.log(outputWords); //debug
    if (
      outputWords.length === 2 &&
      outputWords[0] === "buy" &&
      ["quota", "time", "bonus", "shorten"].includes(outputWords[1])
    ) {
      purchase(outputWords[1]);
      resetInput();
    } else if (outputWords.length === 1 && outputWords[0] === "continue")
      roundOver(2);
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
images.forEach((img) => {
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
});
