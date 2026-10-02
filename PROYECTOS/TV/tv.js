const channels = [
    'tv-img/a1.png',
    'tv-img/b1.png',
    'tv-img/c1.png',
    'tv-img/d1.png',
    'tv-img/e1.png',
    'tv-img/f1.png',
    'tv-img/g1.png',
    'tv-img/h1.png',
    'tv-img/i1.png',
    'tv-img/j1.png',
    'tv-img/k1.png',
    'tv-img/l1.png',
    'tv-img/m1.png',
    'tv-img/n1.png',
    'tv-img/o1.png',
    'tv-img/p1.png',
    'tv-img/q1.png',
    'tv-img/r1.png'
];

const imgsBack = document.querySelectorAll('article:nth-child(2) img');
const figures = document.querySelectorAll('article:nth-child(2) figure');

// Filtros SVG: separación RGB + ruido/grano
const svgFilters = `
<svg style="position:absolute;width:0;height:0;">
  <filter id="red">
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
  </filter>
  <filter id="cyan">
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
  </filter>
  <filter id="green">
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
  </filter>
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0"/>
  </filter>
</svg>
`;
document.body.insertAdjacentHTML('afterbegin', svgFilters);

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Grano + flicker de brillo, con timing distinto por TV
figures.forEach((figure) => {
    const grain = document.createElement('div');
    grain.className = 'grain-layer';
    figure.appendChild(grain);

    const flick = document.createElement('div');
    flick.className = 'flicker-layer';
    flick.style.animation = `flicker ${random(2.5, 6)}s ease-in-out infinite`;
    flick.style.animationDelay = `${random(0, 4)}s`;
    figure.appendChild(flick);
});

// ===== Glitch de color (RGB split): breve y poco frecuente =====
function applyModernGlitch(img) {
    const figure = img.parentElement;

    figure.querySelectorAll('.rgb-layer').forEach(el => el.remove());

    const red = img.cloneNode();
    const cyan = img.cloneNode();
    const green = img.cloneNode();

    red.className = 'rgb-layer rgb-red';
    cyan.className = 'rgb-layer rgb-cyan';
    green.className = 'rgb-layer rgb-green';

// Offsets un poco más grandes que antes (pero menos que la primera versión)
red.style.transform = `translate(${random(-14, 14)}px, ${random(-5, 5)}px)`;
cyan.style.transform = `translate(${random(-16, 16)}px, ${random(-4, 4)}px)`;
green.style.transform = `translate(${random(-9, 9)}px, ${random(-3, 3)}px)`;

    figure.appendChild(red);
    figure.appendChild(cyan);
    figure.appendChild(green);

    const slices = [
        `polygon(0 0, 100% 0, 100% ${random(8,25)}%, 0 ${random(10,30)}%)`,
        `polygon(0 ${random(30,50)}%, 100% ${random(25,45)}%, 100% ${random(55,75)}%, 0 ${random(60,80)}%)`,
        `polygon(0 ${random(70,85)}%, 100% ${random(65,80)}%, 100% 100%, 0 100%)`
    ];

    img.style.clipPath = slices[Math.floor(Math.random() * slices.length)];
    red.style.clipPath = slices[Math.floor(Math.random() * slices.length)];
    cyan.style.clipPath = slices[Math.floor(Math.random() * slices.length)];

    const corruptFilters = [
        'grayscale(100%) contrast(250%) brightness(80%) sepia(80%)',
        'grayscale(180%) contrast(300%) brightness(160%)',
        'grayscale(100%) contrast(400%) brightness(60%) sepia(80%)',
        'contrast(500%) brightness(180%) saturate(0)'
    ];
    img.style.filter = corruptFilters[Math.floor(Math.random() * corruptFilters.length)];
    img.style.transform = `translate(${random(-4,4)}px, ${random(-3,3)}px) scale(${random(1.01, 1.06)})`;

    // Muy breve: apenas un destello de color
    const duration = random(80, 440);

    setTimeout(() => {
        figure.querySelectorAll('.rgb-layer').forEach(el => el.remove());
        img.style.clipPath = '';
        img.style.transform = '';
        img.style.filter = ''; // vuelve al B/N definido en CSS
    }, duration);
}


// ===== Glitch horizontal (franjas desplazadas) =====
function applyHorizontalHold(img) {
    const bandY = random(20, 70);
    img.style.transform = `translateX(${random(-20, 20)}px)`;
    img.style.clipPath = `inset(${bandY}% 0 ${100 - bandY - random(5,15)}% 0)`;
    setTimeout(() => {
        img.style.transform = '';
        img.style.clipPath = '';
    }, random(150, 280));
}

// ===== Canal muerto (sin señal, unos segundos) =====
function applyDeadChannel(figure) {
    figure.classList.add('dead-channel');
    setTimeout(() => {
        figure.classList.remove('dead-channel');
    }, random(1200, 2200));
}

// Cada televisor con su propio ritmo y su propio efecto extra
imgsBack.forEach((img, i) => {
    const speed = random(80, 480);
    const group = i % 3; // 0: salto vertical | 1: glitch horizontal | 2: canal muerto

    setInterval(() => {
        const figure = img.parentElement;

        if (figure.classList.contains('dead-channel')) return;

        let newSrc;
        do {
            newSrc = channels[Math.floor(Math.random() * channels.length)];
        } while (img.src.includes(newSrc));

        img.src = newSrc;

        const doGlitch = Math.random() < 0.3; 

        if (doGlitch) {
            applyModernGlitch(img);
        } else if (group === 2 && Math.random() < 0.8) {
            applyStaticRoll(figure);
        } else if (group === 1 && Math.random() < 0.4) {
            applyHorizontalHold(img);
        } else if (group === 2 && Math.random() < 0.8) {
            applyDeadChannel(figure);
        }

    }, speed);
});

/* ===== Apagado/encendido en bucle cada 20s ===== */
function shutdownSequence() {
    const stagger = 150;

    figures.forEach((figure, i) => {
        setTimeout(() => {
            figure.classList.add('tv-off');
        }, i * stagger);
    });

    const offDuration = figures.length * stagger + 400;

    setTimeout(() => {
        setTimeout(() => {
            figures.forEach((figure, i) => {
                setTimeout(() => {
                    figure.classList.remove('tv-off');
                    figure.classList.add('tuning');
                    setTimeout(() => figure.classList.remove('tuning'), 600);
                }, i * stagger);
            });

            const onDuration = figures.length * stagger + 400;
            setTimeout(shutdownSequence, onDuration + 20000);

        }, 1000);
    }, offDuration);
}

setTimeout(shutdownSequence, 20000);