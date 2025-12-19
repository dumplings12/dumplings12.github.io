const SIZE = 8;
let board = [];
let current = 1; // 1=黑, 2=白
const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');

const DIRS = [
    [-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]
];

function initBoard(){
    board = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
    const m = SIZE/2;
    board[m-1][m-1] = 2; 
    board[m][m] = 2;
    board[m-1][m] = 1; 
    board[m][m-1] = 1;
    current = 1; 
    render();
}

function within(r,c){
    return r>=0 && r<SIZE && c>=0 && c<SIZE;
}

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
        if(line.length>0 && within(rr,cc) && board[rr][cc] === player){
            toFlip = toFlip.concat(line);
        }
    }
    return toFlip;
}

function getLegalMoves(player){
    const moves = new Map();
    for(let r=0;r<SIZE;r++){
        for(let c=0;c<SIZE;c++){
            const flips = flipsForMove(r,c,player);
            if(flips.length>0) moves.set(`${r},${c}`, flips);
        }
    }
    return moves;
}

function placeMove(r,c,player,flips){
    board[r][c] = player;
    for(const [rr,cc] of flips){ board[rr][cc]=player; }
}

function computeScore(){
    let b=0,w=0;
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
        if(board[r][c]===1) b++;
        if(board[r][c]===2) w++;
    }
    return {b,w};
}

function render(){
    boardEl.innerHTML = '';
    const moves = getLegalMoves(current);
    for(let r=0;r<SIZE;r++){
        for(let c=0;c<SIZE;c++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const val = board[r][c];
            if(val !== 0){
                const piece = document.createElement('div');
                piece.classList.add('piece', val===1?'black':'white');
                cell.appendChild(piece);
            }
            const key = `${r},${c}`;
            if(moves.has(key)){
                cell.classList.add('possible', 'available');
                const hint = document.createElement('div');
                hint.className = 'hint';
                hint.textContent = moves.get(key).length;
                cell.appendChild(hint);
                cell.onclick = () => onCellClick(r, c, moves.get(key));
            }
            boardEl.appendChild(cell);
        }
    }
    const scores = computeScore();
    blackScoreEl.textContent = scores.b;
    whiteScoreEl.textContent = scores.w;
    currentPlayerEl.textContent = current===1? '黑':'白';
    checkForEndOrPass();
}

function onCellClick(r,c,flips){
    placeMove(r,c,current,flips);
    current = current===1?2:1;
    render();
}

function checkForEndOrPass(){
    const currMoves = getLegalMoves(current);
    if(currMoves.size>0) return; 
    const other = current===1?2:1;
    if(getLegalMoves(other).size>0){
        setTimeout(()=>{
            alert(`${current===1?'黑':'白'}方無子可下，換對手下子。`);
            current = other;
            render();
        }, 100);
    } else {
        const scores = computeScore();
        let msg = `遊戲結束。黑 ${scores.b} : 白 ${scores.w}。`;
        msg += scores.b > scores.w ? "黑方獲勝！" : (scores.w > scores.b ? "白方獲勝！" : "平手！");
        setTimeout(() => alert(msg), 100);
    }
}

restartBtn.addEventListener('click', initBoard);
initBoard();
