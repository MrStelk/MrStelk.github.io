/**
 * Sidebar Canvas Animation
 * Creates animated background for Chirpy theme sidebar
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure all elements are properly loaded
  setTimeout(initSidebarCanvas, 100);
});

function initSidebarCanvas() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  // Remove existing canvas if it exists (for hot reloading)
  const existingContainer = document.getElementById('sidebar-canvas-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create canvas container
  const canvasContainer = document.createElement('div');
  canvasContainer.id = 'sidebar-canvas-container';
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
  canvas.id = 'sidebar-canvas';
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
  
  // Append canvas to container
  canvasContainer.appendChild(canvas);
  
  // Insert canvas container as first child (behind everything)
  sidebar.insertBefore(canvasContainer, sidebar.firstChild);
  
  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  
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
  
  // Enhanced Particle class
  class Particle {
    constructor() {
      this.reset();
      // Start with random position
      this.x = Math.random() * canvas.width / (window.devicePixelRatio || 1);
      this.y = Math.random() * canvas.height / (window.devicePixelRatio || 1);
    }
    
    reset() {
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around edges
      if (this.x > canvasWidth) this.x = 0;
      if (this.x < 0) this.x = canvasWidth;
      if (this.y > canvasHeight) this.y = 0;
      if (this.y < 0) this.y = canvasHeight;
      
      // Update pulse
      this.pulseOffset += this.pulseSpeed;
    }
    
    draw() {
      ctx.save();
      
      // Add subtle pulsing effect
      const pulseOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulseOffset));
      ctx.globalAlpha = pulseOpacity;
      
      // Use theme-appropriate colors
      const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add subtle glow effect
      ctx.shadowColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = this.size * 2;
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  // Initialize particles
  function initParticles() {
    particles = [];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    const particleCount = 100
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Draw connections between nearby particles
  function drawConnections() {
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    const connectionColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)';
    const maxDistance = 180;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          ctx.save();
          const opacity = (maxDistance - distance) / maxDistance * 0.15;
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
  
  // Animation loop
  function animate() {
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw connections first (behind particles)
    drawConnections();
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Start animation
  function startAnimation() {
    stopAnimation(); // Stop any existing animation
    resizeCanvas();
    initParticles();
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
  
  // Handle visibility change to pause animation when tab is not visible
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
        // Theme changed, no need to restart animation - colors will update automatically
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode']
  });
  
  // Initialize animation
  startAnimation();
  
  // Clean up function (useful for development)
  window.destroySidebarCanvas = () => {
    stopAnimation();
    observer.disconnect();
    if (canvasContainer && canvasContainer.parentNode) {
      canvasContainer.parentNode.removeChild(canvasContainer);
    }
  };
}