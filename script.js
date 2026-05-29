/* ========================================
   PARTICLES BACKGROUND ANIMATION
   ======================================== */
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.4 + 0.1,
            pulse: Math.random() * Math.PI * 2,
        };
    }

    function initParticleArray() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
        particles = Array.from({ length: count }, createParticle);
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.01;

            // Wrap around edges
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const dynamicOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(148, 130, 240, ${dynamicOpacity})`;
            ctx.fill();
        });

        // Draw faint connection lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(drawParticles);
    }

    resize();
    initParticleArray();
    drawParticles();

    window.addEventListener('resize', () => {
        resize();
        initParticleArray();
    });

    // Pause particles when tab is hidden for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            drawParticles();
        }
    });
})();


/* ========================================
   FORM VALIDATION & INTERACTIONS
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('application-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const newAppBtn = document.getElementById('new-application-btn');
    const charCounter = document.getElementById('char-counter');

    const fields = {
        name: {
            input: document.getElementById('name-input'),
            error: document.getElementById('name-error'),
            group: document.getElementById('name-group'),
        },
        email: {
            input: document.getElementById('email-input'),
            error: document.getElementById('email-error'),
            group: document.getElementById('email-group'),
        },
        phone: {
            input: document.getElementById('phone-input'),
            error: document.getElementById('phone-error'),
            group: document.getElementById('phone-group'),
        },
        message: {
            input: document.getElementById('message-input'),
            error: document.getElementById('message-error'),
            group: document.getElementById('message-group'),
        },
    };

    const MAX_MESSAGE_LENGTH = 500;

    // --- Validation Regex Patterns ---
    const patterns = {
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
        phone: /^[\d\s().+-]{7,20}$/,
    };

    // --- Validation Rules ---
    const validators = {
        name(value) {
            if (!value.trim()) return 'Please enter your full name.';
            if (value.trim().length < 2) return 'Name must be at least 2 characters.';
            return '';
        },
        email(value) {
            if (!value.trim()) return 'Please enter your email address.';
            if (!patterns.email.test(value.trim())) return 'Please enter a valid email address.';
            return '';
        },
        phone(value) {
            if (!value.trim()) return 'Please enter your phone number.';
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7) return 'Phone number must have at least 7 digits.';
            if (!patterns.phone.test(value.trim())) return 'Please enter a valid phone number.';
            return '';
        },
        message(value) {
            if (!value.trim()) return 'Please enter a message.';
            if (value.trim().length < 10) return 'Message must be at least 10 characters.';
            if (value.length > MAX_MESSAGE_LENGTH) return `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
            return '';
        },
    };


    // --- State Helpers ---
    function setFieldState(fieldName, state, message = '') {
        const field = fields[fieldName];
        field.group.classList.remove('error', 'valid');

        if (state === 'error') {
            field.group.classList.add('error');
            field.error.textContent = message;
        } else if (state === 'valid') {
            field.group.classList.add('valid');
            field.error.textContent = '';
        } else {
            field.error.textContent = '';
        }
    }

    function validateField(fieldName) {
        const value = fields[fieldName].input.value;
        const error = validators[fieldName](value);

        if (error) {
            setFieldState(fieldName, 'error', error);
            return false;
        }

        setFieldState(fieldName, 'valid');
        return true;
    }

    function validateAll() {
        let isValid = true;

        Object.keys(fields).forEach((key) => {
            if (!validateField(key)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function resetForm() {
        form.reset();
        Object.keys(fields).forEach((key) => setFieldState(key, 'neutral'));
        updateCharCounter();
    }


    // --- Character Counter ---
    function updateCharCounter() {
        const len = fields.message.input.value.length;
        charCounter.textContent = `${len} / ${MAX_MESSAGE_LENGTH}`;
        charCounter.classList.remove('warning', 'danger');

        if (len > MAX_MESSAGE_LENGTH) {
            charCounter.classList.add('danger');
        } else if (len > MAX_MESSAGE_LENGTH * 0.85) {
            charCounter.classList.add('warning');
        }
    }


    // --- Event Listeners ---

    // Real-time validation on blur
    Object.keys(fields).forEach((key) => {
        const input = fields[key].input;

        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                validateField(key);
            }
        });

        // Clear error while typing (if currently in error state)
        input.addEventListener('input', () => {
            if (fields[key].group.classList.contains('error')) {
                const error = validators[key](input.value);
                if (!error) {
                    setFieldState(key, 'valid');
                }
            }
        });
    });

    // Textarea character counter
    fields.message.input.addEventListener('input', updateCharCounter);

    // Button ripple effect
    submitBtn.addEventListener('click', function (e) {
        const ripple = this.querySelector('.btn-ripple');
        const rect = this.getBoundingClientRect();

        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 0.5}px`;

        ripple.classList.remove('active');
        // Force reflow
        void ripple.offsetWidth;
        ripple.classList.add('active');
    });


    // --- Form Submission ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateAll()) {
            // Scroll to the first error field
            const firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Simulate submission with loading state
        submitBtn.classList.add('loading');

        setTimeout(() => {
            submitBtn.classList.remove('loading');

            // Hide form, show success
            form.style.display = 'none';
            successMessage.classList.add('show');

            // Trigger confetti
            launchConfetti();
        }, 1500);
    });


    // --- New Application Button ---
    newAppBtn.addEventListener('click', () => {
        successMessage.classList.remove('show');
        successMessage.style.display = 'none';
        form.style.display = 'block';
        resetForm();

        // Re-trigger entry animations
        form.querySelectorAll('.form-group').forEach((group, i) => {
            group.style.animation = 'none';
            void group.offsetWidth;
            group.style.animation = `fieldSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * (i + 1)}s both`;
        });

        submitBtn.style.animation = 'none';
        void submitBtn.offsetWidth;
        submitBtn.style.animation = 'fieldSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both';
    });


    // --- Confetti Animation ---
    function launchConfetti() {
        const container = document.querySelector('.form-card');
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#f59e0b'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                top: 50%;
                left: 50%;
                z-index: 100;
                pointer-events: none;
                opacity: 1;
            `;

            container.appendChild(confetti);

            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = Math.random() * 200 + 100;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;
            const rotation = Math.random() * 720 - 360;

            confetti.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
                    opacity: 1,
                },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(${rotation}deg)`,
                    opacity: 0,
                },
            ], {
                duration: Math.random() * 800 + 600,
                easing: 'cubic-bezier(0, 0.9, 0.57, 1)',
                fill: 'forwards',
            }).onfinish = () => confetti.remove();
        }
    }


    // Initialize counter
    updateCharCounter();
});
