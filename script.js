const SIZE = 8;
let board = [];
let current = 1; // 1=黑(玩家), 2=白(電腦)
let isAnimating = false;

const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');
const difficultyEl = document.getElementById('difficulty');

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

// 進階權重表
const WEIGHTS = [
    [100, -20, 10,  5,  5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [ 10,  -2,  5,  1,  1,  5,  -2,  10],
    [  5,  -2,  1,  0,  0,  1,  -2,   5],
    [  5,  -2,  1,  0,  0,  1,  -2,   5],
    [ 10,  -2,  5,  1,  1,  5,  -2,  10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10,  5,  5, 10, -20, 100]
];

function initBoard() {
    board = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
    const m = SIZE/2;
    board[m-1][m-1] = 2; board[m][m] = 2;
    board[m-1][m] = 1; board[m][m-1] = 1;
    current = 1; 
    isAnimating = false;
    render();
}

function within(r,c) { return r>=0 && r<SIZE && c>=0 && c<SIZE; }

function flipsForMove(r,c,player) {
    if(board[r][c] !== 0) return [];
    const opponent = player===1?2:1;
    let toFlip = [];
    for(const [dr,dc] of DIRS) {
        let rr = r+dr, cc = c+dc;
        const line = [];
        while(within(rr,cc) && board[rr][cc] === opponent) {
            line.push([rr,cc]);
            rr += dr; cc += dc;
        }
        if(line.length>0 && within(rr,cc) && board[rr][cc] === player) toFlip = toFlip.concat(line);
    }
    return toFlip;
}

function getLegalMoves(player) {
    const moves = new Map();
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
        const flips = flipsForMove(r,c,player);
        if(flips.length>0) moves.set(`${r},${c}`, flips);
    }
    return moves;
}

function render() {
    boardEl.innerHTML = '';
    const moves = getLegalMoves(current);
    for(let r=0;r<SIZE;r++) {
        for(let c=0;c<SIZE;c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if(board[r][c] !== 0) {
                const piece = document.createElement('div');
                piece.className = `piece ${board[r][c]===1?'black':'white'}`;
                cell.appendChild(piece);
            }
            if(!isAnimating && current === 1 && moves.has(`${r},${c}`)) {
                cell.classList.add('possible', 'available');
                const hint = document.createElement('div');
                hint.className = 'hint';
                hint.textContent = moves.get(`${r},${c}`).length;
                cell.appendChild(hint);
                cell.onclick = () => playerMove(r, c, moves.get(`${r},${c}`));
            }
            boardEl.appendChild(cell);
        }
    }
    updateUI();
}

function playerMove(r, c, flips) {
    if(isAnimating) return;
    executeMove(r, c, 1, flips);
}

function aiMove() {
    const moves = getLegalMoves(2);
    if(moves.size === 0) { checkPassOrEnd(); return; }

    let bestMove = null;
    const moveList = Array.from(moves.entries());

    if(difficultyEl.value === 'basic') {
        const [key, flips] = moveList[Math.floor(Math.random() * moveList.length)];
        bestMove = { key, flips };
    } else {
        let maxScore = -Infinity;
        for(const [key, flips] of moveList) {
            const [r, c] = key.split(',').map(Number);
            const score = WEIGHTS[r][c];
            if(score > maxScore) { maxScore = score; bestMove = { key, flips }; }
        }
    }
    const [r, c] = bestMove.key.split(',').map(Number);
    executeMove(r, c, 2, bestMove.flips);
}

function executeMove(r, c, player, flips) {
    isAnimating = true;
    board[r][c] = player;
    render(); // 先顯示落子

    // 翻轉動畫
    setTimeout(() => {
        flips.forEach(([rr, cc]) => {
            const index = rr * SIZE + cc;
            const piece = boardEl.children[index].querySelector('.piece');
            if(piece) {
                piece.classList.add('flipping');
                setTimeout(() => {
                    board[rr][cc] = player;
                    piece.className = `piece ${player===1?'black':'white'} flipping`;
                }, 300);
                setTimeout(() => piece.classList.remove('flipping'), 600);
            }
        });
    }, 100);

    current = (player === 1) ? 2 : 1;
    
    setTimeout(() => {
        isAnimating = false;
        render();
        if(current === 2) setTimeout(aiMove, 600);
        else checkPassOrEnd();
    }, 800);
}

function checkPassOrEnd() {
    if(getLegalMoves(current).size > 0) return;
    const other = current===1?2:1;
    if(getLegalMoves(other).size > 0) {
        alert(`${current===1?'黑':'白'}方無處落子，自動換邊。`);
        current = other;
        render();
        if(current === 2) setTimeout(aiMove, 600);
    } else {
        const s = computeScore();
        let msg = `遊戲結束！黑 ${s.b} : 白 ${s.w}\n`;
        msg += s.b > s.w ? '恭喜獲勝！' : (s.b < s.w ? '電腦獲勝，再接再厲！' : '平手！');
        setTimeout(() => alert(msg), 300);
    }
}

function updateUI() {
    const s = computeScore();
    blackScoreEl.textContent = s.b;
    whiteScoreEl.textContent = s.w;
    currentPlayerEl.textContent = current===1?'黑':'白';
}

function computeScore() {
    let b=0, w=0;
    board.flat().forEach(v => { if(v===1)b++; if(v===2)w++; });
    return {b, w};
}

restartBtn.onclick = initBoard;
initBoard();
