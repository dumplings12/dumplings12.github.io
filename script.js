class GoGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0)); // 0:空, 1:黑, 2:白
        this.currentPlayer = 1;
        this.passCount = 0;
        this.gameOver = false;
        this.initBoardGraphics();
        this.initIntersections();
    }

    // 初始化棋盤格線與星位
    initBoardGraphics() {
        const gridBg = document.getElementById('grid-background');
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.className = 'grid-square';
            gridBg.appendChild(square);
        }
        // 加入星位 (2,2), (2,6), (4,4), (6,2), (6,6)
        const starPoints = [[2,2], [2,6], [4,4], [6,2], [6,6]];
        starPoints.forEach(([r, c]) => {
            const hoshi = document.createElement('div');
            hoshi.className = 'hoshi';
            hoshi.style.top = (r * 50 + 25) + 'px';
            hoshi.style.left = (c * 50 + 25) + 'px';
            document.getElementById('go-board').appendChild(hoshi);
        });
    }

    // 初始化點擊交叉點
    initIntersections() {
        const layer = document.getElementById('intersections');
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const pt = document.createElement('div');
                pt.className = 'point';
                pt.dataset.row = r;
                pt.dataset.col = c;
                pt.onclick = () => this.handleMove(r, c);
                layer.appendChild(pt);
            }
        }
    }

    handleMove(r, c) {
        if (this.gameOver || this.currentPlayer !== 1) return;
        if (this.play(r, c, 1)) {
            this.passCount = 0;
            this.updateUI();
            if (!this.gameOver) {
                document.getElementById('status').innerText = "⚪ 電腦思考中...";
                setTimeout(() => this.aiMove(), 600);
            }
        }
    }

    play(r, c, player) {
        if (this.board[r][c] !== 0) return false;

        const originalBoard = JSON.parse(JSON.stringify(this.board));
        this.board[r][c] = player;
        
        const opponent = player === 1 ? 2 : 1;
        let capturedAny = false;

        // 檢查四周是否吃掉對方
        this.getNeighbors(r, c).forEach(([nr, nc]) => {
            if (this.board[nr][nc] === opponent) {
                if (this.getLiberties(nr, nc).length === 0) {
                    this.removeGroup(nr, nc);
                    capturedAny = true;
                }
            }
        });

        // 禁著點判定
        if (!capturedAny && this.getLiberties(r, c).length === 0) {
            this.board = originalBoard;
            if (player === 1) alert("此處為禁著點！");
            return false;
        }

        this.currentPlayer = opponent;
        return true;
    }

    pass() {
        if (this.gameOver) return;
        this.passCount++;
        this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
        
        // 雙方連續虛手終局判斷
        if (this.passCount >= 2) {
            this.endGame("雙方連續虛手，終局！");
        } else {
            document.getElementById('status').innerText = "一方虛手 (Pass)，交換回合";
            if (this.currentPlayer === 2) setTimeout(() => this.aiMove(), 600);
        }
        this.updateUI();
    }

    aiMove() {
        if (this.gameOver) return;
        let moves = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 0) moves.push([r, c]);
            }
        }
        
        moves.sort(() => Math.random() - 0.5);
        let moved = false;
        for (let [r, c] of moves) {
            if (this.play(r, c, 2)) {
                moved = true;
                break;
            }
        }

        if (!moved) this.pass();
        else this.passCount = 0;

        this.updateUI();
        document.getElementById('status').innerText = "🖤 玩家回合 (黑棋)";
    }

    getLiberties(r, c) {
        const color = this.board[r][c];
        const liberties = new Set();
        const visited = new Set();
        const stack = [[r, c]];

        while (stack.length > 0) {
            const [currR, currC] = stack.pop();
            const key = `${currR},${currC}`;
            if (visited.has(key)) continue;
            visited.add(key);

            this.getNeighbors(currR, currC).forEach(([nr, nc]) => {
                if (this.board[nr][nc] === 0) {
                    liberties.add(`${nr},${nc}`);
                } else if (this.board[nr][nc] === color) {
                    stack.push([nr, nc]);
                }
            });
        }
        return Array.from(liberties);
    }

    removeGroup(r, c) {
        const color = this.board[r][c];
        const stack = [[r, c]];
        const visited = new Set();
        while (stack.length > 0) {
            const [currR, currC] = stack.pop();
            const key = `${currR},${currC}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (this.board[currR][currC] === color) {
                this.board[currR][currC] = 0;
                this.getNeighbors(currR, currC).forEach(n => stack.push(n));
            }
        }
    }

    getNeighbors(r, c) {
        return [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].filter(([nr, nc]) => 
            nr >= 0 && nr < 9 && nc >= 0 && nc < 9
        );
    }

    // 終局計分 (子空皆地判定)
    endGame(reason) {
        this.gameOver = true;
        let black = 0, white = 0;
        const visited = new Set();

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 1) black++;
                else if (this.board[r][c] === 2) white++;
                else if (!visited.has(`${r},${c}`)) {
                    const territory = this.floodFillTerritory(r, c, visited);
                    if (territory.owner === 1) black += territory.size;
                    else if (territory.owner === 2) white += territory.size;
                }
            }
        }

        const winMsg = black > white ? `黑勝 ${black - white} 目` : `白勝 ${white - black} 目`;
        document.getElementById('status').innerText = `${reason} ${winMsg}`;
        alert(`${reason}\n最終比分 - 黑: ${black} | 白: ${white}\n${winMsg}`);
    }

    floodFillTerritory(r, c, globalVisited) {
        let size = 0;
        let reached = new Set();
        let stack = [[r, c]];
        let localVisited = new Set();

        while(stack.length > 0) {
            const [currR, currC] = stack.pop();
            const key = `${currR},${currC}`;
            if (localVisited.has(key)) continue;
            localVisited.add(key);
            globalVisited.add(key);
            size++;

            this.getNeighbors(currR, currC).forEach(([nr, nc]) => {
                const val = this.board[nr][nc];
                if (val === 0) stack.push([nr, nc]);
                else reached.add(val);
            });
        }
        
        let owner = 0;
        if (reached.size === 1) owner = Array.from(reached)[0];
        return { size, owner };
    }

    updateUI() {
        const points = document.querySelectorAll('.point');
        points.forEach(pt => {
            const r = pt.dataset.row;
            const c = pt.dataset.col;
            pt.innerHTML = '';
            if (this.board[r][c] !== 0) {
                const stone = document.createElement('div');
                stone.className = `stone ${this.board[r][c] === 1 ? 'black' : 'white'}`;
                pt.appendChild(stone);
            }
        });
        
        let b = 0, w = 0;
        this.board.flat().forEach(v => { if(v===1) b++; if(v===2) w++; });
        document.getElementById('black-score').innerText = b;
        document.getElementById('white-score').innerText = w;
    }
}

// 啟動遊戲
const game = new GoGame();
document.getElementById('restartBtn').onclick = initBoard;
initBoard();

