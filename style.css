:root {
    --board-size: 480px;
    --cell-size: calc(var(--board-size) / 8);
}
* { box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
    background: #f2f6f9;
    color: #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
}
.container { width: calc(var(--board-size) + 40px); }
h1 { text-align: center; margin: 0 0 12px; }
.controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}
.controls .status, .controls .score { font-weight: 600; }
#restartBtn {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #fff;
    cursor: pointer;
}
.board-wrap {
    background: linear-gradient(180deg, #e6f0ea, #dbeee0);
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(15,23,42,0.08);
}
.board {
    width: var(--board-size);
    height: var(--board-size);
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(8, 1fr);
    gap: 4px;
    padding: 4px;
    background: #2b6b3f;
    border-radius: 8px;
}
.cell {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.cell .piece {
    width: 80%;
    height: 80%;
    border-radius: 50%;
    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    z-index: 2;
}
.piece.black { background: #111; }
.piece.white { background: #fff; border: 1px solid #ccc; }
.cell.possible { background: rgba(255, 255, 255, 0.1); border: 1px dashed rgba(255,255,255,0.4); }
.cell.available:hover { background: rgba(255, 255, 255, 0.2); }
.cell .hint {
    position: absolute;
    right: 4px;
    bottom: 4px;
    font-size: 10px;
    color: #fff;
    opacity: 0.8;
}
.legend { margin-top: 10px; font-size: 13px; color: #334155; }

@media (max-width: 520px) {
    :root { --board-size: 90vw; }
}
