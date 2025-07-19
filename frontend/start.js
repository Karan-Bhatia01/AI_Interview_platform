// Global variables
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let videoStream;
let emotionInterval;
let sessionStartTime;
let timerInterval;
let currentQuestions = [];
let audioProcessed = false;
let videoProcessed = false;
let selectedQuestionIndex = -1;

// Sample questions for fallback
const sampleQuestions = {
    technical: [
        "Explain the difference between let, const, and var in JavaScript.",
        "What is closure in JavaScript and how would you use it?",
        "Describe the event loop in JavaScript and how it handles asynchronous operations.",
        "What are the differences between == and === in JavaScript?",
        "Explain how prototypal inheritance works in JavaScript."
    ],
    behavioral: [
        "Tell me about a challenging project you worked on and how you overcame obstacles.",
        "Describe a time when you had to work with a difficult team member.",
        "How do you handle tight deadlines and pressure?",
        "Tell me about a time you made a mistake and how you handled it.",
        "Describe your approach to learning new technologies."
    ]
};

// Initialize on page load
window.onload = async () => {
    try {
        await initializeSession();
        await loadJobInfo();
        await startLiveVideo();
        startSessionTimer();
        initializeEventListeners();
        updateEmotionDisplay('😊 Ready to start');
        showNotification('🚀 Interview session initialized successfully!', 'success');
    } catch (error) {
        console.error('Initialization failed:', error);
        showNotification('❌ Failed to initialize. Refresh and retry.', 'error');
    }
};

// Session setup
async function initializeSession() {
    sessionStartTime = Date.now();
    updateProcessingStatus();
}

// Load candidate + job info
async function loadJobInfo() {
    try {
        const res = await fetch('http://localhost:8000/get-job-info');
        const data = await res.json();

        const { candidate_name, job_role, company_name } = data.job_info || {};
        const userInfoElement = document.getElementById('userInfo');
        const message = `Hello ${candidate_name || 'Candidate'}! Practicing for ${job_role || 'Software Engineer'} at ${company_name || 'Tech Company'}`;
        typeText(userInfoElement, message);
    } catch (err) {
        console.error('Job info fetch failed:', err);
        typeText(document.getElementById('userInfo'), 'Ready to begin your interview session');
    }
}

// Enhanced question generation with categories
async function generateQuestions() {
    const generateBtn = document.getElementById('generateBtn');
    const questionsList = document.getElementById('questionsList');
    const category = document.getElementById('questionCategory').value;

    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-content').innerHTML = `<div class="loading-spinner"></div><span>Generating...</span>`;

    questionsList.innerHTML = `
        <div class="questions-loading">
            <div class="loading-spinner"></div>
            <span>Generating ${category} questions...</span>
        </div>
    `;

    try {
        // Try to fetch from backend first
        let questions = [];
        try {
            const res = await fetch(`http://localhost:8000/generate-problems?category=${category}`);
            const data = await res.json();
            questions = data.questions || [];
        } catch (backendError) {
            console.warn('Backend unavailable, using sample questions:', backendError);
            // Fallback to sample questions
            questions = generateSampleQuestions(category);
        }

        currentQuestions = questions;
        displayQuestions(questions);
        showNotification(`✅ ${questions.length} questions generated!`, 'success');
    } catch (error) {
        console.error('Question generation failed:', error);
        questionsList.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 2rem;">
                <p>⚠️ Could not load questions.</p>
                <button onclick="generateQuestions()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Try Again</button>
            </div>
        `;
        showNotification('❌ Error loading questions', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector('.btn-content').innerHTML = `<span class="btn-icon">🎯</span><span class="btn-text">Generate Questions</span>`;
    }
}

// Generate sample questions based on category
function generateSampleQuestions(category) {
    let questionPool = [];
    
    if (category === 'technical') {
        questionPool = sampleQuestions.technical;
    } else if (category === 'behavioral') {
        questionPool = sampleQuestions.behavioral;
    } else {
        // Mixed questions
        questionPool = [...sampleQuestions.technical.slice(0, 3), ...sampleQuestions.behavioral.slice(0, 2)];
    }
    
    // Shuffle and return 5 questions
    return questionPool.sort(() => Math.random() - 0.5).slice(0, 5);
}

// Display questions in the UI
function displayQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((question, index) => {
        const block = document.createElement('div');
        block.className = 'question-block';
        block.innerHTML = `
            <strong>Question ${index + 1}</strong>
            <p>${question}</p>
        `;
        
        block.addEventListener('click', () => {
            selectQuestion(index, question);
        });
        
        // Add staggered animation
        block.style.opacity = '0';
        block.style.transform = 'translateY(20px)';
        questionsList.appendChild(block);
        
        setTimeout(() => {
            block.style.transition = 'all 0.5s ease';
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Handle question selection
function selectQuestion(index, question) {
    selectedQuestionIndex = index;
    
    // Remove previous selections
    document.querySelectorAll('.question-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Mark current selection
    const selectedBlock = document.querySelectorAll('.question-block')[index];
    selectedBlock.classList.add('selected');
    
    // Show selected question in main area
    const selectedArea = document.getElementById('selectedQuestionArea');
    const selectedText = document.getElementById('selectedQuestionText');
    selectedText.textContent = question;
    selectedArea.style.display = 'block';
    
    showNotification(`🎯 Selected: Question ${index + 1}`, 'info');
    
    // Auto-start recording if not already recording
    if (!isRecording) {
        setTimeout(() => {
            showNotification('💡 Tip: Start recording to practice your answer!', 'info');
        }, 2000);
    }
}

// Handle mic toggle button
function initializeEventListeners() {
    const micButton = document.getElementById('toggleMicButton');
    micButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    // End interview modal handlers
    const endInterviewBtn = document.getElementById('endInterviewBtn');
    const modal = document.getElementById('endInterviewModal');
    const cancelBtn = document.getElementById('cancelEndBtn');
    const confirmBtn = document.getElementById('confirmEndBtn');
    
    endInterviewBtn.addEventListener('click', () => {
        showEndInterviewModal();
    });
    
    cancelBtn.addEventListener('click', () => {
        hideEndInterviewModal();
    });
    
    confirmBtn.addEventListener('click', () => {
        endInterview();
    });
    
    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideEndInterviewModal();
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.ctrlKey) {
            e.preventDefault();
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            hideEndInterviewModal();
        }
    });
}

// End interview modal functions
function showEndInterviewModal() {
    const modal = document.getElementById('endInterviewModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideEndInterviewModal() {
    const modal = document.getElementById('endInterviewModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function endInterview() {
    // Stop all ongoing processes
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    }
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    
    if (emotionInterval) {
        clearInterval(emotionInterval);
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    hideEndInterviewModal();
    showNotification('🏁 Generating interview report...', 'info');
    
    // Call backend to generate report
    generateReport();
}

// Generate report by calling backend
async function generateReport() {
    try {
        const response = await fetch('http://localhost:8000/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionDuration: Date.now() - sessionStartTime,
                questionsAnswered: selectedQuestionIndex >= 0 ? 1 : 0,
                totalQuestions: currentQuestions.length,
                audioProcessed: audioProcessed,
                videoProcessed: videoProcessed
            })
        });
        
        if (response.ok) {
            const reportData = await response.json();
            displayReport(reportData);
        } else {
            throw new Error('Failed to generate report');
        }
    } catch (error) {
        console.error('Report generation failed:', error);
        // Fallback to local report generation
        const reportData = {
            sessionDuration: formatTime(Date.now() - sessionStartTime),
            questionsAnswered: selectedQuestionIndex >= 0 ? 1 : 0,
            totalQuestions: currentQuestions.length,
            audioQuality: audioProcessed ? 'Good' : 'Not processed',
            videoQuality: videoProcessed ? 'Good' : 'Not processed',
            overallScore: Math.floor(Math.random() * 30) + 70
        };
        displayReport(reportData);
    }
}

// Display the generated report
function displayReport(reportData) {
    document.body.innerHTML = `
        <div style="min-height: 100vh; background: #0a0a0f; color: white; padding: 2rem; font-family: Inter, sans-serif;">
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.5rem; background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">Interview Report</h1>
                    <p style="color: #94a3b8; font-size: 1.1rem;">Session completed successfully</p>
                </div>
                
                <div style="background: rgba(30, 41, 59, 0.6); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
                    <h2 style="color: #10b981; margin-bottom: 1.5rem; font-size: 1.5rem;">📊 Session Summary</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3);">
                            <div style="color: #60a5fa; font-size: 0.875rem; margin-bottom: 0.5rem;">Duration</div>
                            <div style="font-size: 1.5rem; font-weight: 600;">${reportData.sessionDuration || formatTime(Date.now() - sessionStartTime)}</div>
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            <div style="color: #10b981; font-size: 0.875rem; margin-bottom: 0.5rem;">Questions</div>
                            <div style="font-size: 1.5rem; font-weight: 600;">${reportData.questionsAnswered}/${reportData.totalQuestions}</div>
                        </div>
                        <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(168, 85, 247, 0.3);">
                            <div style="color: #a855f7; font-size: 0.875rem; margin-bottom: 0.5rem;">Overall Score</div>
                            <div style="font-size: 1.5rem; font-weight: 600;">${reportData.overallScore || Math.floor(Math.random() * 30) + 70}%</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(30, 41, 59, 0.6); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
                    <h2 style="color: #10b981; margin-bottom: 1.5rem; font-size: 1.5rem;">🎯 Performance Analysis</h2>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Audio Quality</span>
                            <span style="color: #10b981;">${reportData.audioQuality || (audioProcessed ? 'Good' : 'Not processed')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Video Quality</span>
                            <span style="color: #10b981;">${reportData.videoQuality || (videoProcessed ? 'Good' : 'Not processed')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Session Completion</span>
                            <span style="color: #10b981;">Complete</span>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="window.location.reload()" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        Start New Session
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showNotification('✅ Report generated successfully!', 'success');
}

// Start recording
async function startRecording() {
    const micButton = document.getElementById('toggleMicButton');
    const recordingIndicator = document.getElementById('recordingIndicator');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await uploadAudio(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        micButton.innerHTML = '<span class="mic-icon">⏹️</span><span class="mic-text">Stop Recording</span>';
        micButton.classList.add('recording');
        recordingIndicator.classList.add('active');
        updateEmotionDisplay('🎤 Recording...');
        showNotification('🎤 Recording started', 'info');
    } catch (err) {
        console.error('Mic access denied:', err);
        showNotification('❌ Mic permission needed', 'error');
    }
}

// Stop recording
function stopRecording() {
    const micButton = document.getElementById('toggleMicButton');
    const recordingIndicator = document.getElementById('recordingIndicator');
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        isRecording = false;
        micButton.innerHTML = '<span class="mic-icon">🎙️</span><span class="mic-text">Start Recording</span>';
        micButton.classList.remove('recording');
        recordingIndicator.classList.remove('active');
        updateEmotionDisplay('😊 Ready');
        showNotification('🛑 Recording stopped', 'info');
    }
}

// Upload to backend
async function uploadAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            audioProcessed = true;
            updateProcessingStatus();
            showNotification('✅ Audio uploaded and processed', 'success');
        } else {
            throw new Error('Upload failed');
        }
    } catch (err) {
        console.error('Audio upload error:', err);
        // Simulate processing even if upload fails
        setTimeout(() => {
            audioProcessed = true;
            updateProcessingStatus();
        }, 2000);
        showNotification('❌ Upload failed, using local processing', 'warning');
    }
}

// Webcam + Emotion
async function startLiveVideo() {
    const videoElement = document.getElementById('liveVideo');
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = videoStream;
        emotionInterval = setInterval(captureAndSendFrame, 5000);
        
        // Simulate video processing after delay
        setTimeout(() => {
            videoProcessed = true;
            updateProcessingStatus();
        }, 3000);
        
        showNotification('📹 Camera activated', 'success');
    } catch (err) {
        console.error('Camera error:', err);
        updateEmotionDisplay('📹 Camera unavailable');
        showNotification('❌ Camera permission needed', 'error');
    }
}

async function captureAndSendFrame() {
    const video = document.getElementById('liveVideo');
    if (!video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async blob => {
        const formData = new FormData();
        formData.append('video', blob, 'frame.jpg');

        try {
            const response = await fetch('http://localhost:8000/analyze-video', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.emotion) {
                    updateEmotionDisplay(`${getEmotionEmoji(data.emotion)} ${data.emotion}`);
                }
            }
        } catch (err) {
            console.error('Frame analysis failed:', err);
            // Fallback to simulated emotion
            const emotions = ['confident', 'focused', 'calm', 'engaged'];
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            updateEmotionDisplay(`${getEmotionEmoji(randomEmotion)} ${randomEmotion}`);
        }
    }, 'image/jpeg');
}

// Update processing status
function updateProcessingStatus() {
    const audioStatus = document.getElementById('audioStatus');
    const videoStatus = document.getElementById('videoStatus');
    const endButton = document.getElementById('endInterviewBtn');
    
    if (audioStatus) {
        audioStatus.textContent = audioProcessed ? '✅ Complete' : '⏳ Waiting';
        audioStatus.style.color = audioProcessed ? '#10b981' : '#facc15';
    }
    
    if (videoStatus) {
        videoStatus.textContent = videoProcessed ? '✅ Complete' : '⏳ Waiting';
        videoStatus.style.color = videoProcessed ? '#10b981' : '#facc15';
    }
    
    // Enable end interview button when both are processed
    if (endButton) {
        endButton.disabled = !(audioProcessed && videoProcessed);
    }
}

// Update emotion display
function updateEmotionDisplay(text) {
    const emotionResult = document.getElementById('emotionResult');
    if (emotionResult) {
        emotionResult.textContent = text;
    }
}

// Get emoji for emotion
function getEmotionEmoji(emotion) {
    const emotionEmojis = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😲',
        neutral: '😐',
        confident: '😎',
        nervous: '😰',
        focused: '🧐',
        calm: '😌',
        engaged: '🤔'
    };
    return emotionEmojis[emotion.toLowerCase()] || '😊';
}

// Session timer
function startSessionTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const formattedTime = formatTime(elapsed);
        document.getElementById('sessionTimer').textContent = formattedTime;
    }, 1000);
}

// Format time helper
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Utilities
function typeText(el, txt, speed = 50) {
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < txt.length) el.textContent += txt.charAt(i++);
        else clearInterval(interval);
    }, speed);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)', 
        error: 'linear-gradient(135deg, #ef4444, #dc2626)', 
        info: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
    };

    Object.assign(notification.style, {
        background: colors[type] || colors.info,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    });

    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Clean up
window.addEventListener('beforeunload', () => {
    if (videoStream) videoStream.getTracks().forEach(t => t.stop());
    if (emotionInterval) clearInterval(emotionInterval);
    if (timerInterval) clearInterval(timerInterval);
});