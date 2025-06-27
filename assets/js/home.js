const contentBox = document.querySelector('.content');
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let stars = [];
let mouseX = 0, mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomStartPosition() {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
        case 0: return { x: Math.random() * canvas.width, y: -10 };
        case 1: return { x: canvas.width + 10, y: Math.random() * canvas.height };
        case 2: return { x: Math.random() * canvas.width, y: canvas.height + 10 };
        case 3: return { x: -10, y: Math.random() * canvas.height };
    }
}

const numStars = 150;
for (let i = 0; i < numStars; i++) {
    const isShootingStar = Math.random() < 0.08; // Reduced probability for fewer shooting stars
    let speedX = 0.5 + Math.random() * 0.5;
    let speedY = 0.5 + Math.random() * 0.5;

    if (isShootingStar) {
        // Fixed shooting star speed calculation
        const angle = Math.PI * (0.2 + Math.random() * 0.1); // ~30-45 degrees
        const speed = 3 + Math.random() * 4; // Much faster speed (3-7)
        speedX = Math.cos(angle) * speed;
        speedY = Math.sin(angle) * speed;
    }

    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: isShootingStar ? Math.random() * 1.5 + 1 : Math.random() * 1 + 0.5,
        speedX,
        speedY,
        alpha: 0,
        fadeIn: true,
        isShootingStar,
        trail: [],
        glitterPhase: Math.random() * Math.PI * 2,
        glitterSpeed: 0.002 + Math.random() * 0.0005
    });
}

function makeConstellation(points, lines, xOffset, yOffset) {
    const transformed = points.map(p => ({
        x: p.x + xOffset,
        y: p.y + yOffset,
        glitterPhase: Math.random() * Math.PI * 2,
        glitterSpeed: 0.002 + Math.random() * 0.00002
    }));
    return { stars: transformed, lines: lines };
}

// Define three different constellations
const CONSTELLATIONS = [
    {
        name: "Sagittarius",
        points: [
            { x: 127.5, y: 67.5 },  // 0 - center node
            { x: 97.5, y: 37.5 },   // 1 - upper left branch
            { x: 67.5, y: 22.5 },   // 2 - far upper left
            { x: 112.5, y: 22.5 },  // 3 - upper middle
            { x: 142.5, y: 22.5 },  // 4 - upper right
            { x: 187.5, y: 37.5 },  // 5 - far upper right
            { x: 172.5, y: 67.5 },  // 6 - right branch
            { x: 202.5, y: 82.5 },  // 7 - far right
            { x: 157.5, y: 97.5 },  // 8 - lower right
            { x: 172.5, y: 127.5 }, // 9 - bottom right
            { x: 97.5, y: 97.5 },   // 10 - lower left branch
            { x: 67.5, y: 112.5 },  // 11 - bottom left
            { x: 52.5, y: 142.5 },  // 12 - far bottom left
            { x: 37.5, y: 67.5 },   // 13 - left side
            { x: 22.5, y: 37.5 }    // 14 - far left
        ],
        lines: [
            [0, 1], [1, 2], [1, 3], [3, 4], [4, 5],
            [0, 6], [6, 7], [6, 8], [8, 9],
            [0, 10], [10, 11], [11, 12],
            [1, 13], [13, 14]
        ]
    },
    {
        name: "Orion",
        points: [
            { x: 96.0, y: 48.0 },     // 0
            { x: 126.0, y: 60.0 },    // 1
            { x: 96.0, y: 153.0 },    // 2
            { x: 183.0, y: 150.0 },   // 3
            { x: 172.5, y: 213.0 },   // 4
            { x: 210.0, y: 243.0 },   // 5
            { x: 114.0, y: 246.0 },   // 6
            { x: 105.0, y: 300.0 },   // 7
            { x: 243.0, y: 57.0 },    // 8
            { x: 264.0, y: 96.0 },    // 9
            { x: 273.0, y: 165.0 },   // 10
            { x: 270.0, y: 217.5 },   // 11
            { x: 153.0, y: 115.5 },   // 12
            { x: 273.0, y: 138.0 },   // 13
            { x: 144.0, y: 231.0 },   // 14
            { x: 217.5, y: 303.0 }    // 15
        ],
        lines: [
            [0, 2], [1, 2], [2, 6], [2, 12],
            [3, 4], [4, 5], [4, 14], [6, 7],
            [8, 9], [10, 11], [9, 13],
            [3, 13], [13, 10], [12, 3], [6, 14], [15, 7], [15, 5]
        ]
    },
    {
        name: "Cancer",
        points: [
            { x: 0, y: 0 }, { x: 40, y: 10 }, { x: 50, y: 20 }, { x: 60, y: 60 }, { x: 80, y: 30 }
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [2, 4]
        ]
    },
    {
        name: "Big",
        points: [
            { x: 80, y: 30 },   // 0 - top star
            { x: 95, y: 65 },   // 1 - second from top
            { x: 100, y: 90 },  // 2 - middle junction star
            { x: 110, y: 125 },  // 3 - left middle star
            { x: 155, y: 125 }, // 4 - right middle star
            { x: 90, y: 160 },  // 5 - bottom left star
            { x: 150, y: 170 }  // 6 - bottom right star
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [3, 5], [4, 6], [5, 6]
        ]
    },
    {
        name: "Gemini",
        points: [
            { x: 90, y: 15 },    // 0 - top left star
            { x: 120, y: 52.5 }, // 1 - upper middle left
            { x: 180, y: 30 },   // 2 - top middle star
            { x: 195, y: 52.5 }, // 3 - upper middle right
            { x: 60, y: 75 },    // 4 - left side star
            { x: 150, y: 82.5 }, // 5 - center junction star
            { x: 225, y: 105 },  // 6 - main right junction
            { x: 277.5, y: 112.5 }, // 7 - far right star
            { x: 105, y: 180 },  // 8 - left middle star
            { x: 45, y: 247.5 }, // 9 - bottom left star
            { x: 105, y: 240 },  // 10 - left bottom middle
            { x: 195, y: 322.5 }, // 11 - center bottom star
            { x: 225, y: 255 },  // 12 - right bottom junction
            { x: 255, y: 322.5 }, // 13 - bottom right star
            { x: 292.5, y: 337.5 }, // 14 - far bottom right star
            { x: 337.5, y: 337.5 }  // 15 - last
        ],
        lines: [
            [0, 1], [1, 5], [2, 3], [3, 6], [4, 1],
            [5, 6], [6, 7], [1, 8], [6, 12], [8, 9],
            [8, 10], [11, 12], [12, 13],
            [13, 14], [14, 15]
        ]
    },
    {
        name: "scorp",
        points: [
            { x: 120, y: 65 },   // 0 - Antares (center bright star)
            { x: 145, y: 25 },   // 1 - top right star
            { x: 170, y: 45 },   // 2 - far top right star
            { x: 160, y: 70 },   // 3 - right middle star
            { x: 180, y: 70 },   // 4 - far right star
            { x: 130, y: 85 },   // 5 - below Antares
            { x: 115, y: 125 },  // 6 - middle of vertical line
            { x: 130, y: 150 },  // 7 - lower right of curve
            { x: 110, y: 165 },  // 8 - bottom of curve
            { x: 85, y: 160 },   // 9 - left side of curve
            { x: 65, y: 145 },   // 10 - Shaula area
            { x: 50, y: 125 },   // 11 - above Shaula
            { x: 35, y: 140 }    // 12 - left of Shaula
        ],
        lines: [
            [0, 1], [1, 2], [0, 3], [3, 4], [0, 5],
            [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
            [10, 11], [11, 12]
        ]
    },
    {
        name: "taurus",
        points: [
            { x: 30, y: 30 },    // 0 - top left star
            { x: 80, y: 50 },    // 1 - upper middle star
            { x: 20, y: 80 },    // 2 - left middle star
            { x: 60, y: 90 },    // 3 - center left star
            { x: 110, y: 110 },  // 4 - center junction star
            { x: 160, y: 120 },  // 5 - right middle star
            { x: 180, y: 110 },  // 6 - far right star
            { x: 130, y: 140 },  // 7 - lower right star
            { x: 120, y: 160 },  // 8 - bottom right star
            { x: 110, y: 180 }   // 9 - bottom star
        ],
        lines: [
            [0, 1], [1, 3], [2, 3], [3, 4], [4, 5],
            [5, 6], [4, 7], [7, 8], [8, 9]
        ]
    },
    {
        name: "virgo",
        points: [
            { x: 80, y: 40 },    // 0 - upper left star
            { x: 120, y: 70 },   // 1 - upper middle star
            { x: 140, y: 50 },   // 2 - upper right star
            { x: 170, y: 30 },   // 3 - far upper right star
            { x: 150, y: 85 },   // 4 - right middle star
            { x: 110, y: 110 },  // 5 - center junction star
            { x: 60, y: 120 },   // 6 - left middle star
            { x: 30, y: 140 },   // 7 - far left star
            { x: 140, y: 160 },  // 8 - large bottom star
            { x: 100, y: 180 },  // 9 - bottom left star
            { x: 80, y: 190 },   // 10 - far bottom left star
            { x: 90, y: 130 },   // 11 - small center star
            { x: 120, y: 140 }   // 12 - right of center star
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [1, 4], [4, 5],
            [5, 6], [6, 7], [5, 8], [8, 9], [9, 10],
            [5, 11], [11, 12], [4, 8]
        ]
    }
];

const constellationGroups = [
    makeConstellation(CONSTELLATIONS[0].points, CONSTELLATIONS[0].lines, canvas.width - 200, 100),
    makeConstellation(CONSTELLATIONS[1].points, CONSTELLATIONS[1].lines, -50, canvas.height - 250),
    makeConstellation(CONSTELLATIONS[2].points, CONSTELLATIONS[2].lines, 50, 200),
    makeConstellation(CONSTELLATIONS[3].points, CONSTELLATIONS[3].lines, 250, 200),
    makeConstellation(CONSTELLATIONS[4].points, CONSTELLATIONS[4].lines, 750, 400),
    makeConstellation(CONSTELLATIONS[5].points, CONSTELLATIONS[5].lines, canvas.width - 200, 400),
    makeConstellation(CONSTELLATIONS[6].points, CONSTELLATIONS[6].lines, canvas.width / 2, -50),
    makeConstellation(CONSTELLATIONS[7].points, CONSTELLATIONS[7].lines, 100, -80),
    makeConstellation(CONSTELLATIONS[6].points, CONSTELLATIONS[6].lines, canvas.width-200, canvas.height-125),
];

function drawConstellations() {
    ctx.save();
    ctx.lineWidth = 1;

    // Reduced parallax effect
    const offsetX = (mouseX / canvas.width - 0.5) * 10;
    const offsetY = (mouseY / canvas.height - 0.5) * 10;

    constellationGroups.forEach(group => {
        group.stars.forEach((star) => {
            const glitterRadius = 2 + Math.sin(Date.now() * star.glitterSpeed + star.glitterPhase) * 1;
            
            // Add shadow blur to constellation stars
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.arc(star.x + offsetX, star.y + offsetY, glitterRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            // Reset shadow for lines
            ctx.shadowBlur = 0;
        });

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        group.lines.forEach(([i, j]) => {
            const p1 = group.stars[i];
            const p2 = group.stars[j];
            ctx.moveTo(p1.x + offsetX, p1.y + offsetY);
            ctx.lineTo(p2.x + offsetX, p2.y + offsetY);
        });
        ctx.stroke();
    });

    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = "rgba(23, 23, 23, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawConstellations();
    
    // Parallax effect for shooting stars
    const parallaxOffsetX = (mouseX / canvas.width - 0.5) * 5;
    const parallaxOffsetY = (mouseY / canvas.height - 0.5) * 5;
    
    stars.forEach(star => {
        // Calculate display position with parallax for shooting stars
        const displayX = star.isShootingStar ? star.x + parallaxOffsetX : star.x;
        const displayY = star.isShootingStar ? star.y + parallaxOffsetY : star.y;
        
        // Draw shooting star trail with parallax
        if (star.isShootingStar && star.trail.length > 1) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            // Create gradient for trail with parallax
            for (let i = 0; i < star.trail.length - 1; i++) {
                const p1 = star.trail[i];
                const p2 = star.trail[i + 1];
                const alpha = (i / star.trail.length) * 0.8;
                
                ctx.beginPath();
                ctx.moveTo(p1.x + parallaxOffsetX, p1.y + parallaxOffsetY);
                ctx.lineTo(p2.x + parallaxOffsetX, p2.y + parallaxOffsetY);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = alpha * 3;
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw the star itself
        ctx.save();
        ctx.globalAlpha = star.alpha;
        const glitterRadius = star.r * (1 + Math.abs(Math.sin(Date.now() * star.glitterSpeed + star.glitterPhase)) * 0.3);
        
        // Add glow effect for shooting stars
        if (star.isShootingStar) {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 10;
        }
        
        ctx.beginPath();
        ctx.arc(displayX, displayY, glitterRadius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
    });
}

function updateStars() {
    stars.forEach(star => {
        // Update position
        star.x += star.speedX;
        star.y -= star.speedY;

        // Record trail for shooting stars
        if (star.isShootingStar) {
            star.trail.push({ x: star.x, y: star.y });
            if (star.trail.length > 15) { // Longer trail for shooting stars
                star.trail.shift();
            }
        }

        // Handle fade in
        if (star.fadeIn && star.alpha < 1) {
            star.alpha += 0.02;
        } else {
            star.alpha = 1;
            star.fadeIn = false;
        }

        // Reset star when it goes off screen
        if (star.x > canvas.width + 20 || star.y < -20 || star.x < -20 || star.y > canvas.height + 20) {
            const pos = randomStartPosition();
            star.x = pos.x;
            star.y = pos.y;
            
            // Reset speeds
            if (star.isShootingStar) {
                const angle = Math.PI * (0.2 + Math.random() * 0.1);
                const speed = 3 + Math.random() * 4;
                star.speedX = Math.cos(angle) * speed;
                star.speedY = Math.sin(angle) * speed;
            } else {
                star.speedX = 0.5 + Math.random() * 1;
                star.speedY = 0.5 + Math.random() * 1;
            }
            
            star.r = star.isShootingStar ? Math.random() * 1.5 + 1 : Math.random() * 1 + 0.5;
            star.alpha = 0;
            star.fadeIn = true;
            star.trail = []; // Clear trail when resetting
        }
    });
}

function animate() {
    updateStars();
    drawStars();
    anime({
        duration: 16,
        easing: 'linear',
        complete: animate
    });
}

canvas.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const offsetX = (e.clientX / canvas.width - 0.5) * 10;
  const offsetY = (e.clientY / canvas.height - 0.5) * 10;

  stars.forEach(star => {
    star.x += offsetX * 0.1;
    star.y += offsetY * 0.1;
  });

  // // Add parallax to content box
  // const contentOffsetX = (e.clientX / canvas.width - 0.5) * 10; // stronger effect if desired
  // const contentOffsetY = (e.clientY / canvas.height - 0.5) * 10;
  // contentBox.style.transform = `translate(-50%, -50%) translate(${contentOffsetX}px, ${contentOffsetY}px)`;
});

canvas.addEventListener('click', e => {
    for (let i = 0; i < 7; i++) {
        const angle = Math.random() * 0.5 * Math.PI;
        const speed = Math.random() * 0.5 + 0.5;
        const star = {
            x: e.clientX,
            y: e.clientY,
            r: Math.random() * 1 + 1,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            alpha: 0,
            fadeIn: true,
            isShootingStar: false,
            trail: [],
            glitterPhase: Math.random() * Math.PI * 2,
            glitterSpeed: 0.002 + Math.random() * 0.0005
        };
        stars.push(star);
    }
});

animate();
