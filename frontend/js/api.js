/**
 * StudentPro Central API Client & Session Manager
 * Handles JWT tokens, role verification, and backend communications
 */

// Dynamically detect API origin so it works seamlessly on port 8000, 5000, or any host
const API_BASE = (window.location && window.location.protocol.startsWith('http'))
    ? `${window.location.origin}/api`
    : `http://localhost:8000/api`;

const ApiService = {
    // ==========================================
    // TOKEN & LOCAL SESSION STORAGE
    // ==========================================
    getToken() {
        return localStorage.getItem('studentpro_token');
    },

    setToken(token) {
        localStorage.setItem('studentpro_token', token);
    },

    getCurrentUser() {
        const raw = localStorage.getItem('studentpro_user');
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        localStorage.setItem('studentpro_user', JSON.stringify(user));
        localStorage.setItem('studentLoggedIn', 'true');
        localStorage.setItem('studentEmail', user.email);
        localStorage.setItem('studentName', user.name);
        localStorage.setItem('userRole', user.role || 'student');
    },

    clearSession() {
        localStorage.removeItem('studentpro_token');
        localStorage.removeItem('studentpro_user');
        localStorage.removeItem('studentLoggedIn');
        localStorage.removeItem('studentEmail');
        localStorage.removeItem('studentName');
        localStorage.removeItem('userRole');
    },

    logout() {
        this.clearSession();
        window.location.href = 'index.html';
    },

    // ==========================================
    // AUTH GUARD ROUTE CHECKER
    // ==========================================
    checkAuth(requiredRole = null) {
        const token = this.getToken();
        const user = this.getCurrentUser();

        if (!token || !user) {
            window.location.href = 'index.html';
            return null;
        }

        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
            alert(`Access Restricted: This section requires a '${requiredRole}' role.`);
            if (user.role === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
            return null;
        }

        return user;
    },

    // ==========================================
    // BASE FETCH WITH JWT
    // ==========================================
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            
            // Check for unauthorized / expired token
            if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
                this.clearSession();
                window.location.href = 'index.html';
                throw new Error('Session expired. Please log in again.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn(`[API Request Error] ${endpoint}:`, error.message);
            throw error;
        }
    },

    // ==========================================
    // AUTHENTICATION APIS
    // ==========================================
    async login(email, password, role) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        });
    },

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async getProfile() {
        return await this.request('/auth/me', { method: 'GET' });
    },

    // ==========================================
    // TEST & QUESTION APIS
    // ==========================================
    async getSubjects() {
        return await this.request('/tests/subjects', { method: 'GET' });
    },

    async getSubjectQuestions(subject) {
        return await this.request(`/tests/subjects/${subject}`, { method: 'GET' });
    },

    async submitTestResult(testData) {
        return await this.request('/tests/submit', {
            method: 'POST',
            body: JSON.stringify(testData),
        });
    },

    async getTestHistory(studentId = null) {
        const query = studentId ? `?studentId=${studentId}` : '';
        return await this.request(`/tests/history${query}`, { method: 'GET' });
    },

    // ==========================================
    // REAL-TIME STUDY TRACKING APIS
    // ==========================================
    async logStudySession(durationMinutes, subject = 'Self Study') {
        return await this.request('/study/log', {
            method: 'POST',
            body: JSON.stringify({ durationMinutes, subject }),
        });
    },

    async getStudyAnalytics(studentId = null) {
        const query = studentId ? `?studentId=${studentId}` : '';
        return await this.request(`/study/analytics${query}`, { method: 'GET' });
    },

    // ==========================================
    // TEACHER PANEL APIS
    // ==========================================
    async getTeacherStreams() {
        return await this.request('/teacher/streams', { method: 'GET' });
    },

    async getStudentsByStream(streamName) {
        return await this.request(`/teacher/streams/${encodeURIComponent(streamName)}/students`, { method: 'GET' });
    },

    async getStudentProgressForTeacher(studentId) {
        return await this.request(`/teacher/students/${studentId}/progress`, { method: 'GET' });
    },

    // ==========================================
    // PDF REPORT & SMTP EMAIL APIS
    // ==========================================
    async sendReportEmail(studentId = null, parentEmail = null) {
        return await this.request('/reports/send-email', {
            method: 'POST',
            body: JSON.stringify({ studentId, parentEmail }),
        });
    },

    downloadPdfReportUrl(studentId = null) {
        const token = this.getToken();
        const studentParam = studentId ? `&studentId=${studentId}` : '';
        return `${API_BASE}/reports/download-pdf?token=${token}${studentParam}`;
    },
};

// Make available globally
window.ApiService = ApiService;
