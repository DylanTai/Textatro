/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let score = 0;
let money = 0;
let round = 0;
let metQuota = 0;
let quota = 100;
let testWord;
let outputWords;
let textInput = "";
let dict = [];
let baseTime = 60;
let time = baseTime;
let timerInterval;
let inShop = false;

/*------------------------ Cached Element References ------------------------*/
const timerEl = document.getElementById("timer");
const inputEl = document.getElementById("myInput");
const outputEl = document.getElementById("myOutput");
const browseButtonEl = document.getElementById("browseButton");
const startButtonEl = document.getElementById("startButton");
const scoreEl = document.getElementById("score");

/*-------------------------------- Functions --------------------------------*/

//initialization and reset functionality function
const init = () => {
  outputEl.textContent =
    "Please input the text file with which words you want!";
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
};

const roundStart = () => {
  time = baseTime;
  timerEl.textContent = `Time remaining: ${baseTime}`;
  timerInterval = setInterval(updateCountdown, 1000);
  timerEl.style.visibility = "visible";
  inputEl.style.visibility = "visible";
  scoreEl.style.visibility = "visible";
  browseButtonEl.style.visibility = "hidden";
  startButtonEl.style.visibility = "hidden";
};

const roundOver = (win, shop) => {
  timerEl.style.visibility = "hidden";
  inputEl.style.visibility = "hidden";
  scoreEl.style.visibility = "hidden";
  metQuota = 0;
  clearInterval(timerInterval);
  if (win) {
    if (round != 9 && !shop) {
      quota += 10;
      baseTime -= 10;
    } else if (round === 9 && shop) {
      outputEl.textContent = "You win!";
      setTimeout(() => {
        location.reload();
      }, 5000);
    } else shopStart();
    round++;
  } else {
    outputEl.textContent = "You lost!";
    setTimeout(() => {
      location.reload();
    }, 5000);
  }
};

const shopStart = () => {
  inShop = true;
  inputEl.style.visibility = "visible";
  outputEl.textContent =
    'Welcome to the shop!\nHover over each power up to see what it does!\nType "buy name-of-item" when you want to buy something';
};

const randomWord = () => {
  return dict[Math.floor(Math.random() * dict.length)];
};

const render = (wordReset) => {
  if (wordReset) {
    testWord = randomWord();
    inputEl.value = "";
    outputEl.classList.remove("shake-infinite");
  }
  //console.log("Score: " + score); //debug
  scoreEl.textContent = `Score: ${score}\nMoney: $${money}`;
  outputEl.textContent = testWord;
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
  if (time <= 0) roundOver(false, false);
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
      roundStart();
      render(true);
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
      render(true);
      if (metQuota >= quota) roundOver(true, true);
    }
    //console.log("Current typed text:", textInput); //debug
  } else {
  }
});

//event listener for shaking
scoreEl.addEventListener("animationend", () => {
  scoreEl.classList.remove("shake");
});
