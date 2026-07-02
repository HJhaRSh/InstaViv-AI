import React from 'react';
import { createRoot } from 'react-dom/client';
import AvatarApp from './src/avatar/AvatarApp.jsx';
import CoursesApp from './src/courses/CoursesApp.jsx';

// Sticky Navbar functionality
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Scroll Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }
    entry.target.classList.add('active');
    observer.unobserve(entry.target);
  });
}, revealOptions);

revealElements.forEach(el => {
  revealOnScroll.observe(el);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      // Adjust offset for sticky navbar
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Canvas Particle Network (Dual-Tone Plexus Effect)
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  
  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  // Helper to get hue based on X position (Orange on left, Cyan on right)
  function getHue(x) {
    // Orange is ~25, Cyan is ~180
    return (x / width) * 155 + 25; 
  }
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5; // Slow, flowing movement
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Wrap around edges for continuous flow
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse interaction: slight repulsion to keep it fluid
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
      }
    }
    draw() {
      const hue = getHue(this.x);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(, 100%, 45%, 0.8)`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsla(, 100%, 35%, 1)`;
      ctx.fill();
      ctx.shadowBlur = 0; 
    }
  }

  function initParticles() {
    particles = [];
    const numParticles = Math.min(Math.floor(window.innerWidth / 10), 150); // Dense network
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Fill deep black background slightly transparently for trailing effect? No, plain clear is better for sharp plexus.
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      // Draw lines between particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 130) {
          const midX = (particles[i].x + particles[j].x) / 2;
          const hue = getHue(midX);
          const opacity = 0.2 - dist/650;
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(, 100%, 45%, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      // Connect to mouse with intense glow
      if (mouse.x != null && mouse.y != null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const midX = (particles[i].x + mouse.x) / 2;
          const hue = getHue(midX);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `hsla(, 100%, 50%, ${0.3 - dist/600})`; 
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
  
  resize();
  initParticles();
  animate();
}

// 3D Avatar Speech - Replaced with React Application
const rootElement = document.getElementById('avatar-react-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AvatarApp />);
}

// Educational Courses React App
const coursesRootElement = document.getElementById('courses-react-root');
if (coursesRootElement) {
  const coursesRoot = createRoot(coursesRootElement);
  coursesRoot.render(<CoursesApp />);
}

// --- Dynamic Text & Counter Animations ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Typewriter Rotator
  const dynamicText = document.getElementById('dynamic-text');
  if (dynamicText) {
    const words = ["Future.", "Curriculum.", "Classrooms."];
    let wordIndex = 0;
    let charIndex = words[0].length;
    let isDeleting = true;
    
    function type() {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      // Allow string to be fully empty, we will use CSS to prevent height collapse
      dynamicText.textContent = currentWord.substring(0, charIndex);
      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2500; // Pause at end of word
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500; // Pause before typing new word
      }

      setTimeout(type, typeSpeed);
    }
    
    // Start after initial pause
    setTimeout(type, 2500);
  }

  // 2. Stat Counter Animation
  const statCounter = document.getElementById('stat-counter');
  if (statCounter) {
    let count = 0;
    const target = 100;
    const duration = 3500; // Slower so it's more visible
    const increment = target / (duration / 16);

    function updateCounter() {
      count += increment;
      if (count >= target) {
        statCounter.textContent = target;
      } else {
        statCounter.textContent = Math.floor(count);
        requestAnimationFrame(updateCounter);
      }
    }

    setTimeout(() => {
      requestAnimationFrame(updateCounter);
    }, 1200); // Delayed start so they see it happen
  }

  // 3. Cyber Scramble Effect for "Real"
  const realText = document.getElementById('stat-real');
  if (realText) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const originalText = "Real";
    
    function scrambleText(element, text) {
      let iterations = 0;
      const interval = setInterval(() => {
        element.innerText = text.split("").map((letter, index) => {
          if (index < iterations) {
            return text[index];
          }
          return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
        
        if (iterations >= text.length) {
          clearInterval(interval);
        }
        iterations += 1 / 3;
      }, 40);
    }

    // Scramble on load after a slight delay
    setTimeout(() => {
      scrambleText(realText, originalText);
    }, 1500);

    // Re-scramble on hover for interactivity
    realText.parentElement.addEventListener('mouseenter', () => {
      scrambleText(realText, originalText);
    });
  }
});
