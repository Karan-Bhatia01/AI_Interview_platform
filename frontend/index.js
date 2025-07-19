// DOM Elements
const startPracticeBtn = document.getElementById('startPractice');
const navLinks = document.querySelectorAll('.nav-link');
const heroActions = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Interactive button effects
startPracticeBtn.addEventListener('click', () => {
    // Add click animation
    startPracticeBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        startPracticeBtn.style.transform = 'translateY(-3px)';
    }, 150);

    // Show notification
    showNotification('🚀 Starting your AI interview practice session!');

    // Redirect to practice.html after delay
    setTimeout(() => {
        window.location.href = 'practice.html'; // Adjust path if needed
    }, 1000);
});

// Hero action buttons
heroActions.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.textContent.includes('Watch Demo')) {
            e.preventDefault();
            showNotification('🎥 Demo video coming soon!');
        }
    });
});

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        fontWeight: '500',
        fontSize: '0.9rem'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Parallax effect
function initParallax() {
    const cards = document.querySelectorAll('.floating-card');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        cards.forEach((card, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;

            card.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.floating-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');

    progressBars.forEach(bar => {
        const width = bar.style.width || bar.getAttribute('data-width') || '85%';
        bar.style.width = '0%';

        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// Star ratings
function animateStarRatings() {
    const stars = document.querySelectorAll('.star.active');

    stars.forEach((star, index) => {
        star.style.opacity = '0';
        star.style.transform = 'scale(0)';

        setTimeout(() => {
            star.style.opacity = '1';
            star.style.transform = 'scale(1)';
            star.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, index * 100 + 1000);
    });
}

// Animated counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = counter.textContent;
        const numericValue = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/\d/g, '');

        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    });
}

// Init all features
document.addEventListener('DOMContentLoaded', () => {
    initParallax();
    initScrollAnimations();

    setTimeout(() => {
        animateProgressBars();
        animateStarRatings();
        animateCounters();
    }, 1500);
});

// Hover effects
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('floating-card')) {
        e.target.style.transform += ' scale(1.05)';
        e.target.style.transition = 'transform 0.3s ease';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('floating-card')) {
        e.target.style.transform = e.target.style.transform.replace(' scale(1.05)', '');
    }
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('btn-hero-primary') || 
            e.target.classList.contains('btn-hero-secondary')) {
            e.target.click();
        }
    }
});

// Fade-in on load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
