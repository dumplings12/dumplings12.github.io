const SIZE = 8;
let board = [];
let current = 1; // 1=黑(玩家), 2=白(電腦)
const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');
const difficultyEl = document.getElementById('difficulty');

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

// 進階 AI 的權重表：角落分最高，鄰近角落的分數低
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

function initBoard(){
    board = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
    const m = SIZE/2;
    board[m-1][m-1] = 2; board[m][m] = 2;
    board[m-1][m] = 1; board[m][m-1] = 1;
    current = 1; 
    render();
}

function within(r,c){ return r>=0 && r<SIZE && c>=0 && c<SIZE; }

function flipsForMove(r,c,player){
    if(board[r][c] !== 0) return [];
    const opponent = player===1?2:1;
    let toFlip = [];
    for(const [dr,dc] of DIRS){
        let rr = r+dr, cc = c+dc;
        const line = [];
        while(within(rr,cc) && board[rr][cc] === opponent){
            line.push([rr,cc]);
            rr += dr; cc += dc;
        }
        if(line.length>0 && within(rr,cc) && board[rr][cc] === player) toFlip = toFlip.concat(line);
    }
    return toFlip;
}

function getLegalMoves(player){
    const moves = new Map();
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
        const flips = flipsForMove(r,c,player);
        if(flips.length>0) moves.set(`${r},${c}`, flips);
    }
    return moves;
}

function render(){
    boardEl.innerHTML = '';
    const moves = getLegalMoves(current);
    for(let r=0;r<SIZE;r++){
        for(let c=0;c<SIZE;c++){
            const cell = document.createElement('div');
            cell.className = 'cell';
            if(board[r][c] !== 0){
                const piece = document.createElement('div');
                piece.className = `piece ${board[r][c]===1?'black':'white'}`;
                cell.appendChild(piece);
            }
            if(current === 1 && moves.has(`${r},${c}`)){
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
    if(current === 2) setTimeout(aiMove, 600); // 電腦思考延遲
}

function playerMove(r,c,flips){
    executeMove(r,c,1,flips);
}

function aiMove(){
    const moves = getLegalMoves(2);
    if(moves.size === 0) { checkPassOrEnd(); return; }

    let bestMove = null;
    const moveList = Array.from(moves.entries());

    if(difficultyEl.value === 'basic'){
        // 隨機選擇
        const [key, flips] = moveList[Math.floor(Math.random() * moveList.length)];
        bestMove = { key, flips };
    } else {
        // 進階：選擇權重最高的位置
        let maxScore = -Infinity;
        for(const [key, flips] of moveList){
            const [r, c] = key.split(',').map(Number);
            const score = WEIGHTS[r][c];
            if(score > maxScore){ maxScore = score; bestMove = { key, flips }; }
        }
    }

    const [r, c] = bestMove.key.split(',').map(Number);
    executeMove(r, c, 2, bestMove.flips);
}

function executeMove(r,c,player,flips){
    board[r][c] = player;
    flips.forEach(([rr,cc]) => board[rr][cc] = player);
    current = player === 1 ? 2 : 1;
    render();
}

function checkPassOrEnd(){
    if(getLegalMoves(current).size > 0) return;
    const other = current===1?2:1;
    if(getLegalMoves(other).size > 0){
        alert(`${current===1?'黑':'白'}方無子可下，換邊。`);
        current = other;
        render();
    } else {
        const s = computeScore();
        alert(`遊戲結束！黑 ${s.b} : 白 ${s.w}\n${s.b > s.w ? '黑方獲勝！' : '白方獲勝！'}`);
    }
}

function updateUI(){
    const s = computeScore();
    blackScoreEl.textContent = s.b;
    whiteScoreEl.textContent = s.w;
    currentPlayerEl.textContent = current===1?'黑':'白';
}

function computeScore(){
    let b=0, w=0;
    board.flat().forEach(v => { if(v===1)b++; if(v===2)w++; });
    return {b, w};
}

restartBtn.onclick = initBoard;
initBoard();
