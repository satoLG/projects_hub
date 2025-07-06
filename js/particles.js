// Matter.js Physics-based Interactive Particle System
class PhysicsParticles {
    constructor() {
        this.engine = null;
        this.world = null;
        this.render = null;
        this.runner = null;
        this.particles = [];
        this.mouse = null;
        this.mouseConstraint = null;
        this.canvas = null;
        this.isDark = document.body.classList.contains('dark');
        this.resizeTimeout = null; // Add debounce for resize
        
        this.init();
    }

    async init() {
        // Load Matter.js from CDN
        await this.loadMatterJS();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'auto'; // Enable mouse immediately
        this.canvas.style.zIndex = '0';
        this.canvas.style.opacity = '0.8';
        this.canvas.style.filter = 'blur(1px)';

        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.setupPhysics();
        this.createParticles();
        this.startPhysics();
        this.setupEventListeners();
    }

    loadMatterJS() {
        return new Promise((resolve, reject) => {
            if (window.Matter) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupPhysics() {
        const { Engine, World, Render, Runner, Mouse, MouseConstraint, Bodies, Body, Events } = Matter;
        
        // Create engine
        this.engine = Engine.create();
        this.world = this.engine.world;
        
        // COMPLETELY DISABLE ALL PHYSICS
        this.engine.world.gravity.y = 0;
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.scale = 0;
        this.engine.enableSleeping = false;
        this.engine.constraintIterations = 0;
        this.engine.positionIterations = 0;
        this.engine.velocityIterations = 0;
        
        // Create renderer
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent',
                showAngleIndicator: false,
                showVelocity: false,
                showDebug: false,
                pixelRatio: 1,
                enableSleeping: false
            }
        });
        
        // Ensure canvas takes full viewport
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create mouse control for interaction tracking
        this.mouse = Mouse.create(this.canvas);
        this.mouse.element.removeEventListener("mousewheel", this.mouse.mousewheel);
        this.mouse.element.removeEventListener("DOMMouseScroll", this.mouse.mousewheel);
        
        // Initialize mouse position to off-screen
        this.mouse.position.x = -1000;
        this.mouse.position.y = -1000;
        
        // MANUAL UPDATE LOOP - bypass Matter.js physics completely
        Events.on(this.engine, 'beforeUpdate', () => {
            this.manualParticleUpdate();
        });
    }

    createParticles() {
        const { Bodies, World, Body } = Matter;
        const particleCount = Math.max(700, Math.floor((window.innerWidth * window.innerHeight) / 1500)); // 10x more particles
        
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const radius = Math.random() * 1.1;
            
            // Create STATIC bodies that we'll move manually
            const particle = Bodies.circle(x, y, radius, {
                isStatic: true, // STATIC - no physics applied
                render: {
                    fillStyle: this.getParticleColor(),
                    strokeStyle: this.getGlowColor(),
                    lineWidth: radius * 2,
                }
            });
            
            // Add custom properties for manual floating behavior
            particle.isParticle = true;
            particle.baseX = x; // Remember home position
            particle.baseY = y;
            particle.currentX = x; // Current actual position
            particle.currentY = y;
            particle.velocityX = 0; // Add velocity for smooth movement
            particle.velocityY = 0;
            particle.glowRadius = radius * 3;
            particle.baseRadius = radius;
            particle.twinklePhase = Math.random() * Math.PI * 2;
            particle.floatOffsetX = Math.random() * Math.PI * 2;
            particle.floatOffsetY = Math.random() * Math.PI * 2;
            particle.floatSpeedX = Math.random() * 0.5 + 0.3;
            particle.floatSpeedY = Math.random() * 0.5 + 0.3;
            particle.floatRadius = 30 + Math.random() * 40; // How far from base to float
            
            this.particles.push(particle);
        }
        
        World.add(this.world, this.particles);
    }

    manualParticleUpdate() {
        const { Body } = Matter;
        const time = Date.now() * 0.001; // Slow time factor
        
        this.particles.forEach((particle, index) => {
            // Calculate ideal floating position (where particle wants to be naturally)
            const idealX = particle.baseX + Math.sin(time * particle.floatSpeedX + particle.floatOffsetX) * particle.floatRadius;
            const idealY = particle.baseY + Math.cos(time * particle.floatSpeedY + particle.floatOffsetY) * particle.floatRadius;
            
            // Get current position
            let currentX = particle.currentX;
            let currentY = particle.currentY;
            
            // Mouse repulsion - apply gentle force
            const mousePos = this.mouse.position;
            const dx = currentX - mousePos.x;
            const dy = currentY - mousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const repulsionRadius = 50;
            
            // Apply mouse repulsion force to velocity
            if (distance < repulsionRadius && distance > 0) {
                const force = (repulsionRadius - distance) / repulsionRadius;
                const repelForce = force * 200; // Much gentler force
                const repelX = (dx / distance) * repelForce;
                const repelY = (dy / distance) * repelForce;
                
                particle.velocityX += repelX;
                particle.velocityY += repelY;
            }
            
            // Apply gentle pull toward ideal floating position
            const pullStrength = 0.015; // Gentle pull back to floating pattern
            const pullX = (idealX - currentX) * pullStrength;
            const pullY = (idealY - currentY) * pullStrength;
            
            particle.velocityX += pullX;
            particle.velocityY += pullY;
            
            // Apply damping to velocity for smooth movement
            particle.velocityX *= 0.15;
            particle.velocityY *= 0.15;
            
            // Limit velocity to prevent too fast movement
            const maxVelocity = 2;
            const velocityMagnitude = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);
            if (velocityMagnitude > maxVelocity) {
                particle.velocityX = (particle.velocityX / velocityMagnitude) * maxVelocity;
                particle.velocityY = (particle.velocityY / velocityMagnitude) * maxVelocity;
            }
            
            // Update position with velocity
            currentX += particle.velocityX;
            currentY += particle.velocityY;
            
            // Keep particles in bounds with gentle forces - use actual viewport dimensions
            const margin = 10; // Reduced margin for edge coverage
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            if (currentX < margin) {
                currentX = margin;
                particle.velocityX = Math.abs(particle.velocityX) * 0.5;
            }
            if (currentX > viewportWidth - margin) {
                currentX = viewportWidth - margin;
                particle.velocityX = -Math.abs(particle.velocityX) * 0.5;
            }
            if (currentY < margin) {
                currentY = margin;
                particle.velocityY = Math.abs(particle.velocityY) * 0.5;
            }
            if (currentY > viewportHeight - margin) {
                currentY = viewportHeight - margin;
                particle.velocityY = -Math.abs(particle.velocityY) * 0.5;
            }
            
            // Store current position
            particle.currentX = currentX;
            particle.currentY = currentY;
            
            // Update Matter.js body position
            Body.setPosition(particle, { x: currentX, y: currentY });
            
            // Update twinkle effect
            particle.twinklePhase += 0.008;
            const twinkle = (Math.sin(particle.twinklePhase) + 1) * 0.5;
            const currentLineWidth = particle.baseRadius * (1 + twinkle * 0.4);
            
            // Update render properties for twinkling
            particle.render.lineWidth = currentLineWidth;
        });
    }

    getParticleColor() {
        return this.isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 0, 0.8)'; // Steel blue for light mode
    }

    getGlowColor() {
        return this.isDark ? 'rgba(200, 220, 255, 0.4)' : 'rgba(246, 255, 0, 0.4)'; // Darker blue glow for light mode
    }

    updateTheme() {
        this.particles.forEach(particle => {
            particle.render.fillStyle = this.getParticleColor();
            particle.render.strokeStyle = this.getGlowColor();
        });
    }

    startPhysics() {
        const { Render, Runner } = Matter;
        
        // Start the renderer
        Render.run(this.render);
        
        // Create runner
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
    }

    setupEventListeners() {
        if (!this.canvas) {
            console.error('Canvas not created yet');
            return;
        }
        
        window.addEventListener('resize', () => {
            // Debounce resize events to prevent excessive particle spawning
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.handleResize(), 150);
        });
        
        // Also listen for orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 200); // Slight delay for orientation change
        });
        
        // Track mouse movement for repulsion - use both canvas and window events
        const updateMousePosition = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.position.x = e.clientX - rect.left;
            this.mouse.position.y = e.clientY - rect.top;
            
            // Debug: Log mouse position occasionally
            if (Math.random() < 0.01) {
                console.log('Mouse:', this.mouse.position.x, this.mouse.position.y);
            }
        };
        
        // Add mouse tracking to both canvas and window
        this.canvas.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mousemove', updateMousePosition);
        
        // Reset mouse position when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.position.x = -1000;
            this.mouse.position.y = -1000;
        });
        
        // Reset mouse when leaving window
        window.addEventListener('mouseleave', () => {
            this.mouse.position.x = -1000;
            this.mouse.position.y = -1000;
        });
        
        // Listen for theme changes
        const observer = new MutationObserver(() => {
            const newIsDark = document.body.classList.contains('dark');
            if (newIsDark !== this.isDark) {
                this.isDark = newIsDark;
                this.updateTheme();
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    handleResize() {
        if (this.render) {
            // Update canvas to full viewport dimensions
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            
            // Update canvas element dimensions
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            this.canvas.style.width = newWidth + 'px';
            this.canvas.style.height = newHeight + 'px';
            
            // Update Matter.js render dimensions
            this.render.canvas.width = newWidth;
            this.render.canvas.height = newHeight;
            this.render.options.width = newWidth;
            this.render.options.height = newHeight;
            
            // Update mouse
            if (this.mouse && window.Matter) {
                const { Mouse } = Matter;
                Mouse.setScale(this.mouse, { x: 1, y: 1 });
                Mouse.setOffset(this.mouse, { x: 0, y: 0 });
            }
            
            // Update particle base positions if they're off screen and add new particles if needed
            this.particles.forEach(particle => {
                if (particle.baseX > newWidth) {
                    particle.baseX = Math.random() * newWidth;
                }
                if (particle.baseY > newHeight) {
                    particle.baseY = Math.random() * newHeight;
                }
            });
            
            // Add more particles if window got bigger (but only occasionally)
            const targetCount = Math.min(600, Math.floor((newWidth * newHeight) / 1500));
            const currentCount = this.particles.length;
            if (Math.abs(targetCount - currentCount) > 20) { // Only adjust if significant difference
                this.adjustParticleCount();
            }
        }
    }

    adjustParticleCount() {
        const { Bodies, World } = Matter;
        const targetCount = Math.min(600, Math.floor((window.innerWidth * window.innerHeight) / 1500));
        const currentCount = this.particles.length;
        
        if (targetCount > currentCount) {
            // Add more particles only if significantly more are needed
            const particlesToAdd = Math.min(targetCount - currentCount, 50); // Limit additions per resize
            for (let i = 0; i < particlesToAdd; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const radius = Math.random() * 2 + 1;
                
                const particle = Bodies.circle(x, y, radius, {
                    isStatic: true,
                    render: {
                        fillStyle: this.getParticleColor(),
                        strokeStyle: this.getGlowColor(),
                        lineWidth: radius * 2,
                    }
                });
                
                // Add custom properties
                particle.isParticle = true;
                particle.baseX = x;
                particle.baseY = y;
                particle.currentX = x;
                particle.currentY = y;
                particle.velocityX = 0;
                particle.velocityY = 0;
                particle.glowRadius = radius * 3;
                particle.baseRadius = radius;
                particle.twinklePhase = Math.random() * Math.PI * 2;
                particle.floatOffsetX = Math.random() * Math.PI * 2;
                particle.floatOffsetY = Math.random() * Math.PI * 2;
                particle.floatSpeedX = Math.random() * 0.5 + 0.3;
                particle.floatSpeedY = Math.random() * 0.5 + 0.3;
                particle.floatRadius = 30 + Math.random() * 40;
                
                this.particles.push(particle);
                World.add(this.world, particle);
            }
        } else if (targetCount < currentCount) {
            // Remove excess particles if window got much smaller
            const particlesToRemove = currentCount - targetCount;
            for (let i = 0; i < particlesToRemove; i++) {
                const particle = this.particles.pop();
                if (particle) {
                    World.remove(this.world, particle);
                }
            }
        }
    }

    destroy() {
        if (this.runner) {
            Runner.stop(this.runner);
        }
        if (this.render) {
            Render.stop(this.render);
        }
        if (this.engine) {
            Engine.clear(this.engine);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.physicsParticles = new PhysicsParticles();
});
