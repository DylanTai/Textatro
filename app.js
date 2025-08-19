/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let score = (money = metQuota = 0);
let round = 0;
let quota = 30;
let testWord;
let outputWords;
let textInput = "";
let dict = [];
let baseTime = 60;
let time = baseTime;
let timerInterval;
let inShop = false;
let quotaPU = (timePU = bonusPU = shortenPU = 0);

/*------------------------ Cached Element References ------------------------*/
const timerEl = document.getElementById("timer");
const inputEl = document.getElementById("myInput");
const outputEl = document.getElementById("myOutput");
const browseButtonEl = document.getElementById("browseButton");
const startButtonEl = document.getElementById("startButton");
const scoreEl = document.getElementById("score");
const images = document.querySelectorAll(".image-container img");
const descBoxEl = document.getElementById("description-box");

/*-------------------------------- Functions --------------------------------*/

//initialization and reset functionality function
const init = () => {
  outputEl.textContent =
    "Please input the text file with which words you want!";
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
  images.forEach((img) => {
    img.style.visibility = "hidden";
  });
};

const gameRoundStart = () => {
  inShop = false;
  time = baseTime;
  timerEl.textContent = `Time remaining: ${baseTime}`;
  timerInterval = setInterval(updateCountdown, 1000);
  timerEl.style.visibility = "visible";
  inputEl.style.visibility = "visible";
  scoreEl.style.visibility = "visible";
  browseButtonEl.style.visibility = "hidden";
  startButtonEl.style.visibility = "hidden";
  images.forEach((img) => {
    img.style.visibility = "hidden";
  });
};

// transition = 1 -> go to shop
// transition = 2 -> go to next round
// transition = 3 -> go to you lose screen
const roundOver = (transition) => {
  timerEl.style.visibility = "hidden";
  outputEl.classList.remove("shake-infinite");
  metQuota = 0;
  clearInterval(timerInterval);
  if (transition === 1) {
    if (round != 9) {
      quota += 10;
      baseTime -= 10;
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
    outputEl.textContent = "You lost!";
    setTimeout(() => {
      location.reload();
    }, 5000);
  } else console.log("Transition output incorrect");
};

const shopStart = () => {
  inShop = true;
  outputEl.textContent =
    'Welcome to the shop!\nHover over each power up to see what it does!\nType "buy name-of-item" when you want to buy something.\nType "continue" to go to the next round!';
  images.forEach((img) => {
    img.style.visibility = "visible";
  });
};

//returns a random word from the list of words
const randomWord = () => {
  return dict[Math.floor(Math.random() * dict.length)];
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

const updateCountdown = () => {
  if (time <= 0) roundOver(3);
  else time--;

  timerEl.textContent = `Time remaining: ${time}`;
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
  if (!inShop) {
    outputWords = checkWords(textInput.trim(), testWord);
    if (outputWords[0].length > 0 && outputWords[1].length === 0) {
      outputEl.classList.add("shake-infinite");
    } else outputEl.classList.remove("shake-infinite");
    outputEl.innerHTML = `<span class="correct">${outputWords[0]}</span><span class="crossed-out">${outputWords[1]}</span><span class=leftover">${outputWords[2]}</span>`;
    if (outputWords[0] === testWord) {
      scoreEl.classList.add("shake");
      score += testWord.length;
      money += testWord.length;
      metQuota += testWord.length;
      if (metQuota >= quota) roundOver(1);
      resetInput();
    }
    //console.log("Current typed text:", textInput); //debug
  } else {
    outputWords = textInput.trim().split(" ");
    console.log(outputWords);
    if (
      outputWords.length === 2 &&
      outputWords[0] === "buy" &&
      ["quota", "time", "bonus", "shorten"].includes(outputWords[1])
    ) {
      if (money >= 30) {
        if (outputWords[1] === "quota") quotaPU++;
        else if (outputWords[1] === "time") timePU++;
        else if (outputWords[1] === "bonus") bonusPU++;
        else if (outputWords[1] === "shorten") shorten++;
        else console.log("Power up not found");
        money -= 30;
        scoreEl.classList.add("shake");
        resetInput();
      }
    } else if (outputWords.length === 1 && outputWords[0] === "continue")
      roundOver(2);
  }
});

//event listener for shaking
scoreEl.addEventListener("animationend", () => {
  scoreEl.classList.remove("shake");
});

images.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    descBoxEl.textContent = img.dataset.description;
    descBoxEl.style.visibility = "visible";
  });

  img.addEventListener("mouseleave", () => {
    descBoxEl.style.visibility = "hidden";
  });
});
