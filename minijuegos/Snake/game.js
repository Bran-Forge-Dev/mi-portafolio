const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('finalScore');
const gameOverEl = document.getElementById('gameOver');
const startScreenEl = document.getElementById('startScreen');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop = null;
let gameRunning = false;

// Variables para el tiempo
let startTime = null;
let totalSeconds = 0;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 1;
  dy = 0;
  score = 0;
  totalSeconds = 0;
  startTime = Date.now(); // Iniciar cronómetro
  scoreEl.textContent = score;
  spawnFood();
  draw();
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
  }
}

function draw() {
  // Fondo
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cuadrícula sutil
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }

  // Comida
  const padding = 2;
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    (GRID_SIZE - padding) / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Serpiente
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const r = (GRID_SIZE - 2) / 2;
    const cx = seg.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = seg.y * GRID_SIZE + GRID_SIZE / 2;

    if (isHead) {
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#22c55e';
    } else {
      const t = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = `rgb(${74 + (1 - t) * 80}, ${222 - (1 - t) * 100}, ${128 - (1 - t) * 30})`;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function update() {
  if (!gameRunning) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Choque con paredes
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    endGame();
    return;
  }

  // Choque consigo misma
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}


function endGame() {
  gameRunning = false;
  if (gameLoop) clearInterval(gameLoop);
  
  // Calcular tiempo final
  totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');
/*
  // Capturar nombre y enviar a la función global de Supabase
  setTimeout(async () => {
      const playerName = prompt("¡Game Over! Introduce tu nombre para el ranking:");
      if (playerName && playerName.trim() !== "") {
          // Llamamos a la función del otro archivo JS
          await saveGameScore('snake', playerName, score, totalSeconds);
      }
  }, 500);
  */
}


function startGame() {
  startScreenEl.classList.add('hidden');
  gameOverEl.classList.add('hidden');
  gameRunning = true;
  initGame();
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, 180);
}

document.addEventListener('keydown', (e) => {
  if (!gameRunning && e.key !== 'Enter') return;
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (dy !== 1) { dx = 0; dy = -1; }
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (dy !== -1) { dx = 0; dy = 1; }
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (dx !== 1) { dx = -1; dy = 0; }
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (dx !== -1) { dx = 1; dy = 0; }
      e.preventDefault();
      break;
  }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);