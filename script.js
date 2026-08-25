const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let width;
let height;
let centerX;
let centerY;

const stars = [];
const STAR_COUNT = 400;
const SPEED = 1;
const DEPTH = 1600;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    centerX = width / 2;
    centerY = height / 2;
}
function createStar() {
    return {
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * DEPTH,
        pz: 0
    };
}
function resetStar(star) {
    star.x = (Math.random() - 0.5) * width * 2;
    star.y = (Math.random() - 0.5) * height * 2;
    star.z = DEPTH;
    star.pz = DEPTH;
}
function init() {
    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(createStar());
    }
}
function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {

        star.pz = star.z;
        star.z -= SPEED;

        if (star.z <= 1) {
            resetStar(star);
            continue;
        }

        const sx = centerX + (star.x / star.z) * 302;
        const sy = centerY + (star.y / star.z) * 302;

        const px = centerX + (star.x / star.pz) * 300;
        const py = centerY + (star.y / star.pz) * 300;

        const depth = 1 - star.z / DEPTH;

        const size = Math.max(
            0.25,
            depth * 0.9
        );

        const opacity = Math.min(
            0.75,
            depth * 1.1
        );

        if (
            sx < -50 ||
            sx > width + 50 ||
            sy < -50 ||
            sy > height + 50
        ) {
            resetStar(star);
            continue;
        }

        /* ESTELA CASI INVISIBLE */

        if (depth > 0.55) {

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);

            ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.25})`;
            ctx.lineWidth = 0.80;

            ctx.stroke();
        }

        /* ESTRELLA */

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);

resize();
init();
draw();