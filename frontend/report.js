document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const loading = document.getElementById("loading");
    const reportContainer = document.getElementById("reportContainer");
    const reportText = document.getElementById("reportText");
    const formattedReport = document.getElementById("formattedReport");
    const errorDiv = document.getElementById("error");
    const errorMessage = document.getElementById("errorMessage");
    const overallScore = document.getElementById("overallScore");

    // Toggle buttons for report view
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const rawReport = document.getElementById('rawReport');

    // Initialize event listeners
    initializeEventListeners();
    initializeAnimations();

    function initializeEventListeners() {
        generateBtn.addEventListener("click", generateReport);
        downloadBtn.addEventListener("click", downloadReport);
        
        // Toggle between formatted and raw report view
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                toggleReportView(view);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                generateReport();
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                downloadReport();
            }
        });
    }

    function initializeAnimations() {
        // Animate score bars on page load
        setTimeout(() => {
            animateScoreBars();
        }, 1000);

        // Add staggered animation to recommendation cards
        const recCards = document.querySelectorAll('.recommendation-card');
        recCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }, 200 * (index + 1));
        });
    }

    function animateScoreBars() {
        const scoreFills = document.querySelectorAll('.score-fill');
        scoreFills.forEach(fill => {
            const score = fill.dataset.score;
            fill.style.width = score + '%';
        });
    }

    function toggleReportView(view) {
        toggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        if (view === 'formatted') {
            formattedReport.parentElement.classList.remove('hidden');
            rawReport.classList.add('hidden');
        } else {
            formattedReport.parentElement.classList.add('hidden');
            rawReport.classList.remove('hidden');
        }
    }

    async function generateReport() {
        // Reset UI state
        hideAllSections();
        loading.classList.remove("hidden");
        generateBtn.disabled = true;
        
        // Update button state
        updateButtonState(generateBtn, 'loading');
        
        // Simulate loading steps
        await simulateLoadingSteps();

        try {
            const response = await fetch("http://localhost:8000/generate-report");
            const data = await response.json();

            if (response.ok && data.report) {
                // Populate raw report
                reportText.textContent = data.report;
                
                // Generate formatted report
                generateFormattedReport(data.report);
                
                // Update overall score with animation
                animateOverallScore(88); // Example score
                
                // Show success state
                showReportContainer();
                showNotification('✅ Report generated successfully!', 'success');
                
            } else {
                throw new Error(data.message || "Failed to fetch report.");
            }
        } catch (error) {
            console.error('Report generation error:', error);
            showError(error.message);
            showNotification('❌ Failed to generate report', 'error');
        } finally {
            loading.classList.add("hidden");
            generateBtn.disabled = false;
            updateButtonState(generateBtn, 'normal');
        }
    }

    function simulateLoadingSteps() {
        return new Promise((resolve) => {
            const steps = document.querySelectorAll('.step');
            let currentStep = 0;

            const activateNextStep = () => {
                if (currentStep > 0) {
                    steps[currentStep - 1].classList.remove('active');
                }
                if (currentStep < steps.length) {
                    steps[currentStep].classList.add('active');
                    currentStep++;
                    setTimeout(activateNextStep, 1500);
                } else {
                    resolve();
                }
            };

            activateNextStep();
        });
    }

    function generateFormattedReport(rawReportText) {
        // Parse and format the raw report into structured HTML
        const sections = parseReportSections(rawReportText);
        
        let formattedHTML = '';
        
        sections.forEach(section => {
            formattedHTML += `
                <div class="report-section-formatted">
                    <h4 class="section-title">${section.title}</h4>
                    <div class="section-body">
                        ${section.content.split('\n').map(line => 
                            line.trim() ? `<p>${line.trim()}</p>` : ''
                        ).join('')}
                    </div>
                </div>
            `;
        });
        
        formattedReport.innerHTML = formattedHTML;
    }

    function parseReportSections(reportText) {
        // Simple parser to extract sections from the report
        const sections = [];
        const lines = reportText.split('\n');
        let currentSection = null;
        
        lines.forEach(line => {
            line = line.trim();
            if (line.match(/^[A-Z][^:]*:$/)) {
                // This looks like a section header
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: line.replace(':', ''),
                    content: ''
                };
            } else if (currentSection && line) {
                currentSection.content += line + '\n';
            }
        });
        
        if (currentSection) {
            sections.push(currentSection);
        }
        
        return sections.length > 0 ? sections : [{
            title: 'Interview Analysis',
            content: reportText
        }];
    }

    function animateOverallScore(targetScore) {
        let currentScore = 0;
        const increment = targetScore / 50;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                overallScore.textContent = targetScore;
                clearInterval(timer);
            } else {
                overallScore.textContent = Math.floor(currentScore);
            }
        }, 30);
    }

    function downloadReport() {
        const reportContent = reportText.textContent;
        if (!reportContent) {
            showNotification('❌ No report to download', 'error');
            return;
        }

        // Create downloadable content
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('📥 Report downloaded successfully!', 'success');
    }

    function updateButtonState(button, state) {
        const btnContent = button.querySelector('.btn-content') || button;
        
        if (state === 'loading') {
            btnContent.innerHTML = `
                <div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 0.5rem;"></div>
                <span>Generating Report...</span>
            `;
        } else {
            btnContent.innerHTML = `
                <span class="btn-icon">🤖</span>
                <span class="btn-text">Generate AI Report</span>
            `;
        }
    }

    function hideAllSections() {
        reportContainer.classList.add("hidden");
        errorDiv.classList.add("hidden");
    }

    function showReportContainer() {
        reportContainer.classList.remove("hidden");
        downloadBtn.style.display = "inline-flex";
        
        // Animate report sections
        const sections = reportContainer.querySelectorAll('.report-section, .summary-card');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }, 100 * index);
        });
        
        // Re-animate score bars
        setTimeout(() => {
            animateScoreBars();
        }, 500);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorDiv.classList.remove("hidden");
    }

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
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
            maxWidth: '300px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
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

    // Add CSS for formatted report sections
    const style = document.createElement('style');
    style.textContent = `
        .report-section-formatted {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .report-section-formatted:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #6366f1;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .section-title::before {
            content: '▶';
            font-size: 0.8rem;
        }
        
        .section-body p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
            color: #e2e8f0;
        }
        
        .section-body p:last-child {
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(style);
});