// 遊戲主變數
let board = Array(9).fill(null); // 棋盤狀態
let current = 'X'; // 當前玩家（玩家為X）
let active = true; // 控制遊戲是否進行中

// 初始化棋盤
function init() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '玩家 (X) 先手';
    
    // 建立9個格子
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => playerMove(i);
        boardEl.appendChild(cell);
    }
}

// 玩家下棋
function playerMove(i) {
    if (!active || board[i]) return;
    board[i] = 'X';
    updateBoard();
    
    if (checkWin('X')) {
        endGame('玩家 (X) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }
    
    current = 'O';
    document.getElementById('status').innerText = '電腦思考中...';
    setTimeout(computerMove, 700); // 模擬電腦思考時間
}

// --- 電腦AI下棋邏輯 (Minimax 演算法) ---
function computerMove() {
    // 使用 Minimax 找到最佳移動
    let bestMove = findBestMove(board, 'O');
    
    // 執行最佳移動
    board[bestMove.index] = 'O';
    updateBoard();

    if (checkWin('O')) {
        endGame('電腦 (O) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }
    
    current = 'X';
    document.getElementById('status').innerText = '輪到玩家 (X)';
}

// 找到最佳移動位置 (Minimax 的起點)
function findBestMove(currentBoard, player) {
    let emptySpots = currentBoard.map((v, i) => v ? null : i).filter(v => v !== null);
    let bestScore = (player === 'O') ? -Infinity : Infinity;
    let bestMove = {};

    for (let i of emptySpots) {
        // 1. 執行移動
        currentBoard[i] = player; 
        
        // 2. 遞迴呼叫 minimax，計算這一移動的得分
        let score = minimax(currentBoard, player === 'O' ? 'X' : 'O').score;
        
        // 3. 撤銷移動 (還原棋盤)
        currentBoard[i] = null; 

        if (player === 'O') {
            // 對於 O (Maximize Player)，我們找最高分
            if (score > bestScore) {
                bestScore = score;
                bestMove.index = i;
            }
        } else {
            // 對於 X (Minimize Player)，我們找最低分
            if (score < bestScore) {
                bestScore = score;
                bestMove.index = i;
            }
        }
    }
    return bestMove;
}

// 遞迴的 Minimax 演算法核心
function minimax(newBoard, player) {
    const gameStatus = checkGameStatus(newBoard);
    
    // 基本情況 (Base Case): 如果遊戲結束，返回分數
    if (gameStatus) {
        return gameStatus;
    }

    const emptySpots = newBoard.map((v, i) => v ? null : i).filter(v => v !== null);
    
    // 輪到 Maximize Player (O)
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i of emptySpots) {
            newBoard[i] = player; // 執行移動
            let score = minimax(newBoard, 'X').score; // 遞迴呼叫 (換手)
            newBoard[i] = null; // 撤銷移動
            
            bestScore = Math.max(bestScore, score);
        }
        return { score: bestScore };
    } 
    // 輪到 Minimize Player (X)
    else {
        let bestScore = Infinity;
        for (let i of emptySpots) {
            newBoard[i] = player; // 執行移動
            let score = minimax(newBoard, 'O').score; // 遞迴呼叫 (換手)
            newBoard[i] = null; // 撤銷移動
            
            bestScore = Math.min(bestScore, score);
        }
        return { score: bestScore };
    }
}

// 檢查遊戲是否結束，並返回分數
function checkGameStatus(currentBoard) {
    // 檢查 'O' 是否獲勝 (O是電腦，Maximizr)
    if (checkWinForBoard(currentBoard, 'O')) {
        return { score: 10 }; // 電腦獲勝給予高分
    }
    // 檢查 'X' 是否獲勝 (X是玩家，Minimizer)
    else if (checkWinForBoard(currentBoard, 'X')) {
        return { score: -10 }; // 玩家獲勝給予低分
    }
    // 檢查平手
    else if (currentBoard.every(cell => cell !== null)) {
        return { score: 0 }; // 平手
    }
    // 遊戲尚未結束
    return null;
}

// 判斷勝利 (檢查特定棋盤狀態，供 Minimax 使用)
function checkWinForBoard(currentBoard, player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(([a,b,c]) => currentBoard[a] === player && currentBoard[b] === player
&& currentBoard[c] === player);
}

// 判斷勝利 (檢查當前全域 board 變數，供玩家移動後使用)
function checkWin(player) {
    return checkWinForBoard(board, player);
}

// 判斷是否平手
function isFull() {
    return board.every(cell => cell !== null);
}

// 結束遊戲
function endGame(message) {
    document.getElementById('status').innerText = message;
    active = false;
}

// 重開一局
function resetGame() {
    init();
}

// 更新畫面
function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        cells[i].innerText = board[i] || '';
    }
}

// 初始化
init();
