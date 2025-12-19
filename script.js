const SIZE = 8;
let board = [];
let current = 1; 
let isAnimating = false;

const boardEl = document.getElementById('board');
const difficultyEl = document.getElementById('difficulty');

// 初始化
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
                const piece = document.createElement('div');
                piece.className = `piece ${board[r][c] === 2 ? 'is-white' : 'is-black'}`;
                piece.innerHTML = `<div class="black-side"></div><div class="white-side"></div>`;
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
    updateScoreUI();
}

async function handleMove(r, c, flips) {
    if(isAnimating) return;
    isAnimating = true;
    
    // 1. 下子
    board[r][c] = current;
    render(); 

    // 2. 依序翻轉（每顆間隔 100ms）
    for (const [fr, fc] of flips) {
        await new Promise(res => setTimeout(res, 100)); 
        board[fr][fc] = current;
        const piece = boardEl.children[fr * SIZE + fc].querySelector('.piece');
        if(piece) {
            piece.className = `piece ${current === 1 ? 'is-black' : 'is-white'}`;
        }
    }

    await new Promise(res => setTimeout(res, 600)); // 等待最後一顆翻完
    
    current = current === 1 ? 2 : 1;
    isAnimating = false;
    render();

    if(current === 2) setTimeout(aiPlay, 500);
    else checkPass();
}

function aiPlay() {
    const moves = getLegalMoves(2);
    if(moves.size === 0) { checkPass(); return; }
    
    const moveList = Array.from(moves.entries());
    let best = moveList[0];
    
    if(difficultyEl.value === 'advanced') {
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
        let max = -Infinity;
        for(const [k, f] of moveList) {
            const [r,c] = k.split(',').map(Number);
            if(WEIGHTS[r][c] > max) { max = WEIGHTS[r][c]; best = [k, f]; }
        }
    } else {
        best = moveList[Math.floor(Math.random() * moveList.length)];
    }
    const [r, c] = best[0].split(',').map(Number);
    handleMove(r, c, best[1]);
}

function getLegalMoves(player) {
    const moves = new Map();
    const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(let r=0; r<SIZE; r++) {
        for(let c=0; c<SIZE; c++) {
            if(board[r][c] !== 0) continue;
            let totalFlips = [];
            for(const [dr, dc] of DIRS) {
                let rr = r+dr, cc = c+dc, temp = [];
                while(rr>=0 && rr<SIZE && cc>=0 && cc<SIZE && board[rr][cc] === (player===1?2:1)) {
                    temp.push([rr,cc]); rr+=dr; cc+=dc;
                }
                if(temp.length > 0 && rr>=0 && rr<SIZE && cc>=0 && cc<SIZE && board[rr][cc] === player) {
                    totalFlips = totalFlips.concat(temp);
                }
            }
            if(totalFlips.length > 0) moves.set(`${r},${c}`, totalFlips);
        }
    }
    return moves;
}

function updateScoreUI() {
    let b=0, w=0; board.flat().forEach(v=>{if(v===1)b++;if(v===2)w++;});
    document.getElementById('blackScore').textContent = b;
    document.getElementById('whiteScore').textContent = w;
    document.getElementById('currentPlayer').textContent = current===1?'黑':'白';
}

function checkPass() {
    if(getLegalMoves(current).size === 0) {
        const other = current===1?2:1;
        if(getLegalMoves(other).size === 0) {
            alert("遊戲結束！");
        } else {
            alert("無子可下，跳過回合");
            current = other; render();
            if(current === 2) aiPlay();
        }
    }
}

document.getElementById('restartBtn').onclick = initBoard;
initBoard();
