/**
 * papers.js — Practice Papers Controller
 * Renders subject paper cards with study resource links and API-powered mock tests.
 * Each card has: "Study Notes" (opens free resource) + "Start Mock Test" (API questions)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Auth Guard ───────────────────────────────────────────────────────────
    const user = ApiService.checkAuth('student');
    if (!user) return;

    // Set user display
    const emailEl = document.getElementById('userEmailDisplay');
    if (emailEl) emailEl.textContent = user.email;
    const avatarCircle = document.getElementById('userAvatarCircle');
    if (avatarCircle) avatarCircle.textContent = (user.name || user.email || 'S').charAt(0).toUpperCase();

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => ApiService.logout());

    // ── Paper Definitions with Free Resource Links ───────────────────────────
    const practicePapers = [
        // ── FRONTEND ──────────────────────────────────────────────────────────
        {
            id: 'html-1', title: 'HTML5 Fundamentals', subject: 'html',
            description: 'Test your knowledge on HTML5 tags, semantic elements, forms, and best practices.',
            questions: 5, time: '20 Mins', difficulty: 'Easy',
            iconClass: 'icon-orange', iconText: 'H',
            resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            resourceLabel: 'MDN HTML Docs'
        },
        {
            id: 'css-1', title: 'CSS3 Styling & Layouts', subject: 'css',
            description: 'Master Flexbox, CSS Grid, animations, transitions, and responsive web design.',
            questions: 5, time: '25 Mins', difficulty: 'Medium',
            iconClass: 'icon-blue', iconText: 'C',
            resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
            resourceLabel: 'MDN CSS Docs'
        },
        {
            id: 'js-1', title: 'JavaScript Core & ES6+', subject: 'javascript',
            description: 'Solve questions on DOM manipulation, closures, promises, and async/await patterns.',
            questions: 5, time: '30 Mins', difficulty: 'Hard',
            iconClass: 'icon-purple', iconText: 'JS',
            resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
            resourceLabel: 'MDN JavaScript Docs'
        },
        {
            id: 'react-1', title: 'React JS Basics', subject: 'react',
            description: 'Test components, props, hooks (useState/useEffect), and virtual DOM concepts.',
            questions: 5, time: '25 Mins', difficulty: 'Medium',
            iconClass: 'icon-green', iconText: 'R',
            resourceUrl: 'https://react.dev/learn',
            resourceLabel: 'React Official Docs'
        },

        // ── BACKEND ──────────────────────────────────────────────────────────
        {
            id: 'node-1', title: 'Node.js Core Concepts', subject: 'node',
            description: 'Test Event Loop, asynchronous programming, modules (CommonJS/ESM), and File System.',
            questions: 5, time: '25 Mins', difficulty: 'Medium',
            iconClass: 'icon-green', iconText: 'N',
            resourceUrl: 'https://nodejs.org/en/docs',
            resourceLabel: 'Node.js Official Docs'
        },
        {
            id: 'express-1', title: 'Express.js Routing & Middleware', subject: 'express',
            description: 'Master REST APIs, middleware chains, routing, and Express error handling.',
            questions: 5, time: '25 Mins', difficulty: 'Medium',
            iconClass: 'icon-purple', iconText: 'E',
            resourceUrl: 'https://expressjs.com/en/guide/routing.html',
            resourceLabel: 'Express.js Guide'
        },
        {
            id: 'mongo-1', title: 'MongoDB & Mongoose', subject: 'mongodb',
            description: 'Test NoSQL queries, aggregation pipelines, schema design, and indexes.',
            questions: 5, time: '30 Mins', difficulty: 'Hard',
            iconClass: 'icon-blue', iconText: 'M',
            resourceUrl: 'https://www.mongodb.com/docs/manual/',
            resourceLabel: 'MongoDB Manual'
        },
        {
            id: 'py-1', title: 'Python Backend Basics', subject: 'python',
            description: 'Solve questions on Python data structures, OOPs, file I/O, and API basics.',
            questions: 5, time: '25 Mins', difficulty: 'Easy',
            iconClass: 'icon-orange', iconText: 'Py',
            resourceUrl: 'https://docs.python.org/3/tutorial/',
            resourceLabel: 'Python Official Tutorial'
        }
    ];

    let activeSubject = 'all';
    let searchQuery = '';

    // ── Render Papers Grid ───────────────────────────────────────────────────
    function renderPapers() {
        const grid = document.getElementById('papersGrid');
        const noResults = document.getElementById('noResults');
        if (!grid) return;

        grid.innerHTML = '';

        const filtered = practicePapers.filter(paper => {
            const matchesSubject = activeSubject === 'all' || paper.subject === activeSubject;
            const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesSearch;
        });

        if (filtered.length === 0) {
            if (noResults) noResults.style.display = 'block';
            return;
        }
        if (noResults) noResults.style.display = 'none';

        filtered.forEach(paper => {
            const diffClass = paper.difficulty === 'Easy' ? 'diff-easy'
                : paper.difficulty === 'Medium' ? 'diff-medium' : 'diff-hard';

            const card = document.createElement('div');
            card.className = 'paper-card';
            card.innerHTML = `
                <div>
                    <div class="paper-top">
                        <div class="paper-icon ${paper.iconClass}">${paper.iconText}</div>
                        <span class="difficulty-tag ${diffClass}">${paper.difficulty}</span>
                    </div>
                    <h2>${paper.title}</h2>
                    <p>${paper.description}</p>
                </div>
                <div>
                    <div class="paper-meta">
                        <span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            ${paper.questions} Questions
                        </span>
                        <span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${paper.time}
                        </span>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                        <a href="${paper.resourceUrl}" target="_blank" rel="noopener noreferrer"
                           class="paper-btn-notes" title="Open free ${paper.resourceLabel}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            Study Notes
                        </a>
                        <button class="paper-btn-test start-paper-btn"
                            data-subject="${paper.subject}"
                            data-id="${paper.id}"
                            data-title="${paper.title}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Start Test
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach "Start Mock Test" handlers
        grid.querySelectorAll('.start-paper-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                const b = e.currentTarget;
                const subject = (b.dataset.subject || '').toLowerCase().trim();
                const title = b.dataset.title;
                b.innerHTML = 'Starting...';
                b.disabled = true;

                localStorage.setItem('activeTestId', subject);
                localStorage.setItem('selectedSubject', subject);
                localStorage.setItem('selectedPaper', title);

                // Use centralized question bank for exact subject questions
                if (typeof QUESTION_BANKS !== 'undefined' && QUESTION_BANKS[subject]) {
                    const qs = QUESTION_BANKS[subject].questions.map((q, idx) => ({
                        id: idx + 1,
                        question: q.question,
                        options: q.options,
                        explanation: q.explanation,
                        correctAnswerIndex: q.correctAnswerIndex
                    }));
                    localStorage.setItem('activeTestQuestions', JSON.stringify(qs));
                }

                try {
                    const res = await ApiService.getSubjectQuestions(subject);
                    if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
                        localStorage.setItem('activeTestQuestions', JSON.stringify(res.questions));
                    }
                } catch (err) {
                    console.warn('[Papers] API questions unavailable — using built-in bank');
                }

                window.location.href = 'test.html';
            });
        });
    }

    // ── Filter Buttons ───────────────────────────────────────────────────────
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeSubject = e.target.dataset.subject;
            renderPapers();
        });
    });

    // ── Search ───────────────────────────────────────────────────────────────
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchQuery = e.target.value.trim();
            renderPapers();
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    renderPapers();
});
