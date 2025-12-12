// 遊戲主變數
let board = Array(9).fill(null); // 棋盤狀態
let current = 'X'; // 當前玩家（玩家為X）
let active = true; // 控制遊戲是否進行中 (同時控制玩家是否可以點擊)

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
    // 檢查: 如果遊戲未開始(active=false)或格子已被佔據，則退出
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
    
    // *** 修正連點漏洞的核心 ***
    // 鎖定棋盤：防止玩家在電腦思考時連點
    active = false; 
    
    current = 'O';
    document.getElementById('status').innerText = '電腦思考中...';
    
    // 延遲呼叫電腦AI
    setTimeout(computerMove, 700); 
}

// --- 電腦AI下棋邏輯 (Minimax 演算法) ---
function computerMove() {
    let bestMove = findBestMove(board, 'O');
    
    board[bestMove.index] = 'O';
    updateBoard();

    if (checkWin('O')) {
        endGame('電腦 (O) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }
    
    // *** 修正連點漏洞的核心 ***
    // 解除鎖定：交回控制權給玩家
    active = true;
    
    current = 'X';
    document.getElementById('status').innerText = '輪到玩家 (X)';
}

// 找到最佳移動位置 (Minimax 的起點)
function findBestMove(currentBoard, player) {
    let emptySpots = currentBoard.map((v, i) => v ? null : i).filter(v => v !== null);
    let bestScore = (player === 'O') ? -Infinity : Infinity;
    let bestMove = {};

    for (let i of emptySpots) {
        currentBoard[i] = player; 
        
        let score = minimax(currentBoard, player === 'O' ? 'X' : 'O').score;
        
        currentBoard[i] = null; 

        if (player === 'O') {
            if (score > bestScore) {
                bestScore = score;
                bestMove.index = i;
            }
        } else {
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
            newBoard[i] = player; 
            let score = minimax(newBoard, 'X').score; 
            newBoard[i] = null; 
            
            bestScore = Math.max(bestScore, score);
        }
        return { score: bestScore };
    } 
    // 輪到 Minimize Player (X)
    else {
        let bestScore = Infinity;
        for (let i of emptySpots) {
            newBoard[i] = player; 
            let score = minimax(newBoard, 'O').score; 
            newBoard[i] = null; 
            
            bestScore = Math.min(bestScore, score);
        }
        return { score: bestScore };
    }
}

// 檢查遊戲是否結束，並返回分數
function checkGameStatus(currentBoard) {
    if (checkWinForBoard(currentBoard, 'O')) {
        return { score: 10 }; 
    }
    else if (checkWinForBoard(currentBoard, 'X')) {
        return { score: -10 }; 
    }
    else if (currentBoard.every(cell => cell !== null)) {
        return { score: 0 }; 
    }
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
    // 遊戲結束時，active 仍然是 false，確保無法再點擊
    active = false;
    
    // 增加勝利線的視覺效果 (可選，但讓遊戲更完整)
    if (message.includes('勝利')) {
        highlightWinLine(message.includes('(X)') ? 'X' : 'O');
    }
}

// 突顯勝利線 (需搭配新CSS的 .cell.win 樣式)
function highlightWinLine(player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    const cells = document.getElementsByClassName('cell');
    
    for (let [a,b,c] of wins) {
        if (board[a] === player && board[b] === player && board[c] === player) {
            cells[a].classList.add('win');
            cells[b].classList.add('win');
            cells[c].classList.add('win');
            break;
        }
    }
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
        // 確保移除勝利樣式，只保留 X 或 O 類別 (搭配新CSS)
        cells[i].classList.remove('x', 'o', 'win'); 
        if (board[i]) {
            cells[i].classList.add(board[i].toLowerCase());
        }
    }
}

// 初始化
init();
