// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Typing effect
const text = "Full Stack Developer";
let i = 0;
const typeWriter = () => {
    if (i < text.length) {
        document.querySelector('.hero-subtitle').textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
};

// Theme toggle with persistence
const THEME_KEY = 'portfolio-theme';
const rootEl = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');

function applyTheme(theme) {
    if (theme === 'dark') {
        rootEl.classList.add('dark');
        if (themeToggleBtn) themeToggleBtn.checked = true;
    } else {
        rootEl.classList.remove('dark');
        if (themeToggleBtn) themeToggleBtn.checked = false;
    }
}

const preferred = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(preferred);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('change', () => {
        const next = rootEl.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    });
}

// Simple 3D orb using Canvas (metaball-like gradient)
const orbCanvas = document.getElementById('hero-orb');
if (orbCanvas) {
    const ctx = orbCanvas.getContext('2d');
    let width, height, dpr;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = orbCanvas.clientWidth;
        height = orbCanvas.clientHeight;
        orbCanvas.width = Math.floor(width * dpr);
        orbCanvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);
    }

    const balls = Array.from({
        length: 6
    }).map(() => ({
        x: Math.random() * 0.6 + 0.2,
        y: Math.random() * 0.6 + 0.2,
        r: Math.random() * 120 + 80,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: Math.random() * 360
    }));

    let mouseX = 0.5,
        mouseY = 0.5;
    window.addEventListener('mousemove', (e) => {
        const rect = orbCanvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
    });

    function step() {
        ctx.clearRect(0, 0, width, height);
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(255,107,107,0.35)');
        gradient.addColorStop(1, 'rgba(78,205,196,0.35)');
        ctx.fillStyle = gradient;

        balls.forEach(b => {
            b.x += b.vx * 0.6 * (mouseX - 0.5);
            b.y += b.vy * 0.6 * (mouseY - 0.5);
            if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
            if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;
            const cx = b.x * width;
            const cy = b.y * height;
            const radius = b.r * (rootEl.classList.contains('dark') ? 1.1 : 1.0);
            const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            radial.addColorStop(0, `hsla(${b.hue}, 80%, 60%, 0.7)`);
            radial.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
            ctx.fillStyle = radial;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(step);
}

// Card tilt interaction
const cards = document.querySelectorAll('.project-card');
cards.forEach(card => {
    const damp = 15;
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * damp;
        const ry = (x - 0.5) * damp;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    });
});

window.addEventListener('load', () => {
    typeWriter();
});

// Scroll reveal using IntersectionObserver
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });
    revealEls.forEach(el => observer.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('is-visible'));
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Contact form: handle form submission with FormSubmit
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('cf-name').value.trim();
        const email = document.getElementById('cf-email').value.trim();
        const message = document.getElementById('cf-message').value.trim();
        
        // Validate email format
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address (e.g., example@gmail.com)');
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Submit form to FormSubmit
        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm)
        })
        .then(response => {
            if (response.ok) {
                // Show success message below form
                document.getElementById('success-message').style.display = 'block';
                
                // Reset form fields
                contactForm.reset();
                
                // Scroll to success message
                document.getElementById('success-message').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again.');
            
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Sidebar minimize on scroll
const sidebar = document.getElementById('sidebar');
let lastY = window.scrollY;
if (sidebar) {
    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastY && currentY > 120;
        sidebar.classList.toggle('minimized', scrollingDown);
        lastY = currentY;
    });
}