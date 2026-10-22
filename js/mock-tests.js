// Auth Check
if (localStorage.getItem("studentLoggedIn") !== "true") {
    window.location.href = "index.html";
}

// Student Info Setup
const studentEmail = localStorage.getItem("studentEmail");
if (studentEmail) {
    const rawName = studentEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = rawName.replace(/\b\w/g, char => char.toUpperCase());
    
    document.getElementById("studentName").textContent = formattedName;
    document.getElementById("avatarIcon").textContent = formattedName.charAt(0);
}

// Logout & Menu Handlers
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("studentEmail");
    window.location.href = "index.html";
});

document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// Mock Tests Data
const mockTests = [
    {
        id: "reasoning-1",
        title: "Logical Reasoning - Level 1",
        category: "reasoning",
        description: "Practice pattern matching, series, and analytical problem-solving skills.",
        questions: 5,
        duration: "30 Mins",
        difficulty: "Easy"
    },
    {
        id: "aptitude-1",
        title: "Quantitative Aptitude - Basic",
        category: "aptitude",
        description: "Covers percentages, ratios, simple equations, and arithmetic problems.",
        questions: 5,
        duration: "30 Mins",
        difficulty: "Medium"
    },
    {
        id: "english-1",
        title: "Verbal Ability & Grammar",
        category: "english",
        description: "Test vocabulary, sentence correction, and reading comprehension skills.",
        questions: 5,
        duration: "20 Mins",
        difficulty: "Easy"
    },
    {
        id: "gk-1",
        title: "General Awareness 2026",
        category: "gk",
        description: "Current affairs, basic science, history, and general knowledge questions.",
        questions: 5,
        duration: "15 Mins",
        difficulty: "Medium"
    }
];

// Render Function
function renderTests(filter = "all") {
    const grid = document.getElementById("testsGrid");
    grid.innerHTML = "";

    const filtered = filter === "all" 
        ? mockTests 
        : mockTests.filter(t => t.category === filter);

    filtered.forEach(test => {
        const card = document.createElement("div");
        card.className = "test-card";
        card.innerHTML = `
            <div>
                <span class="test-badge badge-${test.category}">
                    ${test.category.toUpperCase()}
                </span>
                <h3>${test.title}</h3>
                <p>${test.description}</p>
            </div>
            <div>
                <div class="test-meta">
                    <span>⏱ ${test.duration}</span>
                    <span>❓ ${test.questions} Qs</span>
                    <span>📊 ${test.difficulty}</span>
                </div>
                <button class="start-test-btn" onclick="launchTest('${test.id}')">
                    Start Test →
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function launchTest(testId) {
    // Stores selected test ID and redirects to quiz interface
    localStorage.setItem("activeTestId", testId);
    window.location.href = "test.html";
}

// Category Filter Listener
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderTests(e.target.dataset.category);
    });
});

// Initial Render
renderTests();