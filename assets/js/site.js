// Navigation scroll behavior
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                if(this.getAttribute('href') === '#') return;
                
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 85,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navLinks = document.querySelector('.nav-links');
                    if(navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        document.querySelector('.hamburger i').className = 'fas fa-bars';
                    }
                    
                    // Update active link
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
        
        // Header scroll effect
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if(window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Animate timeline items on scroll
            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                const itemPosition = item.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if(itemPosition < screenPosition) {
                    item.style.animationDelay = `${index * 0.2}s`;
                    item.classList.add('visible');
                }
            });
        });
        
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if(navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').className = 'fas fa-bars';
            });
        });

        function initHeroParticleNetwork() {
            const hero = document.querySelector('.hero');
            const canvas = hero ? hero.querySelector('.hero-particle-network') : null;
            if (!hero || !canvas) return;

            const context = canvas.getContext('2d');
            if (!context) return;

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            const particles = [];
            const pointer = {
                x: null,
                y: null,
                radius: 140
            };
            let animationFrameId = null;
            let particleCount = 0;
            let width = 0;
            let height = 0;
            let dpr = Math.min(window.devicePixelRatio || 1, 2);

            function syncTheme() {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                return {
                    dot: isLight ? 'rgba(37, 99, 235, 0.7)' : 'rgba(125, 211, 252, 0.75)',
                    line: isLight ? 'rgba(37, 99, 235, 0.18)' : 'rgba(56, 189, 248, 0.2)',
                    glow: isLight ? 'rgba(14, 165, 233, 0.08)' : 'rgba(14, 165, 233, 0.12)'
                };
            }

            function resizeCanvas() {
                const rect = hero.getBoundingClientRect();
                width = rect.width;
                height = rect.height;
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.scale(dpr, dpr);

                particleCount = Math.max(28, Math.min(70, Math.floor((width * height) / 22000)));
                particles.length = 0;

                for (let i = 0; i < particleCount; i += 1) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: (Math.random() - 0.5) * 0.45,
                        vy: (Math.random() - 0.5) * 0.45,
                        size: Math.random() * 1.8 + 1
                    });
                }
            }

            function draw() {
                const theme = syncTheme();
                context.clearRect(0, 0, width, height);

                const glow = context.createRadialGradient(width * 0.5, height * 0.35, 0, width * 0.5, height * 0.35, Math.max(width, height) * 0.55);
                glow.addColorStop(0, theme.glow);
                glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                context.fillStyle = glow;
                context.fillRect(0, 0, width, height);

                for (let i = 0; i < particles.length; i += 1) {
                    const particle = particles[i];

                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
                    if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

                    if (pointer.x !== null && pointer.y !== null) {
                        const dx = pointer.x - particle.x;
                        const dy = pointer.y - particle.y;
                        const distance = Math.hypot(dx, dy);

                        if (distance < pointer.radius && distance > 0) {
                            const force = (pointer.radius - distance) / pointer.radius;
                            particle.x -= (dx / distance) * force * 0.9;
                            particle.y -= (dy / distance) * force * 0.9;
                        }
                    }

                    context.beginPath();
                    context.fillStyle = theme.dot;
                    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    context.fill();

                    for (let j = i + 1; j < particles.length; j += 1) {
                        const other = particles[j];
                        const dx = particle.x - other.x;
                        const dy = particle.y - other.y;
                        const distance = Math.hypot(dx, dy);
                        const maxDistance = 130;

                        if (distance < maxDistance) {
                            context.beginPath();
                            context.strokeStyle = theme.line.replace(/[\d.]+\)$/u, `${((1 - distance / maxDistance) * 0.9).toFixed(3)})`);
                            context.lineWidth = 1;
                            context.moveTo(particle.x, particle.y);
                            context.lineTo(other.x, other.y);
                            context.stroke();
                        }
                    }
                }

                animationFrameId = window.requestAnimationFrame(draw);
            }

            function start() {
                if (animationFrameId || prefersReducedMotion.matches) return;
                draw();
            }

            function stop() {
                if (!animationFrameId) return;
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                context.clearRect(0, 0, width, height);
            }

            hero.addEventListener('pointermove', (event) => {
                const rect = hero.getBoundingClientRect();
                pointer.x = event.clientX - rect.left;
                pointer.y = event.clientY - rect.top;
            });

            hero.addEventListener('pointerleave', () => {
                pointer.x = null;
                pointer.y = null;
            });

            window.addEventListener('resize', resizeCanvas);
            prefersReducedMotion.addEventListener('change', () => {
                if (prefersReducedMotion.matches) {
                    stop();
                    return;
                }
                resizeCanvas();
                start();
            });

            resizeCanvas();
            start();
        }
        
        // Form submission handling
        const contactForm = document.getElementById('contactForm');
        if(contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                
                // Show success message
                alert(`Thank you for your message, ${name}! I will get back to you soon.`);
                
                // Reset form
                contactForm.reset();
                
                // Scroll to top smoothly
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // Initialize animations on page load
        document.addEventListener('DOMContentLoaded', () => {
            // Set initial active link
            document.querySelector('.nav-links a[href="#home"]').classList.add('active');

            initHeroParticleNetwork();
            
            // Animate hero elements with staggered delay
            const heroElements = document.querySelectorAll('.hero-content > *:not(.hero-badge)');
            heroElements.forEach((el, index) => {
                if(el.classList.contains('btn-container') || el.classList.contains('hero-stats')) return;
                
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'opacity 0.6s ease-out, transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 400 + (index * 200));
            });
            
            // Check initial scroll position for header
            if(window.scrollY > 100) {
                document.querySelector('header').classList.add('scrolled');
            }
        });
        
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference or default to dark mode
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        }
        
        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeIcon.className = 'fas fa-moon';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.className = 'fas fa-sun';
            }
        });

window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZL8RKM6PS9');
