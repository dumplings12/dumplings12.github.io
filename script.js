// 初始變數 (包含計分板相關元素)
const boardE1 = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell')); // 修正：加上了右括號
const btnReset = document.getElementById('reset');
const btnResetAll = document.getElementById('reset-all'); // 新增：重置計分按鈕
const turnEl = document.getElementById('turn');
const stateEl = document.getElementById('state');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

// 三格成直線狀態/勝利條件
const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6] // diags
];

// 遊戲狀態變數
let board;
let current;
let active;

// 計分用變數
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// 起始函式
function init() {
    board = Array(9).fill('');
    current = 'X';
    active = true;
    cells.forEach(c => {
        c.textContent = '';
        c.className = 'cell';
        c.disabled = false;
    });
    turnEl.textContent = current;
    stateEl.textContent = '';
}

// 更新計分板數字
function updateScoreboard() {
    scoreXEl.textContent = scoreX;
    scoreOEl.textContent = scoreO;
    scoreDrawEl.textContent = scoreDraw;
}

// 下手
function place(idx) {
    if (!active || board[idx]) return;
    board[idx] = current;
    const cell = cells[idx];
    cell.textContent = current;
    cell.classList.add(current.toLowerCase());
    const result = evaluate();
    if (result.finished) {
        endGame(result);
    } else {
        switchTurn();
    }
}

// 換手函式
function switchTurn() {
    current = current === 'X' ? 'O' : 'X';
    turnEl.textContent = current;
}

// 下手後計算是否成一線結束遊戲的函式
function evaluate() {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { finished: true, winner: board[a], line };
        }
    }
    if (board.every(v => v)) return { finished: true, winner: null };
    return { finished: false };
}

// 確認是否結束遊戲 (已整合計分邏輯)
function endGame({ winner, line }) {
    active = false;
    if (winner) {
        stateEl.textContent = `${winner} 勝利！`; // 修正：使用倒引號
        line.forEach(i => cells[i].classList.add('win'));
        if (winner === 'X') scoreX++; else scoreO++;
    } else {
        stateEl.textContent = '平手';
        scoreDraw++;
    }
    updateScoreboard(); // 更新計分板
    cells.forEach(c => c.disabled = true);
}

// 綁定事件：棋盤格點擊
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = +cell.getAttribute('data-idx');
        place(idx);
    });
});

// 綁定事件：重開遊戲（保留分數）
btnReset.addEventListener('click', init);

// 綁定事件：重置計分（連同遊戲）
btnResetAll.addEventListener('click', () => {
    scoreX = scoreO = scoreDraw = 0;
    updateScoreboard();
    init();
});

// 初始化遊戲
init();