document.addEventListener("DOMContentLoaded", () => {
    // 1. Auth Guard Check
    const isLoggedIn = localStorage.getItem("studentLoggedIn");
    const userEmail = localStorage.getItem("studentEmail");

    if (!isLoggedIn) {
        window.location.href = "index.html";
        return;
    }

    // 2. Set Dynamic User Information
    if (userEmail) {
        document.getElementById("userEmailDisplay").textContent = userEmail;
        const namePart = userEmail.split("@")[0];
        document.getElementById("studentName").textContent =
            namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    // 3. Logout Handler
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("studentLoggedIn");
        localStorage.removeItem("studentEmail");
        window.location.href = "index.html";
    });

    // 4. Load Metrics & Tests History from LocalStorage
    loadDashboardMetrics();
});

function loadDashboardMetrics() {
    const testHistory = JSON.parse(localStorage.getItem("testHistory")) || [];

    const totalTests = testHistory.length;
    document.getElementById("statTotalTests").textContent = totalTests;

    if (totalTests > 0) {
        // Calculate total average score percentage
        const totalPercentage = testHistory.reduce((acc, curr) => {
            const perc = (curr.totalScore / curr.totalQuestions) * 100;
            return acc + perc;
        }, 0);

        const avgScore = Math.round(totalPercentage / totalTests);
        document.getElementById("statAvgScore").textContent = `${avgScore}%`;

        // Calculate dynamic streak and consistency score
        document.getElementById("statStreak").textContent = `${totalTests} Days`;
        document.getElementById("statConsistency").textContent = avgScore >= 75 ? "High" : "Moderate";

        // Render Recent Activity List
        renderRecentTests(testHistory);
    }
}

function renderRecentTests(tests) {
    const listContainer = document.getElementById("recentTestsList");
    listContainer.innerHTML = "";

    // Take last 4 tests (most recent first)
    const recent = tests.slice(-4).reverse();

    recent.forEach((t) => {
        const li = document.createElement("li");
        li.className = "activity-item";
        li.innerHTML = `
            <div>
                <strong>${t.testTitle || "Mock Test"}</strong>
                <br><small style="color: #6b7280">${t.date}</small>
            </div>
            <div>
                <span style="font-weight: bold; color: #4f46e5;">
                    ${t.totalScore}/${t.totalQuestions}
                </span>
            </div>
        `;
        listContainer.appendChild(li);
    });
}