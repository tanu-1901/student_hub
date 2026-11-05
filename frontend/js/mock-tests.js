/**
 * mock-tests.js — Mock Test Center Controller
 * Loads subject-specific tests from API, handles catalog & full-stack 30Q test,
 * and submits results to backend
 */

// ── Auth Guard ───────────────────────────────────────────────────────────────
const mockTestUser = ApiService.checkAuth('student');
if (!mockTestUser) throw new Error('Not authenticated');

// Set user display
const storedEmail = mockTestUser.email || 'student@gmail.com';
document.getElementById('userEmailDisplay').textContent = storedEmail;
const avatarCircle = document.getElementById('userAvatarCircle');
if (avatarCircle) avatarCircle.textContent = (mockTestUser.name || storedEmail).charAt(0).toUpperCase();

function handleLogout() { ApiService.logout(); }

// ── Catalog Test Definitions (12 subjects from API) ─────────────────────────
const CATALOG_TESTS = [
    // Aptitude & Reasoning (classic mock test category)
    { id: 'reasoning', title: 'Logical Reasoning - Level 1', category: 'reasoning',
      description: 'Practice pattern matching, series, and analytical problem-solving skills.', duration: '20 Mins', difficulty: 'Easy' },
    { id: 'aptitude', title: 'Quantitative Aptitude - Basic', category: 'aptitude',
      description: 'Covers percentages, ratios, simple equations, and arithmetic problems.', duration: '25 Mins', difficulty: 'Medium' },
    { id: 'english', title: 'Verbal Ability & Grammar', category: 'english',
      description: 'Test vocabulary, sentence correction, and reading comprehension skills.', duration: '20 Mins', difficulty: 'Easy' },
    { id: 'gk', title: 'General Awareness 2026', category: 'gk',
      description: 'Current affairs, basic science, history, and general knowledge questions.', duration: '15 Mins', difficulty: 'Medium' },
    // Frontend (from Practice Papers section)
    { id: 'html', title: 'HTML5 Fundamentals', category: 'frontend',
      description: 'Test your knowledge on HTML tags, semantic markup, and forms.', duration: '20 Mins', difficulty: 'Easy' },
    { id: 'css', title: 'CSS3 Styling & Layouts', category: 'frontend',
      description: 'Master Flexbox, Grid, animations, and responsive web design.', duration: '25 Mins', difficulty: 'Medium' },
    { id: 'javascript', title: 'JavaScript Core & ES6+', category: 'frontend',
      description: 'Solve questions on DOM, closures, promises, and async patterns.', duration: '30 Mins', difficulty: 'Hard' },
    { id: 'react', title: 'React JS Basics', category: 'frontend',
      description: 'Components, props, hooks, state management, and virtual DOM.', duration: '25 Mins', difficulty: 'Medium' },
    // Backend
    { id: 'node', title: 'Node.js Core Concepts', category: 'backend',
      description: 'Event loop, async programming, modules, and File System API.', duration: '25 Mins', difficulty: 'Medium' },
    { id: 'express', title: 'Express.js Routing & Middleware', category: 'backend',
      description: 'REST APIs, middleware chains, routing, and error handling.', duration: '25 Mins', difficulty: 'Medium' },
    { id: 'mongodb', title: 'MongoDB & Mongoose', category: 'backend',
      description: 'NoSQL queries, aggregation pipelines, schemas, and indexes.', duration: '30 Mins', difficulty: 'Hard' },
    { id: 'python', title: 'Python Backend Basics', category: 'backend',
      description: 'Data structures, OOPs, file I/O, and Python API basics.', duration: '25 Mins', difficulty: 'Easy' }
];

let activeCategory = 'all';

function renderCatalogTests(filter = 'all') {
    const grid = document.getElementById('testsGrid');
    grid.innerHTML = '';

    const filtered = filter === 'all' ? CATALOG_TESTS : CATALOG_TESTS.filter(t => t.category === filter);

    filtered.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `
            <div>
                <div class="test-card-top">
                    <span class="test-badge badge-${test.category}">${test.category}</span>
                    <span class="difficulty-pill">${test.difficulty}</span>
                </div>
                <h3>${test.title}</h3>
                <p>${test.description}</p>
            </div>
            <div>
                <div class="test-meta">
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${test.duration}
                    </span>
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        5 Questions
                    </span>
                </div>
                <button class="start-test-btn" onclick="launchSubjectTest('${test.id}', '${test.title}')">
                    <span>Start Test</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function launchSubjectTest(subjectId, testTitle) {
    const cleanSubject = (subjectId || '').toLowerCase().trim();
    localStorage.setItem('activeTestId', cleanSubject);
    localStorage.setItem('selectedSubject', cleanSubject);
    localStorage.setItem('selectedPaper', testTitle);

    // Preload strictly subject-specific questions
    if (typeof QUESTION_BANKS !== 'undefined' && QUESTION_BANKS[cleanSubject]) {
        const qs = QUESTION_BANKS[cleanSubject].questions.map((q, idx) => ({
            id: idx + 1,
            question: q.question,
            options: q.options,
            explanation: q.explanation,
            correctAnswerIndex: q.correctAnswerIndex
        }));
        localStorage.setItem('activeTestQuestions', JSON.stringify(qs));
    }

    try {
        const res = await ApiService.getSubjectQuestions(cleanSubject);
        if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
            localStorage.setItem('activeTestQuestions', JSON.stringify(res.questions));
        }
    } catch (err) {
        console.warn('[MockTests] API questions unavailable — using built-in question bank');
    }

    window.location.href = 'test.html';
}

// ── Category Filter ──────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.category;
        renderCatalogTests(activeCategory);
    });
});

// ── View Toggle ──────────────────────────────────────────────────────────────
function switchView(viewName) {
    const catalogView = document.getElementById('catalogView');
    const fullstackView = document.getElementById('fullstackView');
    const tabCatalogBtn = document.getElementById('tabCatalogBtn');
    const tabFullStackBtn = document.getElementById('tabFullStackBtn');

    if (viewName === 'fullstack') {
        catalogView.style.display = 'none';
        fullstackView.style.display = 'block';
        tabFullStackBtn.classList.add('active');
        tabCatalogBtn.classList.remove('active');
        if (!fsTimerInterval) initFullStackTest();
    } else {
        fullstackView.style.display = 'none';
        catalogView.style.display = 'block';
        tabCatalogBtn.classList.add('active');
        tabFullStackBtn.classList.remove('active');
    }
}

// ── Full-Stack 30-Question Embedded Test ─────────────────────────────────────
const FS_QUESTIONS = [
    { q: 'Which HTML element inserts a line break?', opts: ['<break>', '<br>', '<lb>', '<line>'], ans: 1 },
    { q: 'Which CSS property changes text color?', opts: ['font-color', 'text-color', 'color', 'fg-color'], ans: 2 },
    { q: 'Correct syntax for a JS constant?', opts: ['var x = 10;', 'const x = 10;', 'let x = 10;', 'constant x = 10;'], ans: 1 },
    { q: 'Which array method adds to the end?', opts: ['push()', 'unshift()', 'pop()', 'append()'], ans: 0 },
    { q: 'CSS Flexbox property to align items on main axis?', opts: ['align-items', 'justify-content', 'align-content', 'flex-direction'], ans: 1 },
    { q: 'HTTP method to request data?', opts: ['POST', 'PUT', 'DELETE', 'GET'], ans: 3 },
    { q: 'SQL stands for?', opts: ['Structured Query Language', 'Sequential Query Language', 'Standard Question Language', 'System Query Logic'], ans: 0 },
    { q: 'Node.js module for file paths?', opts: ['fs', 'http', 'path', 'os'], ans: 2 },
    { q: 'React hook for component state?', opts: ['useEffect', 'useState', 'useContext', 'useReducer'], ans: 1 },
    { q: 'HTML attribute to uniquely identify element?', opts: ['class', 'type', 'name', 'id'], ans: 3 },
    { q: 'HTTP status "Not Found"?', opts: ['200', '500', '404', '403'], ans: 2 },
    { q: 'Purpose of "alt" in <img> tag?', opts: ['Alt text if image fails', 'Image alignment', 'Tooltip title', 'Animation style'], ans: 0 },
    { q: 'CSS property controlling text size?', opts: ['text-size', 'font-style', 'text-style', 'font-size'], ans: 3 },
    { q: 'JS operator for strict equality?', opts: ['==', '=', '===', '!='], ans: 2 },
    { q: 'DOM stands for?', opts: ['Data Object Model', 'Document Object Model', 'Digital Ordinance Model', 'Desktop Oriented Mode'], ans: 1 },
    { q: 'SQL clause to filter records?', opts: ['WHERE', 'ORDER BY', 'GROUP BY', 'SELECT'], ans: 0 },
    { q: 'JS pattern for clean async handling?', opts: ['await', 'defer', 'async/await', 'then'], ans: 2 },
    { q: 'Git is primarily used for?', opts: ['Web Hosting', 'Version Control', 'Database Management', 'Code Execution'], ans: 1 },
    { q: 'Widely used data format for client-server transfer?', opts: ['JSON', 'XML', 'HTML', 'TXT'], ans: 0 },
    { q: 'box-sizing: border-box does what?', opts: ['Includes padding & border in width/height', 'Excludes padding', 'Doubles border', 'Removes borders'], ans: 0 },
    { q: 'HTML tag for hyperlink?', opts: ['<a>', '<link>', '<href>', '<url>'], ans: 0 },
    { q: 'CSS property for bold text?', opts: ['font-weight', 'text-decoration', 'font-style', 'text-weight'], ans: 0 },
    { q: 'JS single-line comment syntax?', opts: ['<!-- -->', '/* */', '//', "'"], ans: 2 },
    { q: 'Convert JSON string to JS object?', opts: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'JSON.convert()'], ans: 1 },
    { q: 'Default HTTP port?', opts: ['443', '80', '8080', '3000'], ans: 1 },
    { q: 'MongoDB database type?', opts: ['Relational (SQL)', 'NoSQL (Document-based)', 'Graph Database', 'Flat File'], ans: 1 },
    { q: 'CSS Grid property for column definitions?', opts: ['grid-template-columns', 'grid-column-gap', 'grid-auto-flow', 'flex-direction'], ans: 0 },
    { q: 'NPM stands for?', opts: ['Node Package Manager', 'New Programming Model', 'Network Protocol Module', 'National Performance Metric'], ans: 0 },
    { q: 'Remove last array element in JS?', opts: ['shift()', 'pop()', 'slice()', 'splice()'], ans: 1 },
    { q: 'HTML tag for unordered list?', opts: ['<ol>', '<li>', '<ul>', '<list>'], ans: 2 }
];

let fsCurrent = 0;
let fsAnswers = new Array(FS_QUESTIONS.length).fill(null);
let fsTimeLeft = 1200; // 20 mins
let fsTimerInterval = null;
let fsStartTime = null;

function initFullStackTest() {
    fsStartTime = Date.now();
    renderFSQuestion();
    fsTimerInterval = setInterval(() => {
        fsTimeLeft--;
        const mins = Math.floor(fsTimeLeft / 60).toString().padStart(2, '0');
        const secs = (fsTimeLeft % 60).toString().padStart(2, '0');
        document.getElementById('testTimer').textContent = `${mins}:${secs}`;
        if (fsTimeLeft <= 0) { clearInterval(fsTimerInterval); submitFullStackTest(); }
    }, 1000);
}

function renderFSQuestion() {
    const q = FS_QUESTIONS[fsCurrent];
    document.getElementById('questionCounter').textContent = `Question ${fsCurrent + 1} of ${FS_QUESTIONS.length}`;
    document.getElementById('questionText').textContent = `${fsCurrent + 1}. ${q.q}`;

    const optsBox = document.getElementById('optionsContainer');
    optsBox.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.opts.forEach((opt, idx) => {
        const isSelected = fsAnswers[fsCurrent] === idx;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `option-btn ${isSelected ? 'selected' : ''}`;

        const badge = document.createElement('div');
        badge.className = 'option-badge';
        badge.textContent = letters[idx];

        const textSpan = document.createElement('div');
        textSpan.className = 'option-text';
        textSpan.textContent = opt;

        const radioCheck = document.createElement('div');
        radioCheck.className = 'option-radio';
        if (isSelected) {
            radioCheck.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        }

        btn.appendChild(badge);
        btn.appendChild(textSpan);
        btn.appendChild(radioCheck);

        btn.onclick = () => { fsAnswers[fsCurrent] = idx; renderFSQuestion(); };
        optsBox.appendChild(btn);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    prevBtn.disabled = fsCurrent === 0;

    if (fsCurrent === FS_QUESTIONS.length - 1) {
        nextBtn.innerHTML = `
            Submit Test
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        `;
    } else {
        nextBtn.innerHTML = `
            Next Question
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        `;
    }
}

function nextQuestion() {
    if (fsCurrent < FS_QUESTIONS.length - 1) { fsCurrent++; renderFSQuestion(); }
    else submitFullStackTest();
}

function prevQuestion() {
    if (fsCurrent > 0) { fsCurrent--; renderFSQuestion(); }
}

async function submitFullStackTest() {
    clearInterval(fsTimerInterval);
    let correct = 0, wrong = 0;

    FS_QUESTIONS.forEach((q, idx) => {
        if (fsAnswers[idx] === q.ans) correct++;
        else wrong++;
    });

    const timeTakenSecs = Math.round((Date.now() - (fsStartTime || Date.now())) / 1000);
    const timeMins = Math.floor(timeTakenSecs / 60);
    const timeSecs = timeTakenSecs % 60;
    const percentage = Math.round((correct / FS_QUESTIONS.length) * 100);

    // Determine result message
    const badgeEl = document.getElementById('congratsBadge');
    const headingEl = document.getElementById('congratsText');
    const subEl = document.getElementById('congratsSubText');

    if (percentage >= 80) {
        badgeEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>';
        headingEl.textContent = 'Outstanding Achievement!';
        headingEl.style.color = '#16a34a'; subEl.textContent = 'Superior mastery across Full-Stack concepts!';
    } else if (percentage >= 50) {
        badgeEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
        headingEl.textContent = 'Well Done! Good Performance!';
        headingEl.style.color = '#4f46e5'; subEl.textContent = 'Solid attempt! Keep reviewing to reach 90%+.';
    } else {
        badgeEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
        headingEl.textContent = 'Good Practice! Keep Learning!';
        headingEl.style.color = '#ea580c'; subEl.textContent = 'Review your incorrect answers and retake.';
    }

    document.getElementById('repTotal').textContent = FS_QUESTIONS.length;
    document.getElementById('repTime').textContent = `${timeMins}m ${timeSecs}s`;
    document.getElementById('repCorrect').textContent = correct;
    document.getElementById('repWrong').textContent = wrong;
    document.getElementById('repPercentage').textContent = `${percentage}%`;
    document.getElementById('repProgressBar').style.width = `${percentage}%`;

    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';

    // Always record locally so dashboard updates in real time immediately
    try {
        const newRecord = {
            _id: 'test_' + Date.now(),
            testTitle: 'Full Stack Mock Test (30 Qs)',
            subject: 'fullstack',
            totalScore: correct,
            score: correct,
            totalQuestions: FS_QUESTIONS.length,
            accuracy: percentage,
            status: percentage >= 50 ? 'Pass' : 'Fail',
            date: 'Today',
            createdAt: new Date().toISOString()
        };
        const hist = JSON.parse(localStorage.getItem('testHistory') || '[]');
        hist.unshift(newRecord);
        localStorage.setItem('testHistory', JSON.stringify(hist.slice(0, 30)));
    } catch (err) {
        console.warn('[MockTests] Local storage update failed:', err);
    }

    // Submit to API
    try {
        await ApiService.submitTestResult({
            subject: 'javascript',
            testTitle: 'Full Stack Mock Test (30 Qs)',
            score: correct,
            totalQuestions: FS_QUESTIONS.length,
            timeTakenSeconds: timeTakenSecs,
            accuracy: percentage
        });
    } catch (e) {
        console.warn('[MockTests] Backend sync note:', e.message);
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
renderCatalogTests();
renderFSQuestion();
