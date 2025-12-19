const SIZE = 8;
let board = [];
let current = 1; 
let isAnimating = false;

const boardEl = document.getElementById('board');
const difficultyEl = document.getElementById('difficulty');

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

function render() {
    boardEl.innerHTML = '';
    const moves = getLegalMoves(current);
    for(let r=0; r<SIZE; r++) {
        for(let c=0; c<SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if(board[r][c] !== 0) {
                const piece = createPiece(board[r][c]);
                cell.appendChild(piece);
            } else if(!isAnimating && current === 1 && moves.has(`${r},${c}`)) {
                cell.classList.add('possible');
                const hint = document.createElement('div');
                hint.className = 'hint';
                hint.textContent = moves.get(`${r},${c}`).length;
                cell.appendChild(hint);
                cell.onclick = () => handleMove(r, c, moves.get(`${r},${c}`));
            }
            boardEl.appendChild(cell);
        }
    }
    updateUI();
}

function createPiece(color) {
    const p = document.createElement('div');
    p.className = `piece ${color === 1 ? 'is-black' : 'is-white'}`;
    p.innerHTML = `<div class="black-side"></div><div class="white-side"></div>`;
    return p;
}

// 核心功能：依序翻轉
async function handleMove(r, c, flips) {
    if(isAnimating) return;
    isAnimating = true;
    
    // 1. 放置新下的棋子
    board[r][c] = current;
    render(); 

    // 2. 依序翻轉其餘棋子
    for (const [fr, fc] of flips) {
        await new Promise(res => setTimeout(res, 100)); // 間隔 100ms
        board[fr][fc] = current;
        const index = fr * SIZE + fc;
        const piece = boardEl.children[index].querySelector('.piece');
        if(piece) {
            piece.className = `piece ${current === 1 ? 'is-black' : 'is-white'}`;
        }
    }

    // 等待最後一顆動畫完成
    await new Promise(res => setTimeout(res, 500));
    
    current = current === 1 ? 2 : 1;
    isAnimating = false;
    render();

    if(current === 2) setTimeout(aiPlay, 500);
    else checkGameState();
}

function aiPlay() {
    const moves = getLegalMoves(2);
    if(moves.size === 0) { checkGameState(); return; }
    
    let best = null;
    const moveList = Array.from(moves.entries());
    
    if(difficultyEl.value === 'basic') {
        best = moveList[Math.floor(Math.random() * moveList.length)];
    } else {
        let max = -Infinity;
        for(const [k, f] of moveList) {
            const [r,c] = k.split(',').map(Number);
            if(WEIGHTS[r][c] > max) { max = WEIGHTS[r][c]; best = [k, f]; }
        }
    }
    const [r, c] = best[0].split(',').map(Number);
    handleMove(r, c, best[1]);
}

// 基礎邏輯與計算 (保持不變但確保正確性)
function flipsForMove(r,c,player) {
    if(board[r][c] !== 0) return [];
    const opp = player === 1 ? 2 : 1;
    let res = [];
    const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(const [dr,dc] of DIRS) {
        let rr = r+dr, cc = c+dc, tmp = [];
        while(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE && board[rr][cc] === opp) {
            tmp.push([rr,cc]); rr+=dr; cc+=dc;
        }
        if(tmp.length>0 && rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE && board[rr][cc] === player) res = res.concat(tmp);
    }
    return res;
}
function getLegalMoves(p) {
    const m = new Map();
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++) {
        const f = flipsForMove(r,c,p);
        if(f.length>0) m.set(`${r},${c}`, f);
    }
    return m;
}
function updateUI() {
    let b=0, w=0; board.flat().forEach(v=>{if(v===1)b++;if(v===2)w++;});
    document.getElementById('blackScore').textContent = b;
    document.getElementById('whiteScore').textContent = w;
    document.getElementById('currentPlayer').textContent = current===1?'黑':'白';
}
function checkGameState() {
    if(getLegalMoves(current).size === 0) {
        const other = current === 1 ? 2 : 1;
        if(getLegalMoves(other).size === 0) {
            alert("遊戲結束！");
            initBoard();
        } else {
            alert(`${current===1?'黑':'白'}無子可下，換邊`);
            current = other; render();
            if(current === 2) aiPlay();
        }
    }
}

document.getElementById('restartBtn').onclick = initBoard;
initBoard();
