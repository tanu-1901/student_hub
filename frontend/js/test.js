/**
 * test.js — Live Test Engine Controller
 * Loads subject-specific questions from QUESTION_BANKS or API.
 * Renders glassmorphic option cards with letter badges (A, B, C, D) safely.
 * Submits results to backend API and displays a modern glass scorecard.
 */

// ── Auth Guard ───────────────────────────────────────────────────────────────
const currentUser = ApiService.checkAuth('student');
if (!currentUser) {
    // checkAuth handles redirect to index.html
}

// ── Subject & Test Configuration ─────────────────────────────────────────────
const activeSubjectId = (localStorage.getItem('activeTestId') || localStorage.getItem('selectedSubject') || 'html').toLowerCase().trim();
const activePaperTitle = localStorage.getItem('selectedPaper') || `${activeSubjectId.toUpperCase()} Fundamentals Test`;

document.getElementById('paperTitle').textContent = activePaperTitle;
const categoryBadge = document.getElementById('subjectCategoryBadge');
if (categoryBadge) categoryBadge.textContent = activeSubjectId.toUpperCase();

let questionBank = [];
let currentIndex = 0;
let userAnswers = {}; // { questionIndex: chosenOptionIndex }
let timeRemaining = 15 * 60; // 15 mins default
let timerInterval = null;
let testStartTime = null;

// ── Initialize Test Questions ────────────────────────────────────────────────
async function initializeTest() {
    // 1. Try preloaded questions from localStorage (passed by mock-tests or papers)
    const preloaded = localStorage.getItem('activeTestQuestions');
    if (preloaded) {
        try {
            const parsed = JSON.parse(preloaded);
            if (Array.isArray(parsed) && parsed.length > 0) {
                questionBank = parsed;
                localStorage.removeItem('activeTestQuestions'); // consume
                startTest();
                return;
            }
        } catch (e) {
            console.warn('[Test] Error parsing preloaded questions:', e);
        }
    }

    // 2. Fetch directly from API for this exact subject
    try {
        const res = await ApiService.getSubjectQuestions(activeSubjectId);
        if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
            questionBank = res.questions;
            if (res.title) document.getElementById('paperTitle').textContent = res.title;
            if (res.defaultDurationMinutes) timeRemaining = res.defaultDurationMinutes * 60;
            startTest();
            return;
        }
    } catch (e) {
        console.warn(`[Test] API fetch failed for '${activeSubjectId}', falling back to built-in bank:`, e.message);
    }

    // 3. Built-in Subject Question Banks (100% subject-specific for all 12 subjects)
    if (typeof QUESTION_BANKS !== 'undefined' && QUESTION_BANKS[activeSubjectId]) {
        const subData = QUESTION_BANKS[activeSubjectId];
        questionBank = subData.questions.map((q, idx) => ({
            id: idx + 1,
            question: q.question,
            options: q.options,
            explanation: q.explanation,
            correctAnswerIndex: q.correctAnswerIndex
        }));
        if (subData.title) document.getElementById('paperTitle').textContent = subData.title;
        if (subData.defaultDurationMinutes) timeRemaining = subData.defaultDurationMinutes * 60;
    } else {
        // Last resort: standard fallback matching the subject
        questionBank = getSubjectSpecificFallback(activeSubjectId);
    }

    startTest();
}

function getSubjectSpecificFallback(sub) {
    if (typeof QUESTION_BANKS !== 'undefined' && QUESTION_BANKS[sub]) {
        return QUESTION_BANKS[sub].questions;
    }
    // Safety generic fallback
    return [
        { question: `What is the core purpose of ${sub.toUpperCase()} in modern computing?`, options: ['Specification & Structure', 'Hardware design', 'Network cabling', 'Operating system kernel'], correctAnswerIndex: 0 },
        { question: `Which standard organization oversees ${sub.toUpperCase()} specifications?`, options: ['ISO / W3C Standards Body', 'IEEE only', 'NASA', 'Department of Transportation'], correctAnswerIndex: 0 },
        { question: `What is a best practice when writing clean, maintainable ${sub.toUpperCase()} code?`, options: ['Use clear naming conventions and modularity', 'Put all code in one line', 'Never use comments', 'Use random variable names'], correctAnswerIndex: 0 }
    ];
}

// ── Start Test Engine ────────────────────────────────────────────────────────
function startTest() {
    if (!questionBank || questionBank.length === 0) {
        document.getElementById('questionText').textContent = 'Unable to load test questions. Please return to the catalog.';
        return;
    }
    testStartTime = Date.now();
    renderQuestion();
    startTimer();
}

// ── Render Current Question & Options ────────────────────────────────────────
function renderQuestion() {
    const qData = questionBank[currentIndex];
    if (!qData) return;

    const qCounter = document.getElementById('questionCounter');
    const qText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    qCounter.textContent = `Question ${currentIndex + 1} of ${questionBank.length}`;
    qText.textContent = `${currentIndex + 1}. ${qData.question}`;
    optionsContainer.innerHTML = '';

    const opts = qData.options || qData.opts || [];
    const letters = ['A', 'B', 'C', 'D', 'E'];

    opts.forEach((optText, optIdx) => {
        const isSelected = userAnswers[currentIndex] === optIdx;

        const item = document.createElement('div');
        item.className = `option-item ${isSelected ? 'selected' : ''}`;

        // Letter badge: A, B, C, D
        const badge = document.createElement('div');
        badge.className = 'option-badge';
        badge.textContent = letters[optIdx] || (optIdx + 1);

        // Option text: textContent prevents HTML tags like <footer> or <svg> from disappearing
        const textDiv = document.createElement('div');
        textDiv.className = 'option-text';
        textDiv.textContent = optText;

        // Custom Radio / Check Indicator
        const radioDiv = document.createElement('div');
        radioDiv.className = 'option-radio';
        if (isSelected) {
            radioDiv.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        }

        item.appendChild(badge);
        item.appendChild(textDiv);
        item.appendChild(radioDiv);

        item.onclick = () => selectOption(optIdx);
        optionsContainer.appendChild(item);
    });

    // Control buttons state
    prevBtn.disabled = currentIndex === 0;
    if (currentIndex === questionBank.length - 1) {
        nextBtn.innerHTML = `
            Finish & Review
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        `;
    } else {
        nextBtn.innerHTML = `
            Next Question
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        `;
    }

    updatePalette();
}

function selectOption(optIdx) {
    userAnswers[currentIndex] = optIdx;
    renderQuestion();
}

// ── Palette Sidebar Rendering ────────────────────────────────────────────────
function updatePalette() {
    const paletteGrid = document.getElementById('paletteGrid');
    if (!paletteGrid) return;
    paletteGrid.innerHTML = '';

    let answeredCount = 0;

    questionBank.forEach((_, idx) => {
        const isAnswered = userAnswers[idx] !== undefined;
        if (isAnswered) answeredCount++;

        const isCurrent = idx === currentIndex;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `palette-btn ${isCurrent ? 'active' : ''} ${isAnswered ? 'answered' : ''}`;
        btn.textContent = idx + 1;
        btn.onclick = () => {
            currentIndex = idx;
            renderQuestion();
        };
        paletteGrid.appendChild(btn);
    });

    const ansCountEl = document.getElementById('answeredCounter');
    const remCountEl = document.getElementById('remainingCounter');
    if (ansCountEl) ansCountEl.textContent = answeredCount;
    if (remCountEl) remCountEl.textContent = questionBank.length - answeredCount;
}

// ── Action Controls Navigation ───────────────────────────────────────────────
document.getElementById('prevBtn').onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
};

document.getElementById('nextBtn').onclick = () => {
    if (currentIndex < questionBank.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        submitTest();
    }
};

document.getElementById('clearBtn').onclick = () => {
    delete userAnswers[currentIndex];
    renderQuestion();
};

document.getElementById('submitTestBtn').onclick = submitTest;

// ── Digital Countdown Timer ──────────────────────────────────────────────────
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('timeDisplay');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
}

// ── Test Evaluation & Submission ─────────────────────────────────────────────
let isSubmitted = false;
async function submitTest() {
    if (isSubmitted) return;
    isSubmitted = true;
    clearInterval(timerInterval);

    // Calculate score
    let score = 0;
    questionBank.forEach((q, idx) => {
        const userChoice = userAnswers[idx];
        const correctChoice = q.correctAnswerIndex ?? q.answer ?? q.ans;
        if (userChoice !== undefined && userChoice === correctChoice) {
            score++;
        }
    });

    const timeTakenSecs = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
    const accuracy = Math.round((score / questionBank.length) * 100);
    const minsTaken = Math.floor(timeTakenSecs / 60);
    const secsTaken = timeTakenSecs % 60;

    // Display Modern Glass Scorecard Modal
    const modal = document.getElementById('resultModal');
    if (modal) {
        document.getElementById('modalScore').textContent = `${score} / ${questionBank.length}`;
        document.getElementById('modalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('modalTime').textContent = `${minsTaken}m ${secsTaken}s`;

        const headingEl = document.getElementById('resultHeading');
        const subEl = document.getElementById('resultSub');
        const badgeWrap = document.getElementById('resultBadgeWrap');

        if (accuracy >= 80) {
            headingEl.textContent = 'Outstanding Performance!';
            subEl.textContent = `Mastery achieved in ${activeSubjectId.toUpperCase()} concepts!`;
            badgeWrap.className = 'result-badge-wrap pass';
        } else if (accuracy >= 50) {
            headingEl.textContent = 'Well Done! Good Practice!';
            subEl.textContent = `Solid attempt across ${activeSubjectId.toUpperCase()} questions.`;
            badgeWrap.className = 'result-badge-wrap pass';
        } else {
            headingEl.textContent = 'Keep Learning & Practicing!';
            subEl.textContent = `Review key ${activeSubjectId.toUpperCase()} fundamentals and retake.`;
            badgeWrap.className = 'result-badge-wrap review';
        }

        modal.style.display = 'flex';
    }

    // Always record locally so dashboard and progress update in real time immediately
    try {
        const newRecord = {
            _id: 'test_' + Date.now(),
            testTitle: activePaperTitle,
            subject: activeSubjectId,
            totalScore: score,
            score: score,
            totalQuestions: questionBank.length,
            accuracy: accuracy,
            status: accuracy >= 50 ? 'Pass' : 'Fail',
            date: 'Today',
            createdAt: new Date().toISOString()
        };
        const hist = JSON.parse(localStorage.getItem('testHistory') || '[]');
        hist.unshift(newRecord);
        localStorage.setItem('testHistory', JSON.stringify(hist.slice(0, 30)));
    } catch (err) {
        console.warn('[Test] Local storage update failed:', err);
    }

    // Submit to API
    try {
        await ApiService.submitTestResult({
            subject: activeSubjectId,
            testTitle: activePaperTitle,
            score: score,
            totalQuestions: questionBank.length,
            timeTakenSeconds: timeTakenSecs,
            accuracy: accuracy
        });
    } catch (e) {
        console.warn('[Test] Backend sync note:', e.message);
    }
}

// ── Launch on DOM ready ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initializeTest);
