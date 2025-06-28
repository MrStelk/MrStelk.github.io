/**
 * Star Canvas Animation
 * Creates animated star background with constellations
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure all elements are properly loaded
  setTimeout(initStarCanvas, 100);
});

function initStarCanvas() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  // Remove existing canvas if it exists (for hot reloading)
  const existingContainer = document.getElementById('star-canvas-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create canvas container
  const canvasContainer = document.createElement('div');
  canvasContainer.id = 'star-canvas-container';
  canvasContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
  `;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'star-canvas';
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
  
  // Append canvas to container
  canvasContainer.appendChild(canvas);
  
  // Insert canvas container as first child (behind everything)
  sidebar.insertBefore(canvasContainer, sidebar.firstChild);
  
  const ctx = canvas.getContext('2d');
  let animationId;
  let stars = [];
  let constellationGroups = [];
  let mouseX = 0, mouseY = 0;
  
  // Set canvas size
  function resizeCanvas() {
    const rect = canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);
  }
  
  // Random start position for stars
  function randomStartPosition() {
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: Math.random() * canvasWidth, y: -10 };
      case 1: return { x: canvasWidth + 10, y: Math.random() * canvasHeight };
      case 2: return { x: Math.random() * canvasWidth, y: canvasHeight + 10 };
      case 3: return { x: -10, y: Math.random() * canvasHeight };
    }
  }
  
  // Initialize stars
  function initStars() {
    stars = [];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const numStars = 75; // Reduced for sidebar
    
    for (let i = 0; i < numStars; i++) {
      const isShootingStar = Math.random() < 0.05; // Even fewer shooting stars for sidebar
      let speedX = 0.3 + Math.random() * 0.3;
      let speedY = 0.3 + Math.random() * 0.3;

      if (isShootingStar) {
        const angle = Math.PI * (0.2 + Math.random() * 0.1);
        const speed = 2 + Math.random() * 2; // Slower for sidebar
        speedX = Math.cos(angle) * speed;
        speedY = Math.sin(angle) * speed;
      }

      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        r: isShootingStar ? Math.random() * 1 + 0.5 : Math.random() * 0.8 + 0.3,
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
  }
  
  // Constellation definitions (simplified for sidebar)
  const CONSTELLATIONS = [
    {
      name: "MiniUrsa",
      points: [
        { x: 20, y: 20 },
        { x: 35, y: 30 },
        { x: 50, y: 25 },
        { x: 65, y: 35 },
        { x: 50, y: 50 },
        { x: 35, y: 45 },
        { x: 25, y: 40 }
      ],
      lines: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]
      ]
    },
    {
      name: "MiniOrion",
      points: [
        { x: 30, y: 15 },
        { x: 45, y: 25 },
        { x: 30, y: 50 },
        { x: 60, y: 45 },
        { x: 45, y: 65 }
      ],
      lines: [
        [0, 2], [1, 2], [2, 4], [2, 3], [3, 4]
      ]
    }
  ];
  
  // Create constellation
  function makeConstellation(points, lines, xOffset, yOffset) {
    const transformed = points.map(p => ({
      x: p.x + xOffset,
      y: p.y + yOffset,
      glitterPhase: Math.random() * Math.PI * 2,
      glitterSpeed: 0.002 + Math.random() * 0.00002
    }));
    return { stars: transformed, lines: lines };
  }
  
  // Generate constellation groups
  function generateConstellationGroups() {
    constellationGroups = [];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Only show constellations if sidebar is big enough
    if (canvasWidth > 200 && canvasHeight > 300) {
      constellationGroups.push(
        makeConstellation(CONSTELLATIONS[0].points, CONSTELLATIONS[0].lines, 50, 100)
      );
    }
    
    if (canvasHeight > 500) {
      constellationGroups.push(
        makeConstellation(CONSTELLATIONS[1].points, CONSTELLATIONS[1].lines, 80, canvasHeight - 150)
      );
    }
  }
  
  // Draw constellations
  function drawConstellations() {
    ctx.save();
    ctx.lineWidth = 1;
    
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    const constellationColor = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    
    // Subtle parallax effect
    const offsetX = (mouseX / (canvas.width / (window.devicePixelRatio || 1)) - 0.5) * 3;
    const offsetY = (mouseY / (canvas.height / (window.devicePixelRatio || 1)) - 0.5) * 3;

    constellationGroups.forEach(group => {
      group.stars.forEach((star) => {
        const glitterRadius = 1.5 + Math.sin(Date.now() * star.glitterSpeed + star.glitterPhase) * 0.5;
        
        ctx.shadowColor = constellationColor;
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y + offsetY, glitterRadius, 0, Math.PI * 2);
        ctx.fillStyle = constellationColor;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)';
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
  
  // Draw stars
  function drawStars() {
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    
    // Clear canvas completely - no dark overlay
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawConstellations();
    
    // Subtle parallax effect for shooting stars
    const parallaxOffsetX = (mouseX / canvasWidth - 0.5) * 2;
    const parallaxOffsetY = (mouseY / canvasHeight - 0.5) * 2;
    
    const starColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)';
    
    stars.forEach(star => {
      const displayX = star.isShootingStar ? star.x + parallaxOffsetX : star.x;
      const displayY = star.isShootingStar ? star.y + parallaxOffsetY : star.y;
      
      // Draw shooting star trail
      if (star.isShootingStar && star.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = starColor;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < star.trail.length - 1; i++) {
          const p1 = star.trail[i];
          const p2 = star.trail[i + 1];
          const alpha = (i / star.trail.length) * 0.6;
          
          ctx.beginPath();
          ctx.moveTo(p1.x + parallaxOffsetX, p1.y + parallaxOffsetY);
          ctx.lineTo(p2.x + parallaxOffsetX, p2.y + parallaxOffsetY);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = alpha * 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw the star
      ctx.save();
      ctx.globalAlpha = star.alpha;
      const glitterRadius = star.r * (1 + Math.abs(Math.sin(Date.now() * star.glitterSpeed + star.glitterPhase)) * 0.2);
      
      if (star.isShootingStar) {
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 6;
      }
      
      ctx.beginPath();
      ctx.arc(displayX, displayY, glitterRadius, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.fill();
      ctx.restore();
    });
  }
  
  // Update stars
  function updateStars() {
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    stars.forEach(star => {
      star.x += star.speedX;
      star.y -= star.speedY;

      if (star.isShootingStar) {
        star.trail.push({ x: star.x, y: star.y });
        if (star.trail.length > 8) { // Shorter trail for sidebar
          star.trail.shift();
        }
      }

      if (star.fadeIn && star.alpha < 1) {
        star.alpha += 0.02;
      } else {
        star.alpha = 1;
        star.fadeIn = false;
      }

      // Reset star when it goes off screen
      if (star.x > canvasWidth + 20 || star.y < -20 || star.x < -20 || star.y > canvasHeight + 20) {
        const pos = randomStartPosition();
        star.x = pos.x;
        star.y = pos.y;
        
        if (star.isShootingStar) {
          const angle = Math.PI * (0.2 + Math.random() * 0.1);
          const speed = 2 + Math.random() * 2;
          star.speedX = Math.cos(angle) * speed;
          star.speedY = Math.sin(angle) * speed;
        } else {
          star.speedX = 0.3 + Math.random() * 0.3;
          star.speedY = 0.3 + Math.random() * 0.3;
        }
        
        star.r = star.isShootingStar ? Math.random() * 1 + 0.5 : Math.random() * 0.8 + 0.3;
        star.alpha = 0;
        star.fadeIn = true;
        star.trail = [];
      }
    });
  }
  
  // Animation loop
  function animate() {
    updateStars();
    drawStars();
    animationId = requestAnimationFrame(animate);
  }
  
  // Start animation
  function startAnimation() {
    stopAnimation();
    resizeCanvas();
    initStars();
    generateConstellationGroups();
    animate();
  }
  
  // Stop animation
  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
  
  // Handle resize with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      startAnimation();
    }, 250);
  });
  
  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
  
  // Handle theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-mode') {
        // Theme changed, colors will update automatically
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode']
  });
  
  // Initialize animation
  startAnimation();
  
  // Clean up function
  window.destroyStarCanvas = () => {
    stopAnimation();
    observer.disconnect();
    if (canvasContainer && canvasContainer.parentNode) {
      canvasContainer.parentNode.removeChild(canvasContainer);
    }
  };
}