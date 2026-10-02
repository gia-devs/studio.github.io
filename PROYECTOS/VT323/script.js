const playerElement = document.getElementById("player");
const glyphs = document.querySelectorAll(".glyph");
const logBox = document.getElementById("log");
const infoText = document.getElementById("infoText");
const mapa = document.getElementById("mapa");
const alarmOverlay = document.getElementById("alarmOverlay");
const alarmTitle = document.getElementById("alarmTitle");
const restartBtn = document.getElementById("restartBtn");
const highScoreDisplay = document.getElementById("highScoreDisplay");

// --- CANVAS MATRIX BACKGROUND (GRIS) ---
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

function resizeMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeMatrix);
resizeMatrix();

const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/-_VT323SYSTEM*#";
const fontSize = 16;
let columns = canvas.width / fontSize;
let drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#9a9a9a"; // Color gris tipo terminal
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

// --- MOTOR DE AUDIO RETRO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "pickup") {
        osc.type = "square";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
    else if (type === "move") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
    else if (type === "start") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
    else if (type === "alarm") {
        osc.type = "square";
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(440, now + 0.12);
        osc.frequency.setValueAtTime(660, now + 0.24);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
    else if (type === "win") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15);
        osc.frequency.setValueAtTime(659.25, now + 0.3);
        osc.frequency.setValueAtTime(880, now + 0.45);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
    }
}

// --- ESTADO DEL JUEGO & HIGHSCORE ---
const step = 5;
const LIMIT_MIN = 0;
const LIMIT_MAX = 90;

let cuerpoPosiciones = [{ x: 40, y: 40 }];
let cuerpoDivs = [playerElement];
let collected = 0;
let gameOver = false;
let animId = null;
let gameInterval = null;

let dirX = 0;
let dirY = 0;
let gameStarted = false;
const totalGlyphs = glyphs.length;

let highScore = localStorage.getItem("vt323_highscore") || 0;
highScoreDisplay.textContent = `RECORD: ${highScore}`;

const panels = [
    document.querySelector(".article_4"),
    document.querySelector(".article_1"),
    document.querySelector(".article_3"),
    document.querySelector(".article_9"),
    document.querySelector(".article_6"),
    document.querySelector(".article_7"),
    document.querySelector(".article_8")
];

let itemsData = [];
glyphs.forEach(g => {
    const x = Math.random() * 80;
    const y = Math.random() * 80;
    g.style.left = x + "%";
    g.style.top = y + "%";
    itemsData.push({
        el: g,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2
    });
});

function moveItems() {
    itemsData.forEach(item => {
        if (item.el.classList.contains("taken")) return;

        item.x += item.vx;
        item.y += item.vy;

        if (item.x <= 0 || item.x >= 94) item.vx *= -1;
        if (item.y <= 0 || item.y >= 94) item.vy *= -1;

        item.el.style.left = item.x + "%";
        item.el.style.top = item.y + "%";
    });
    animId = requestAnimationFrame(moveItems);
}

function actualizarVisual() {
    cuerpoPosiciones.forEach((pos, index) => {
        cuerpoDivs[index].style.left = pos.x + "%";
        cuerpoDivs[index].style.top = pos.y + "%";
    });
}

function añadirSegmento() {
    const nuevoSegmento = document.createElement("div");
    nuevoSegmento.className = "player-body";
    mapa.appendChild(nuevoSegmento);
    cuerpoDivs.push(nuevoSegmento);
    cuerpoPosiciones.push({ ...cuerpoPosiciones[cuerpoPosiciones.length - 1] });
}

function logEvent(text) {
    const p = document.createElement("p");
    p.textContent = "> " + text;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
}

function triggerCrash(reason = "ALERTA: CONTACTO CON EL LÍMITE") {
    if (gameOver) return;
    gameOver = true;
    clearInterval(gameInterval);
    playSound("alarm");
    mapa.classList.add("crash");
    alarmTitle.textContent = "⚠ COLISIÓN DETECTADA ⚠";
    alarmTitle.classList.remove("win-text");
    alarmOverlay.classList.add("show");
    infoText.innerHTML = "▶ COLISIÓN DETECTADA<br>▶ SISTEMA BLOQUEADO";
    logEvent(reason);
}

function triggerWin() {
    if (gameOver) return;
    gameOver = true;
    clearInterval(gameInterval);
    playSound("win");
    mapa.classList.add("win");
    alarmTitle.textContent = "✔ SISTEMA DESBLOQUEADO ✔";
    alarmTitle.classList.add("win-text");
    alarmOverlay.classList.add("show");
    infoText.innerHTML = "▶ ACCESO CONCEDIDO<br>▶ NÚCLEO OPTIMIZADO";
    logEvent("SISTEMA DESBLOQUEADO EXITOSAMENTE");

    if (collected > highScore) {
        highScore = collected;
        localStorage.setItem("vt323_highscore", highScore);
        highScoreDisplay.textContent = `RECORD: ${highScore}`;
    }
}

function resetGame() {
    clearInterval(gameInterval);
    cuerpoDivs.slice(1).forEach(div => div.remove());
    cuerpoDivs = [playerElement];
    cuerpoPosiciones = [{ x: 40, y: 40 }];
    collected = 0;
    gameOver = false;
    gameStarted = false;
    dirX = 0;
    dirY = 0;

    actualizarVisual();

    itemsData.forEach(item => {
        item.el.classList.remove("taken");
        item.x = Math.random() * 80;
        item.y = Math.random() * 80;
    });

    panels.forEach(p => p.classList.remove("active"));
    document.querySelector(".article_2").classList.add("active");
    document.querySelector(".article_5").classList.add("active");
    document.querySelector(".article_4").classList.add("active");

    mapa.classList.remove("crash", "win");
    alarmOverlay.classList.remove("show");
    infoText.innerHTML = "▶ SISTEMA APAGADO<br>▶ USA LAS FLECHAS";
    logBox.innerHTML = "";
    logEvent("SISTEMA REINICIADO");

    if (!animId) moveItems();
}

restartBtn.addEventListener("click", resetGame);

function gameLoop() {
    if (gameOver || !gameStarted) return;

    const copiaAnterior = cuerpoPosiciones.map(p => ({ ...p }));
    let intentoX = cuerpoPosiciones[0].x + dirX;
    let intentoY = cuerpoPosiciones[0].y + dirY;

    if (intentoX < LIMIT_MIN || intentoX > LIMIT_MAX || intentoY < LIMIT_MIN || intentoY > LIMIT_MAX) {
        cuerpoPosiciones[0].x = Math.max(LIMIT_MIN, Math.min(LIMIT_MAX, intentoX));
        cuerpoPosiciones[0].y = Math.max(LIMIT_MIN, Math.min(LIMIT_MAX, intentoY));
        actualizarVisual();
        triggerCrash("ALERTA: CONTACTO CON EL LÍMITE DEL MAPA");
        return;
    }

    cuerpoPosiciones[0].x = intentoX;
    cuerpoPosiciones[0].y = intentoY;

    for (let i = 1; i < cuerpoPosiciones.length; i++) {
        cuerpoPosiciones[i] = copiaAnterior[i - 1];
    }

    actualizarVisual();

    if (gameOver) return;

    itemsData.forEach(item => {
        if (item.el.classList.contains("taken")) return;

        const dx = Math.abs(item.x - cuerpoPosiciones[0].x);
        const dy = Math.abs(item.y - cuerpoPosiciones[0].y);

        if (dx < 7 && dy < 7) {
            item.el.classList.add("taken");
            playSound("pickup");
            collected++;
            añadirSegmento();

            if (panels[collected - 1]) panels[collected - 1].classList.add("active");
            infoText.textContent = item.el.dataset.info;
            logEvent("DATO SINCRONIZADO [" + collected + "/" + totalGlyphs + "]: " + item.el.dataset.info);

            if (collected === totalGlyphs) {
                triggerWin();
            }
        }
    });
}

function changeDirection(newDirX, newDirY) {
    if (gameOver) return;

    if (!gameStarted) {
        gameStarted = true;
        playSound("start");
        infoText.innerHTML = "▶ SISTEMA ONLINE<br>▶ CAPTURA DATOS MÓVILES";
        gameInterval = setInterval(gameLoop, 120);
    }

    if (newDirX !== 0 && dirX === 0) {
        dirX = newDirX;
        dirY = 0;
        playSound("move");
    } else if (newDirY !== 0 && dirY === 0) {
        dirX = 0;
        dirY = newDirY;
        playSound("move");
    }
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { e.preventDefault(); changeDirection(0, -step); }
    if (e.key === "ArrowDown") { e.preventDefault(); changeDirection(0, step); }
    if (e.key === "ArrowLeft") { e.preventDefault(); changeDirection(-step, 0); }
    if (e.key === "ArrowRight") { e.preventDefault(); changeDirection(step, 0); }
});

document.getElementById("btnUp").addEventListener("click", () => changeDirection(0, -step));
document.getElementById("btnDown").addEventListener("click", () => changeDirection(0, step));
document.getElementById("btnLeft").addEventListener("click", () => changeDirection(-step, 0));
document.getElementById("btnRight").addEventListener("click", () => changeDirection(step, 0));

moveItems();