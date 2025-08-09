const boardElement = document.getElementById('board');
const mineCounter = document.getElementById('mineCounter'); // ← er に統一
const timerElement = document.getElementById('timer');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const hud = document.getElementById('hud');

let rows, cols, mines, board, revealedCount, flags, timeElapsed, timerInterval, gameOver;

const difficulties = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

function initGame() {
  const diff = difficulties[difficultySelect.value];
  rows = diff.rows; cols = diff.cols; mines = diff.mines;
  board = []; revealedCount = 0; flags = 0; timeElapsed = 0; gameOver = false;
  clearInterval(timerInterval); timerInterval = null; timerElement.textContent = '000';
  mineCounter.textContent = String(mines).padStart(3, '0');
  boardElement.classList.remove('boom','over');
  boardElement.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
  hud.style.width = `${boardElement.offsetWidth}px`;
  boardElement.innerHTML = '';
  resetBtn.textContent = '🙂';
  generateBoard();
}

function generateBoard() {
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r; cell.dataset.col = c;
      cell.addEventListener('click', onCellClick);
      cell.addEventListener('contextmenu', e => { e.preventDefault(); toggleFlag(cell); });
      let t; const LONG=500;
      cell.addEventListener('touchstart', ()=>{ t=setTimeout(()=>toggleFlag(cell), LONG); }, { passive: true });
      cell.addEventListener('touchend', ()=>{ if(t){ clearTimeout(t); cell.click(); } });
      boardElement.appendChild(cell);
      board[r][c] = { mine: false, revealed: false, flagged: false, element: cell, count: 0 };
    }
  }
  placeMines(); calculateNumbers();
}

function placeMines() {
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
}
function calculateNumbers() {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (board[r][c].mine) continue;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc].mine) count++;
    }
    board[r][c].count = count;
  }
}
function onCellClick(e){ if(gameOver) return; const cell=e.currentTarget; const r=+cell.dataset.row,c=+cell.dataset.col; if(!timerInterval) startTimer(); revealCell(r,c); }
function revealCell(r,c){
  const cellObj=board[r][c]; if(cellObj.revealed||cellObj.flagged) return;
  cellObj.revealed=true; cellObj.element.classList.add('revealed');
  if(cellObj.mine){ cellObj.element.textContent='💣'; cellObj.element.classList.add('hit'); endGame(false); return; }
  revealedCount++;
  if(cellObj.count>0){ cellObj.element.textContent=cellObj.count; cellObj.element.classList.add(`n${cellObj.count}`);}
  else{ for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<rows&&nc>=0&&nc<cols) revealCell(nr,nc);} }
  if(revealedCount===rows*cols-mines) endGame(true);
}
function toggleFlag(cell){
  if(gameOver) return;
  const r=+cell.dataset.row,c=+cell.dataset.col; const obj=board[r][c]; if(obj.revealed) return;
  obj.flagged=!obj.flagged; cell.textContent=obj.flagged?'🚩':''; flags+=obj.flagged?1:-1;
  mineCounter.textContent=String(mines-flags).padStart(3,'0');
}
function startTimer(){ timerInterval=setInterval(()=>{ timeElapsed=(timeElapsed||0)+1; timerElement.textContent=String(timeElapsed).padStart(3,'0'); },1000); }
function endGame(win){
  gameOver=true; clearInterval(timerInterval); timerInterval=null;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const o=board[r][c]; if(o.mine&&!o.flagged){ o.element.textContent='💣'; if(!o.revealed) o.element.classList.add('revealed'); } }
  boardElement.classList.add('boom','over'); resetBtn.textContent=win?'😎':'😵';
}
resetBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
initGame();
