const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const finalScoreEl = document.getElementById('finalScore');
const gameOverEl = document.getElementById('gameOver');
const startScreenEl = document.getElementById('startScreen');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

const COLS = 10;
const ROWS = 20;
const CELL = 20;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

const COLORS = [
  '#22d3ee', // I - cyan
  '#fbbf24', // O - amarillo
  '#a78bfa', // T - violeta
  '#4ade80', // S - verde
  '#e94560', // Z - rojo
  '#3b82f6', // J - azul
  '#f97316', // L - naranja
];

let grid = [];
let current = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let gameRunning = false;
let dropInterval = 1000;
let lastDrop = 0;

// Variables para el tiempo (Supabase)
let startTime = null;
let totalSeconds = 0;

function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece(type) {
  const shape = SHAPES[type];
  const color = COLORS[type];
  return {
    shape,
    color,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

function randomPiece() {
  return Math.floor(Math.random() * SHAPES.length);
}

function initGame() {
  grid = createGrid();
  nextPiece = randomPiece();
  spawnPiece();
  score = 0;
  level = 1;
  lines = 0;
  totalSeconds = 0;
  startTime = Date.now(); // Iniciar cronómetro para capturar tiempo jugado
  dropInterval = 1000;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
  draw();
  drawNext();
}

function spawnPiece() {
  const type = nextPiece;
  nextPiece = randomPiece();
  current = createPiece(type);
  if (collides(current)) {
    endGame();
    return;
  }
  drawNext();
}

function collides(piece, offsetX = 0, offsetY = 0) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (!piece.shape[row][col]) continue;
      const nx = piece.x + col + offsetX;
      const ny = piece.y + row + offsetY;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && grid[ny][nx]) return true;
    }
  }
  return false;
}

function mergePiece() {
  for (let row = 0; row < current.shape.length; row++) {
    for (let col = 0; col < current.shape[row].length; col++) {
      if (!current.shape[row][col]) continue;
      const ny = current.y + row;
      const nx = current.x + col;
      if (ny >= 0) grid[ny][nx] = current.color;
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row].every((cell) => cell !== 0)) {
      grid.splice(row, 1);
      grid.unshift(Array(COLS).fill(0));
      cleared++;
      row++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] || 800;
    score += points * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 80);
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }
}

function rotatePiece() {
  if (!current) return;
  const rotated = current.shape[0].map((_, i) =>
    current.shape.map((row) => row[i]).reverse()
  );
  const prev = current.shape;
  current.shape = rotated;
  if (collides(current)) current.shape = prev;
}

function movePiece(dx, dy) {
  if (!current) return;
  if (collides(current, dx, dy)) {
    if (dy > 0) {
      mergePiece();
      clearLines();
      spawnPiece();
    }
    return;
  }
  current.x += dx;
  current.y += dy;
}

function hardDrop() {
  if (!current) return;
  while (!collides(current, 0, 1)) {
    current.y++;
    score += 2;
  }
  scoreEl.textContent = score;
  mergePiece();
  clearLines();
  spawnPiece();
}

function draw() {
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const color = grid[row][col];
      if (color) drawCell(col, row, color);
    }
  }

  if (current) {
    for (let row = 0; row < current.shape.length; row++) {
      for (let col = 0; col < current.shape[row].length; col++) {
        if (!current.shape[row][col]) continue;
        drawCell(current.x + col, current.y + row, current.color, true);
      }
    }
  }
}

function drawCell(x, y, color, ghost = false) {
  const pad = 1;
  const px = x * CELL + pad;
  const py = y * CELL + pad;
  const size = CELL - pad * 2;

  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);

  if (ghost) ctx.globalAlpha = 0.9;
  ctx.strokeStyle = ghost ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, size, size);
  ctx.globalAlpha = 1;
}

function drawNext() {
  nextCtx.fillStyle = 'rgba(0,0,0,0.3)';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  const shape = SHAPES[nextPiece];
  const color = COLORS[nextPiece];
  const cell = 18;
  const offsetX = (80 - shape[0].length * cell) / 2 + 2;
  const offsetY = (80 - shape.length * cell) / 2 + 2;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      nextCtx.fillStyle = color;
      nextCtx.fillRect(offsetX + col * cell, offsetY + row * cell, cell - 2, cell - 2);
    }
  }
}

function update(timestamp) {
  if (!gameRunning) return;
  if (timestamp - lastDrop > dropInterval) {
    movePiece(0, 1);
    lastDrop = timestamp;
  }
  draw();
}

function endGame() {
  gameRunning = false;
  if (gameLoop) cancelAnimationFrame(gameLoop);
  
  // Calcular tiempo jugado en segundos
  totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');

  /*
  // Capturar nombre y enviar a Supabase usando la función global definida en supabase-config.js
  setTimeout(async () => {
    const playerName = prompt("¡Partida terminada! Introduce tu nombre para el ranking de Tetris:");
    if (playerName && playerName.trim() !== "") {
      // Usamos la función global del archivo externo
      if (typeof saveGameScore === 'function') {
        await saveGameScore('tetris', playerName, score, totalSeconds);
      } else {
        console.error("Error: La función saveGameScore no está disponible.");
      }
    }
  }, 500);
  */
}

function startGame() {
  startScreenEl.classList.add('hidden');
  gameOverEl.classList.add('hidden');
  gameRunning = true;
  initGame();
  lastDrop = performance.now();
  function loop(ts) {
    update(ts);
    if (gameRunning) gameLoop = requestAnimationFrame(loop);
  }
  gameLoop = requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  switch (e.key) {
    case 'ArrowLeft':
      movePiece(-1, 0);
      e.preventDefault();
      break;
    case 'ArrowRight':
      movePiece(1, 0);
      e.preventDefault();
      break;
    case 'ArrowDown':
      movePiece(0, 1);
      score += 1;
      scoreEl.textContent = score;
      e.preventDefault();
      break;
    case 'ArrowUp':
      rotatePiece();
      e.preventDefault();
      break;
    case ' ':
      hardDrop();
      e.preventDefault();
      break;
  }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);