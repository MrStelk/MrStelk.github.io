/**
 * Sidebar Canvas Animation
 * Creates animated background for Chirpy theme sidebar
 */

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('sidebar-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let animationId;
  
  // Set canvas size
  function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }
  
  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around edges
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      // Use theme-appropriate colors
      const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Create particles
  const particles = [];
  const particleCount = 30; // Reduced for better performance
  
  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections between nearby particles
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    const connectionColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)';
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 60) {
          ctx.save();
          ctx.globalAlpha = (60 - distance) / 60 * 0.2;
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Start animation
  function startAnimation() {
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
  
  // Handle resize
  window.addEventListener('resize', () => {
    stopAnimation();
    startAnimation();
  });
  
  // Handle visibility change to pause animation when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
  
  // Initialize
  startAnimation();
});