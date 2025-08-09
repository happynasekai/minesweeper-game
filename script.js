// script.js - マインスイーパーの動作を制御

let rows = 9;
let cols = 9;
let mineCount = 10;
let board = [];
let minePositions = [];
let revealedCount = 0;
let flags = 0;
let timer = 0;
let timerInterval = null;
let gameOver = false;

const boardElement = document.getElementById('board');
const mineCounter = document.getElementById('mineCount');
const timerElement = document.getElementById('timer');
const resetBtn = document.getElementById('resetBtn');

function initGame() {
  board = [];
  minePositions = [];
  revealedCount = 0;
  flags = 0;
  timer = 0;
  gameOver = false;
  clearInterval(timerInterval);
  timerElement.textContent = '000';
  mineCounter.textContent = String(mineCount).padStart(3, '0');
  resetBtn.textContent = '🙂';

  boardElement.style.setProperty('--rows', rows);
  boardElement.style.setProperty('--cols', cols);
  boardElement.innerHTML = '';

  // マスを生成
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', onCellClick);
      cell.addEventListener('contextmenu', onCellRightClick);
      boardElement.appendChild(cell);
      row.push({ revealed: false, mine: false, flag: false, element: cell });
    }
    board.push(row);
  }

  // 地雷を配置
  while (minePositions.length < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minePositions.push([r, c]);
    }
  }
}

function onCellClick(e) {
  if (gameOver) return;
  const r = parseInt(this.dataset.row);
  const c = parseInt(this.dataset.col);
  if (!timerInterval) startTimer();
  revealCell(r, c);
}

function onCellRightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  const r = parseInt(this.dataset.row);
  const c = parseInt(this.dataset.col);
  toggleFlag(r, c);
}

function revealCell(r, c) {
  const cell = board[r][c];
  if (cell.revealed || cell.flag) return;
  cell.revealed = true;
  cell.element.classList.add('revealed');

  if (cell.mine) {
    cell.element.classList.add('mine');
    gameOver = true;
    resetBtn.textContent = '😵';
    revealAllMines();
    clearInterval(timerInterval);
    return;
  }

  const minesAround = countMinesAround(r, c);
  if (minesAround > 0) {
    cell.element.textContent = minesAround;
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          revealCell(nr, nc);
        }
      }
    }
  }

  revealedCount++;
  if (revealedCount === rows * cols - mineCount) {
    gameOver = true;
    resetBtn.textContent = '😎';
    clearInterval(timerInterval);
  }
}

function toggleFlag(r, c) {
  const cell = board[r][c];
  if (cell.revealed) return;
  if (cell.flag) {
    cell.flag = false;
    cell.element.textContent = '';
    flags--;
  } else {
    cell.flag = true;
    cell.element.textContent = '🚩';
    flags++;
  }
  mineCounter.textContent = String(mineCount - flags).padStart(3, '0');
}

function countMinesAround(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (board[nr][nc].mine) count++;
      }
    }
  }
  return count;
}

function revealAllMines() {
  for (const [r, c] of minePositions) {
    board[r][c].element.classList.add('mine');
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    timerElement.textContent = String(timer).padStart(3, '0');
  }, 1000);
}

resetBtn.addEventListener('click', initGame);

initGame();
