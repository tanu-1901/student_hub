/**
 * dashboard.js — Student Dashboard Controller
 * Loads metrics, recent test history, and user profile from API with localStorage sync
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ── 1. Auth Guard (student role required) ───────────────────────────────
    const user = ApiService.checkAuth('student');
    if (!user) return; // redirected by checkAuth

    // ── 2. Set User Display Info ─────────────────────────────────────────────
    const nameEl = document.getElementById('studentName');
    const emailEl = document.getElementById('userEmailDisplay');
    const avatarEl = document.getElementById('userAvatarLetter');
    if (nameEl) nameEl.textContent = user.name || user.email.split('@')[0];
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = (user.name || user.email || 'S').charAt(0).toUpperCase();

    // ── 3. Logout Handler ────────────────────────────────────────────────────
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => ApiService.logout());
    }

    // ── 4. Load Dashboard Metrics & History ──────────────────────────────────
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const [historyRes, analyticsRes] = await Promise.allSettled([
            ApiService.getTestHistory(),
            ApiService.getStudyAnalytics()
        ]);

        const histData = historyRes.status === 'fulfilled' ? historyRes.value : null;
        const analyticsData = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null;

        // 1. Get tests returned by API (support both .tests and .history properties)
        const apiTests = (histData && histData.success) ? (histData.tests || histData.history || []) : [];

        // 2. Get locally recorded tests (from recent test sessions)
        const localTests = getStoredLocalTests();

        // 3. Merge both so any completed test is counted immediately
        const tests = mergeTestHistories(apiTests, localTests);

        renderMetrics(tests, analyticsData);
        renderRecentTests(tests);

    } catch (err) {
        console.warn('[Dashboard] API unavailable, using localStorage fallback:', err.message);
        const tests = getFallbackHistory();
        renderMetrics(tests, null);
        renderRecentTests(tests);
    }
}

function getStoredLocalTests() {
    const stored = localStorage.getItem('testHistory');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
    }
    return [];
}

function mergeTestHistories(apiList, localList) {
    const map = new Map();

    // Add local tests first
    (localList || []).forEach(t => {
        const key = t._id || `${t.testTitle || t.subject}_${t.createdAt || t.date}_${t.totalScore ?? t.score}`;
        map.set(key, t);
    });

    // Add API tests
    (apiList || []).forEach(t => {
        const key = t._id || `${t.testTitle || t.subject}_${t.createdAt || t.date}_${t.totalScore ?? t.score}`;
        if (!map.has(key)) {
            map.set(key, t);
        }
    });

    const combined = Array.from(map.values());
    if (combined.length === 0) {
        return getFallbackHistory();
    }
    return combined;
}

function getFallbackHistory() {
    const stored = localStorage.getItem('testHistory');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
    }
    // Seed initial demo data for first-time onboarding
    const demo = [
        { testTitle: 'Full Stack Mock Test #1', totalScore: 28, score: 28, totalQuestions: 30, date: 'Today', subject: 'javascript', createdAt: new Date().toISOString() },
        { testTitle: 'HTML5 Fundamentals Test', totalScore: 5, score: 5, totalQuestions: 5, date: 'Yesterday', subject: 'html', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { testTitle: 'CSS3 Styling & Layouts', totalScore: 4, score: 4, totalQuestions: 5, date: '2 days ago', subject: 'css', createdAt: new Date(Date.now() - 172800000).toISOString() }
    ];
    localStorage.setItem('testHistory', JSON.stringify(demo));
    return demo;
}

function renderMetrics(tests, analytics) {
    const totalTests = tests.length;

    const statTests = document.getElementById('statTotalTests');
    if (statTests) statTests.textContent = totalTests;

    if (totalTests > 0) {
        const totalPerc = tests.reduce((acc, t) => {
            const score = t.totalScore ?? t.score ?? 0;
            const total = t.totalQuestions ?? 1;
            return acc + (score / total) * 100;
        }, 0);
        const avg = Math.round(totalPerc / totalTests);

        const statAvg = document.getElementById('statAvgScore');
        if (statAvg) statAvg.textContent = `${avg}%`;

        const streak = analytics?.activeStreakDays ?? Math.min(totalTests, 7);
        const statStreak = document.getElementById('statStreak');
        if (statStreak) statStreak.textContent = `${streak} Days`;

        const rating = avg >= 85 ? 'Superior' : avg >= 70 ? 'High' : avg >= 50 ? 'Moderate' : 'Needs Practice';
        const statCog = document.getElementById('statConsistency');
        if (statCog) statCog.textContent = rating;
    }
}

function renderRecentTests(tests) {
    const listContainer = document.getElementById('recentTestsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (tests.length === 0) {
        listContainer.innerHTML = '<li class="activity-item empty-state">No tests recorded yet. Launch your first mock test to see performance trends.</li>';
        return;
    }

    // Sort newest first
    const sorted = [...tests].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.date || 0).getTime();
        const timeB = new Date(b.createdAt || b.date || 0).getTime();
        return timeB - timeA;
    });

    const recent = sorted.slice(0, 5);
    recent.forEach(t => {
        const score = t.totalScore ?? t.score ?? 0;
        const total = t.totalQuestions ?? 0;
        const accuracy = total > 0 ? Math.round((score / total) * 100) : (t.accuracy || 0);
        const isPass = accuracy >= 50;
        const dateStr = t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recently');

        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div class="activity-item-left">
                <span class="activity-badge ${isPass ? 'pass' : 'fail'}">${accuracy}%</span>
                <div>
                    <strong style="color: #0f172a;">${t.testTitle || t.subject || 'Mock Test'}</strong>
                    <br><small style="color:#64748b">${dateStr}</small>
                </div>
            </div>
            <div>
                <span style="font-weight:700;color:#4f46e5;background:#eef2ff;padding:4px 10px;border-radius:9999px;font-size:12px;">${score} / ${total} Correct</span>
            </div>
        `;
        listContainer.appendChild(li);
    });
}
