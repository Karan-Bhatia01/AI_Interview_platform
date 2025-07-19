// DOM Elements
const form = document.getElementById('practiceForm');
const submitBtn = document.getElementById('submitBtn');
const inputs = form.querySelectorAll('input, select, textarea');

// Form validation and enhancement
class PracticeFormHandler {
    constructor() {
        this.initializeForm();
        this.addEventListeners();
        this.addFormValidation();
        this.addInteractiveEffects();
        this.initializeAnimations();
    }

    initializeForm() {
        // Add loading state management
        this.isSubmitting = false;
        
        // Add form progress tracking
        this.requiredFields = form.querySelectorAll('[required]');
        this.updateSubmitButtonState();
    }

    addEventListeners() {
        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('focus', () => this.clearFieldError(input));
        });

        // Auto-save to localStorage
        inputs.forEach(input => {
            input.addEventListener('input', () => this.autoSave());
        });

        // Load saved data on page load
        this.loadSavedData();
    }

    addFormValidation() {
        // Custom validation messages
        const validationRules = {
            role: {
                required: true,
                minLength: 2,
                message: 'Please enter a valid job role (at least 2 characters)'
            },
            name: {
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Name should only contain letters and spaces'
            },
            skills: {
                pattern: /^[a-zA-Z0-9\s,+#.-]+$/,
                message: 'Skills should contain only letters, numbers, and common symbols'
            }
        };

        // Apply validation rules
        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateFieldWithRules(field, validationRules[fieldName]);
                });
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        this.clearFieldError(field);
        this.updateSubmitButtonState();
        return true;
    }

    validateFieldWithRules(field, rules) {
        const value = field.value.trim();
        
        if (rules.required && !value) {
            this.showFieldError(field, rules.message || 'This field is required');
            return false;
        }
        
        if (value && rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, rules.message);
            return false;
        }
        
        if (value && rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(field, rules.message);
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            animation: fadeInUp 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    updateSubmitButtonState() {
        const allRequiredFilled = Array.from(this.requiredFields).every(field => 
            field.value.trim() !== ''
        );
        
        if (allRequiredFilled) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    }

    addInteractiveEffects() {
        // Add focus effects to form groups
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.style.transform = 'translateY(-2px)';
                input.parentNode.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', () => {
                input.parentNode.style.transform = 'translateY(0)';
            });
        });

        // Add typing effect to placeholders
        this.addTypingEffects();
    }

    addTypingEffects() {
        const roleInput = document.getElementById('role');
        const placeholders = [
            'Software Engineer',
            'Data Scientist',
            'Product Manager',
            'UX Designer',
            'DevOps Engineer',
            'Full Stack Developer',
            'Machine Learning Engineer',
            'Frontend Developer',
            'Backend Developer',
            'System Architect'
        ];
        
        let currentIndex = 0;
        let currentText = '';
        let isDeleting = false;
        
        const typeEffect = () => {
            const fullText = placeholders[currentIndex];
            
            if (isDeleting) {
                currentText = fullText.substring(0, currentText.length - 1);
            } else {
                currentText = fullText.substring(0, currentText.length + 1);
            }
            
            if (roleInput && !roleInput.value) {
                roleInput.placeholder = currentText;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && currentText === fullText) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && currentText === '') {
                isDeleting = false;
                currentIndex = (currentIndex + 1) % placeholders.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeEffect, typeSpeed);
        };
        
        // Start typing effect after a delay
        setTimeout(typeEffect, 1000);
    }

    initializeAnimations() {
        // Animate feature cards on load
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }, 200 * (index + 1));
        });

        // Animate progress bars
        setTimeout(() => {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                    bar.style.transition = 'width 1.5s ease-out';
                }, 100);
            });
        }, 1000);

        // Animate chart bars
        setTimeout(() => {
            const chartBars = document.querySelectorAll('.chart-bar');
            chartBars.forEach((bar, index) => {
                const height = bar.style.height;
                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.height = height;
                    bar.style.transition = 'height 1s ease-out';
                }, 100 * index);
            });
        }, 1500);
    }

    autoSave() {
        const formData = {};
        inputs.forEach(input => {
            if (input.value.trim()) {
                formData[input.id] = input.value;
            }
        });
        
        localStorage.setItem('aceNextPracticeForm', JSON.stringify(formData));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('aceNextPracticeForm');
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                Object.keys(formData).forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = formData[fieldId];
                    }
                });
                this.updateSubmitButtonState();
            } catch (error) {
                console.log('Could not load saved form data');
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('❌ Please fix the errors before submitting', 'error');
            return;
        }
        
        this.isSubmitting = true;
        this.setLoadingState(true);
        
        // Collect form data
        const formData = this.collectFormData();
        
        try {
            // Simulate API call (replace with actual endpoint)
            await this.submitToAPI(formData);
            
            // Clear saved data
            localStorage.removeItem('aceNextPracticeForm');
            
            // Show success message
            this.showNotification('🚀 Interview session starting...', 'success');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'start.html';
            }, 1500);
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('❌ Something went wrong. Please try again.', 'error');
            this.setLoadingState(false);
            this.isSubmitting = false;
        }
    }

    collectFormData() {
        const name = document.getElementById('name').value.trim();
        const role = document.getElementById('role').value.trim();
        const company = document.getElementById('company').value.trim();
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const skills = document.getElementById('skills').value.trim();
        const experienceLevel = document.getElementById('experienceLevel').value;
        const interviewType = document.getElementById('interviewType').value;

        const otherDetails = [
            skills && `Skills: ${skills}`,
            experienceLevel && `Experience: ${experienceLevel}`,
            interviewType && `Interview Type: ${interviewType}`
        ].filter(Boolean).join(' | ');

        return {
            candidate_name: name || 'Anonymous',
            job_role: role,
            company_name: company || 'Not specified',
            job_description: jobDescription || 'No description provided',
            other_details: otherDetails || 'No additional details'
        };
    }

    async submitToAPI(data) {
        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:8000/save-job-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.querySelector('.btn-text').textContent = 'Setting up your interview...';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').textContent = 'Start AI Interview Practice';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors[type] || colors.info,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontWeight: '500',
            fontSize: '0.9rem',
            maxWidth: '300px'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Particle effect for background
class ParticleEffect {
    constructor() {
        this.createParticles();
    }

    createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        document.body.appendChild(particleContainer);
        
        for (let i = 0; i < 30; i++) {
            this.createParticle(particleContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            opacity: 0.6;
            animation: float ${Math.random() * 15 + 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
        `;
        
        container.appendChild(particle);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PracticeFormHandler();
    new ParticleEffect();
    
    // Add CSS for particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add smooth page transitions
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        if (confirm('Clear all form data?')) {
            form.reset();
            localStorage.removeItem('aceNextPracticeForm');
        }
    }
});

// Add form field focus indicators
document.addEventListener('DOMContentLoaded', () => {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        if (input) {
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                group.classList.remove('focused');
            });
        }
    });
});