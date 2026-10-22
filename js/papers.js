document.addEventListener("DOMContentLoaded", () => {
    const practicePapers = [
        // FRONTEND PAPERS
        { 
            id: "html-1", 
            title: "HTML5 Fundamentals", 
            subject: "html", 
            description: "Test your knowledge on HTML tags, forms, and semantic markup.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Easy", 
            iconClass: "icon-orange", 
            iconText: "H" 
        },
        { 
            id: "css-1", 
            title: "CSS3 Styling & Layouts", 
            subject: "css", 
            description: "Master Flexbox, Grid, animations, and responsive web design.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Medium", 
            iconClass: "icon-blue", 
            iconText: "C" 
        },
        { 
            id: "js-1", 
            title: "JavaScript Core & ES6+", 
            subject: "js", 
            description: "Solve questions on DOM manipulation, closures, and promises.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Hard", 
            iconClass: "icon-purple", 
            iconText: "JS" 
        },
        { 
            id: "react-1", 
            title: "React JS Basics", 
            subject: "react", 
            description: "Test components, props, hooks, and virtual DOM concepts.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Medium", 
            iconClass: "icon-green", 
            iconText: "R" 
        },
        
        // BACKEND PAPERS
        { 
            id: "node-1", 
            title: "Node.js Core Concepts", 
            subject: "node", 
            description: "Test Event Loop, Asynchronous programming, Modules, and File System.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Medium", 
            iconClass: "icon-green", 
            iconText: "N" 
        },
        { 
            id: "express-1", 
            title: "Express.js Routing & Middleware", 
            subject: "express", 
            description: "Master REST APIs, Middlewares, Routing, and Error Handling.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Medium", 
            iconClass: "icon-purple", 
            iconText: "E" 
        },
        { 
            id: "mongo-1", 
            title: "MongoDB & Mongoose Data Modeling", 
            subject: "mongodb", 
            description: "Test NoSQL Database queries, Aggregation pipelines, and Schemas.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Hard", 
            iconClass: "icon-blue", 
            iconText: "M" 
        },
        { 
            id: "py-1", 
            title: "Python Backend Basics", 
            subject: "python", 
            description: "Solve questions on Python Data Structures, OOPs, and API Basics.", 
            questions: 10, 
            time: "30 Mins", 
            difficulty: "Easy", 
            iconClass: "icon-orange", 
            iconText: "Py" 
        }
    ];

    let activeSubject = "all";
    let searchQuery = "";

    function renderPapers() {
        const grid = document.getElementById("papersGrid");
        const noResults = document.getElementById("noResults");
        if (!grid) return;
        
        grid.innerHTML = "";

        const filtered = practicePapers.filter(paper => {
            const matchesSubject = activeSubject === "all" || paper.subject === activeSubject;
            const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesSearch;
        });

        if (filtered.length === 0) {
            if (noResults) noResults.style.display = "block";
            return;
        }

        if (noResults) noResults.style.display = "none";

        filtered.forEach(paper => {
            const diffClass = paper.difficulty === "Easy" ? "diff-easy" : paper.difficulty === "Medium" ? "diff-medium" : "diff-hard";
            
            const card = document.createElement("div");
            card.className = "paper-card";
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
                        <span>📝 ${paper.questions} Questions</span>
                        <span>⏱ ${paper.time}</span>
                    </div>
                    <button class="start-paper-btn" data-subject="${paper.subject}" data-title="${paper.title}">
                        Start Paper →
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        document.querySelectorAll(".start-paper-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetBtn = e.target.closest(".start-paper-btn");
                const subject = targetBtn.getAttribute("data-subject");
                const title = targetBtn.getAttribute("data-title");
                
                localStorage.setItem("selectedSubject", subject);
                localStorage.setItem("selectedPaper", title);
                
                window.location.href = "test.html";
            });
        });
    }

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeSubject = e.target.dataset.subject;
            renderPapers();
        });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderPapers();
        });
    }

    renderPapers();
});