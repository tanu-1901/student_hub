// Verification
if (localStorage.getItem("studentLoggedIn") !== "true") {
    window.location.href = "index.html";
}

// Global Questions Bank
const questionBank = [
    {
        id: 1,
        question: "If a speed of a train is 72 km/hr, what is its speed in meters per second (m/s)?",
        options: ["15 m/s", "20 m/s", "25 m/s", "18 m/s"],
        answer: 1
    },
    {
        id: 2,
        question: "Find the odd one out: 3, 5, 7, 12, 13, 17, 19",
        options: ["12", "13", "17", "19"],
        answer: 0
    },
    {
        id: 3,
        question: "Which word is an antonym for 'OMNIPRESENT'?",
        options: ["Ubiquitous", "Absent", "Eternal", "Global"],
        answer: 1
    },
    {
        id: 4,
        question: "Complete the series: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "48"],
        answer: 2
    },
    {
        id: 5,
        question: "Who is known as the Father of Artificial Intelligence?",
        options: ["Alan Turing", "John McCarthy", "Charles Babbage", "Geoffrey Hinton"],
        answer: 1
    }
];

// Context Initialization
const testName = localStorage.getItem("selectedPaper") || localStorage.getItem("activeTestId") || "Practice Test";
document.getElementById("paperTitle").textContent = testName;

let currentIndex = 0;
let userAnswers = {}; // Map question index to chosen option index
let timeRemaining = 30 * 60; // 30 mins in seconds

// UI Element Refs
const qCounter = document.getElementById("questionCounter");
const qText = document.getElementById("questionText");
const optionsGroup = document.getElementById("optionsContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const clearBtn = document.getElementById("clearBtn");
const paletteGrid = document.getElementById("paletteGrid");

// Render Single Question View
function renderQuestion() {
    const qData = questionBank[currentIndex];
    qCounter.textContent = `Question ${currentIndex + 1} of ${questionBank.length}`;
    qText.textContent = qData.question;
    optionsGroup.innerHTML = "";

    qData.options.forEach((optText, optIdx) => {
        const item = document.createElement("div");
        item.className = `option-item ${userAnswers[currentIndex] === optIdx ? 'selected' : ''}`;
        item.innerHTML = `
            <input type="radio" name="opt" ${userAnswers[currentIndex] === optIdx ? 'checked' : ''}>
            <span>${optText}</span>
        `;
        item.onclick = () => selectOption(optIdx);
        optionsGroup.appendChild(item);
    });

    // Control States
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === questionBank.length - 1 ? "Finish →" : "Next →";

    updatePalette();
}

function selectOption(optIdx) {
    userAnswers[currentIndex] = optIdx;
    renderQuestion();
}

clearBtn.onclick = () => {
    delete userAnswers[currentIndex];
    renderQuestion();
};

prevBtn.onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
};

nextBtn.onclick = () => {
    if (currentIndex < questionBank.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        submitTest();
    }
};

// Render Sidebar Navigation Palette
function updatePalette() {
    paletteGrid.innerHTML = "";
    questionBank.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.className = `p-btn ${idx === currentIndex ? 'active' : ''} ${userAnswers[idx] !== undefined ? 'answered' : ''}`;
        btn.textContent = idx + 1;
        btn.onclick = () => {
            currentIndex = idx;
            renderQuestion();
        };
        paletteGrid.appendChild(btn);
    });
}

// Countdown Engine
const timerInterval = setInterval(() => {
    timeRemaining--;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById("timeDisplay").textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        submitTest();
    }
}, 1000);

// Process Results
document.getElementById("submitTestBtn").onclick = submitTest;

function submitTest() {
    clearInterval(timerInterval);

    let score = 0;
    questionBank.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) {
            score++;
        }
    });

    const results = {
        testTitle: testName,
        totalQuestions: questionBank.length,
        score: score,
        accuracy: Math.round((score / questionBank.length) * 100)
    };

    localStorage.setItem("lastTestResult", JSON.stringify(results));

    // SYNC INTO DASHBOARD HISTORY
    let dashHistory = JSON.parse(localStorage.getItem("testHistory")) || [];
    dashHistory.unshift({
        testTitle: testName,
        totalScore: score,
        totalQuestions: questionBank.length,
        date: "Today"
    });
    localStorage.setItem("testHistory", JSON.stringify(dashHistory));

    alert(`Test Submitted Successfully!\nScore: ${score}/${questionBank.length} (${results.accuracy}%)`);
    window.location.href = "dashboard.html";
}

// Init
renderQuestion();