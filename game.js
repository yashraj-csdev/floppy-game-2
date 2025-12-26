// ---------- CANVAS ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 400;
const HEIGHT = 600;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// ---------- GAME STATE ----------
let gameStarted = false;
let gameOver = false;

// ---------- BIRD ----------
let birdX = 100;
let birdY = 300;
let velocity = 0;

const gravity = 0.25;      // smoother gravity (mobile friendly)
const jumpStrength = -5;   // softer jump
const birdRadius = 15;

let birdImg = null;

// ---------- PIPE ----------
let pipeX = WIDTH;
const pipeWidth = 60;
const pipeSpeed = 2;

let pipeHeight = randInt(150, 300);
let pipeGap = randInt(150, 210);

let pipeImg = null;

// ---------- INPUT CONTROL ----------
let canJump = true;

// ---------- RANDOM ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- RESET PIPE ----------
function resetPipe() {
  pipeX = WIDTH;
  pipeHeight = randInt(150, 300);
  pipeGap = randInt(150, 210);
}

// ---------- RESET GAME ----------
function resetGame() {
  birdY = 300;
  velocity = 0;
  pipeX = WIDTH;
  resetPipe();
  gameStarted = false;
  gameOver = false;
}

// ---------- LOAD USER IMAGES ----------
function loadImage(inputId, callback) {
  const input = document.getElementById(inputId);
  if (!input.files || !input.files[0]) return;

  const img = new Image();
  img.src = URL.createObjectURL(input.files[0]);
  img.onload = () => callback(img);
}

document.getElementById("birdInput").addEventListener("change", () => {
  loadImage("birdInput", img => birdImg = img);
});

document.getElementById("pipeInput").addEventListener("change", () => {
  loadImage("pipeInput", img => pipeImg = img);
});

// ---------- INPUT ----------
function jump() {
  if (!canJump) return;

  if (gameOver) {
    resetGame();
    return;
  }

  gameStarted = true;
  velocity = jumpStrength;
  canJump = false;

  // prevent jump spamming (important for mobile)
  setTimeout(() => {
    canJump = true;
  }, 150);
}

canvas.addEventListener("click", jump);
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

// ---------- COLLISION ----------
function checkCollision() {
  // Top or bottom of screen
  if (birdY - birdRadius < 0 || birdY + birdRadius > HEIGHT) {
    gameOver = true;
  }

  // Pipe collision
  if (
    birdX + birdRadius > pipeX &&
    birdX - birdRadius < pipeX + pipeWidth
  ) {
    if (
      birdY - birdRadius < pipeHeight ||
      birdY + birdRadius > pipeHeight + pipeGap
    ) {
      gameOver = true;
    }
  }
}

// ---------- GAME LOOP ----------
function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gameStarted && !gameOver) {
    velocity += gravity;

    // limit fall speed
    if (velocity > 8) velocity = 8;

    birdY += velocity;
    pipeX -= pipeSpeed;

    if (pipeX < -pipeWidth) {
      resetPipe();
    }

    checkCollision();
  }

  // ---------- DRAW BIRD ----------
  if (birdImg) {
    ctx.drawImage(birdImg, birdX - 18, birdY - 18, 36, 36);
  } else {
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
  }

  // ---------- DRAW PIPES ----------
  if (pipeImg) {
    ctx.drawImage(pipeImg, pipeX, pipeHeight - 400, pipeWidth, 400);
    ctx.drawImage(pipeImg, pipeX, pipeHeight + pipeGap, pipeWidth, 400);
  } else {
    ctx.fillStyle = "green";
    ctx.fillRect(pipeX, 0, pipeWidth, pipeHeight);
    ctx.fillRect(pipeX, pipeHeight + pipeGap, pipeWidth, HEIGHT);
  }

  // ---------- TEXT ----------
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";

  if (!gameStarted) {
    ctx.fillText("Tap or Press SPACE to Start", 80, HEIGHT / 2);
  }

  if (gameOver) {
    ctx.fillText("Game Over", 150, HEIGHT / 2 - 20);
    ctx.fillText("Tap or Press SPACE to Restart", 60, HEIGHT / 2 + 20);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
