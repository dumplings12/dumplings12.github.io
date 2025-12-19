// Othello (Reversi) 基本互動邏輯
// 8x8 棋盤，0=空, 1=黑, 2=白
const SIZE = 8;
let board = [];
let current = 1; // 1=黑先
const boardEl = document.getElementById('board’);
const currentPlayerEl = document.getElementById('currentPlayer’);
const blackScoreEl = document.getElementById('blackScore’);
const whiteScoreEl = document.getElementById('whiteScore’);
const restartBtn = document.getElementById('restartBtn');
// 方向向量（8方向）
const DIRS = [
 [-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]
];
function initBoard(){
 board = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
 // 初始四顆棋子
 const m = SIZE/2;
 board[m-1][m-1] = 2; // 白
 board[m][m] = 2;
 board[m-1][m] = 1; // 黑
 board[m][m-1] = 1;
 current = 1; // 黑先
 render();
}
function within(r,c){
 return r>=0 && r<SIZE && c>=0 && c<SIZE;
}
// 檢查某個位置是否為 legal move，回傳要翻轉的格子列表（若無則回空陣列）
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
// 取得所有 legal moves，回傳 map keyed by 'r,c' -> flips array
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
// 下子並翻轉
function placeMove(r,c,player,flips){
 board[r][c] = player;
 for(const [rr,cc] of flips){ board[rr][cc]=player; }
}
// 計算分數
function computeScore(){
 let b=0,w=0;
 for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
 if(board[r][c]===1) b++;
 if(board[r][c]===2) w++;
 }
 return {b,w};
}
function render(){
 boardEl.innerHTML = ‘’;
 const moves = getLegalMoves(current);
 for(let r=0;r<SIZE;r++){
 for(let c=0;c<SIZE;c++){
 const cell = document.createElement('div’);
 cell.classList.add('cell’);
 cell.setAttribute('role','gridcell’);
 cell.dataset.r = r; cell.dataset.c = c;
 const val = board[r][c];
 if(val===0){
 cell.classList.add('empty’);
 } else {
 const piece = document.createElement('div’);
 piece.classList.add('piece’);
 piece.classList.add(val===1? 'black':'white’);
 cell.appendChild(piece);
 }
// 如果為可能下子位置，標示並顯示可以翻轉的數量
 const key = `${r},${c}`;
 if(moves.has(key)){
 cell.classList.add('possible','available’);
 const flips = moves.get(key);
 const hint = document.createElement('div’);
 hint.className='hint’;
 hint.textContent = flips.length;
 cell.appendChild(hint);
 cell.addEventListener('click', ()=> onCellClick(r,c,moves.get(key)));
 } else {
 cell.classList.add('disabled’);
 }
 boardEl.appendChild(cell);
 }
 }
 // 更新 UI
 const scores = computeScore();
 blackScoreEl.textContent = scores.b;
 whiteScoreEl.textContent = scores.w;
 currentPlayerEl.textContent = current===1? '黑':'白’;
 // check game end / pass logic
 checkForEndOrPass();
}
function onCellClick(r,c,flips){
 placeMove(r,c,current,flips);
 // 換手
 current = current===1?2:1;
 render();
}
function checkForEndOrPass(){
 const currMoves = getLegalMoves(current);
 if(currMoves.size>0) return; // 有路可下
 // 當前玩家無路可下，查看對手是否有路
 const other = current===1?2:1;
 const otherMoves = getLegalMoves(other);
 if(otherMoves.size>0){
 // pass 回合
 // 顯示提示後交給對手
 setTimeout(()=>{
 alert((current===1? '黑':'白') + ' 無子可下，回合由對方繼續。’);
 current = other;
 render();
 },10);
 return;
 }
 // 兩邊都沒有路，遊戲結束
 const scores = computeScore();
 let msg = `遊戲結束。 黑 ${scores.b} : 白 ${scores.w}。 `;
 if(scores.b>scores.w) msg += '黑方獲勝！’;
 else if(scores.w>scores.b) msg += '白方獲勝！’;
 else msg += '平手！’;
 setTimeout(()=>alert(msg), 10);
}
restartBtn.addEventListener('click', ()=>initBoard());
 // 初始化
 initBoard();
