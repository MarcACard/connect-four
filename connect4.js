/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

/* === Global Variables === */
// HTML DOM
const gameHTML = document.querySelector('#game');
const menuHTML = document.querySelector('#menu');
const htmlBoard = document.querySelector('#board');
const playerLabelHTML = document.querySelector('#player-label');
const endGameHTML = document.querySelector('#end-game');

// Background Variables
let board = []; // array of rows, each row is array of cells  (board[y][x])
let WIDTH = 8;
let HEIGHT = 6;
let currPlayer = 1; // active player: 1 or 2

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */
const makeBoard = () => {
  for (let y = 0; y < HEIGHT; y += 1) {
    const tempRow = [];
    for (let x = 0; x < WIDTH; x += 1) {
      tempRow.push(null);
    }
    board.push(tempRow);
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */
const makeHtmlBoard = () => {
  // Create topRow of player board
  const topRow = document.createElement("tr");
  topRow.setAttribute("id", "column-top");
  topRow.addEventListener("click", gameClickHandler);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    topRow.append(headCell);
  }
  htmlBoard.append(topRow);

  // Create additional rows for game board
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
const findSpotForCol = x => {
  for (let y = HEIGHT - 1; y >= 0; y -= 1) {
    const cell = board[y][x];
    if (!cell) {
      return y;
    }
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */
const placeInTable = (y, x) => {
  // Create piece
  const pieceDiv = document.createElement('div')
  pieceDiv.classList.add(`piece`)
  pieceDiv.classList.add(`p${currPlayer}-piece`)

  // Insert into DOM @ specific table coordinates
  const cellToFill = document.getElementById(`${y}-${x}`)
  cellToFill.append(pieceDiv);
}

/** endGame: announce game end */
const endGame = msg => {
  // Add Msg to Modal
  const p = document.querySelector('#end-game-message');
  p.innerText = msg;
  p.classList.add('semi-bold');

  // Toggle End Game Modal
  endGameHTML.style.display = 'flex';
}

/** startGame: trigger all functions to start the game. */
const startGame = () => {
  makeBoard();
  makeHtmlBoard();
  updateBorder();
  updatePlayerLabel();
}

/** resetGame: revert all HTML elements and JS variables to defaults */
const resetGame = () => {
  board = [];
  htmlBoard.innerHTML = '';
  currPlayer = 1;
  removePlayerLabel();
  gameHTML.className = '';
}

/** areAllCellsFull: returns true if all board[x][y] cells returns truthy (not empty)  */
const areAllCellsFull = row => {
  return row.every(cell => cell)
}

/** updateBorder: switch border class based on currPlayer */
const updateBorder = () => {
  if (currPlayer == 1) {
    gameHTML.classList.add('p1-turn');
    gameHTML.classList.remove('p2-turn');
  } else if (currPlayer = 2) {
    gameHTML.classList.add('p2-turn');
    gameHTML.classList.remove('p1-turn');
  }
}

/** removePlayerLabel: remove all content within playerLabelHTML  */
const removePlayerLabel = () => {
  playerLabelHTML.innerHTML = "";
}

/** updatePlayLabel: Create & Insert a player label into the #game board. */
const updatePlayerLabel = () => {
  if (playerLabelHTML.childElementCount > 0) removePlayerLabel();

  // Create player label
  const pLabel = document.createElement('p');
  pLabel.classList.add('semi-bold');
  pLabel.innerText = `Player ${currPlayer}'s Turn`;

  // Set Text Color Based on currPlayer
  pLabel.style.color = currPlayer == 1 ? 'var(--p1-color)' : 'var(--p2-color)'

  // Add to DOM 
  playerLabelHTML.appendChild(pLabel);
}

/** switchPlayer: switch player  */
const switchPlayer = () => {
  currPlayer = currPlayer == 1 ? 2 : 1;
}

/* === Click Handlers === */
/* --- Welcome Menu ---*/
menuHTML.addEventListener('click', (event) => {
  const id = event.target.id;

  // Start Button
  if (id === 'start') {
    // Start the Game
    menuHTML.style.display = "none";
    startGame()
    return
  }

  // Board Size Radio Buttons
  if (id === 'small') {
    HEIGHT = 4;
    WIDTH = 5;
  } else if (id === 'medium') {
    HEIGHT = 6;
    WIDTH = 8;
  } else if (id === 'large') {
    HEIGHT = 8;
    WIDTH = 11;
  }
})

/* --- End Game Modal --- */
endGameHTML.addEventListener('click', (event) => {
  const { id, tagName } = event.target;

  if (tagName !== 'BUTTON') return

  if (id === 'rematch') {
    resetGame();
    startGame();
  } else if (id === 'main-menu') {
    resetGame();
    menuHTML.style.display = 'flex';
  }
  endGameHTML.style.display = 'none';
})

/** gameClickHandler: handle click of column top to play piece */
function gameClickHandler(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;

  // Disable clicks on board if End Game Modal is Visible
  if (endGameHTML.style.display !== 'none') return;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) return;

  // place piece in board and add to HTML table & JS Representation of table
  placeInTable(y, x);
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    return endGame(`🙌 Player ${currPlayer} won! 🙌`);
  }

  // check for tie
  if (board.every(areAllCellsFull)) {
    return endGame(`Tied Game 😕`)
  }

  // switch players
  switchPlayer();
  updateBorder();
  updatePlayerLabel();
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  /* ??? QUESTION: I've never seen this before, a function nested in a function
  what is the value behind doing this? Compared to having it outside of this function? */
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // Extract all potental 4 in a row coordinates (Vertical, Diagonal left, Diagonal right, and horizontal)
  // First FOR-Loop will iterate through each row, Second For-Loop will iterate through each column
  for (var y = 0; y < HEIGHT; y++) { // Height Iterator
    for (var x = 0; x < WIDTH; x++) { // Width Iterator
      var horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]]; 
      var vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]]; 
      var diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]]; 
      var diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}