My game is a browser-based rogue-like typing challenge, blending fast reflexes with strategic resource management. At its core, the game revolves around mastering words from your own custom word list, turning typing into both weapon and survival tool. This game is heavily inspired by the rogue-like game Balatro.

# How it works

At the start, players upload or paste a text file of words, each separated by a new line. This list becomes the pool of words for the game.

Each round, the game randomly selects words from that pool, and the player must type them correctly before the round timer runs out.

Every round has a quota of words that must be typed. Fail to meet the quota, and the run ends. As the rounds progress, the quotas get tighter, forcing faster and more accurate typing.

Between rounds, players enter a shop phase, where they can spend earned money to buy power-ups and upgrades. Some are short-term boosts (i.e. extra time, shortening of words, removal of certain letters, ways of getting more money), while others are long-term investments (i.e. higher money per word, permanent typing bonuses).

## Special twists I'd like to implement in the future/if I have time

- Every third round is a boss challenge, introducing special rules that make the game significantly harder (like reversed words, doubled quotas, distractions, etc.).

- The ability to save runs so players can continue later, or experiment with different builds over multiple sessions.

## Core loop of the game

- Upload a word list
- Survive typing rounds
- Shop for upgrades
- Face boss rounds (A long term goal that I have, at first I won't have these)
- Push as far as possible until you fail. (A long term goal that I have, at first I will just make it 9 rounds I don't know if I can balance a game that goes infinitely)

## Psuedo code of how the game would work

### 1. Game Setup

- Load a text file that the player uploads.
- Split the text into a list of words (one per line).
- Initialize all game variables: current round, score, money, power-ups, quota of words to type, and timer.
- Start the game loop.

### 2. Game Loop

- If the player fails to meet the round’s quota, end the game immediately.
- If the round is cleared, give rewards (score/money).
- Enter a shop phase (except after round 9).
- Every 3 rounds, insert a boss round with extra difficulty.
- If all 9 rounds are cleared, display a win screen.

### 3. Playing a Regular Round

- Set the round’s difficulty (quota and timer).
- Continuously show the player random words from their list.
- Wait for the player to type the word correctly.

  _If correct:_

- Increase the count of words typed.
- Add money and score based on word length or difficulty.
- Trigger any effects from power-ups.

  _If incorrect:_

- Optionally apply penalties or effects from power-ups.
- Continue until either the timer runs out or the quota is reached.

  _At the end:_

* If quota not met → game over.
* Otherwise → round success.

### 4. Shop Phase

- Come up with a list of power-ups I'd like to implement, I'd like to start with four personally and then build more afterwards
- Display a shop with a list of possible upgrades/power-ups, using the typing bar as also the bar that you can purchase stuff from
- Hide all other elements that don't involve the shop
- Each power-up costs money.
- Player can choose to buy one or more if affordable.
- Add purchased upgrades to the player’s inventory.
- Hide all shop elements when leaving the shop

### 5. End Conditions

- Game Over: Show the round the player failed on, display final score, and give option to restart.

- Victory: Show a win screen if all 9 rounds are cleared, display total score and money, and give option to restart.

## Conclusion

_At this point I've also written the code for how a round would work without a timer, so basically I would just need to code:_

- A timer
- A shop
- A win/loss screen
- Transitions between the round -> shop and the round -> win/loss screen
- The power ups you can buy from the shop and what they do. I'll start with a small amount and continuosly add onto them.
