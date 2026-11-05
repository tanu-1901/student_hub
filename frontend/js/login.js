document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");
    const buttonText = document.getElementById("buttonText");
    const roleInput = document.getElementById("selectedRole");

    // =============================
    // SHOW / HIDE PASSWORD TOGGLE
    // =============================
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.textContent = "Hide";
            } else {
                passwordInput.type = "password";
                togglePassword.textContent = "Show";
            }
        });
    }

    // =============================
    // FORM SUBMISSION & API AUTH
    // =============================
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleInput ? roleInput.value : "student";
        let isValid = true;

        // Email validation
        if (email === "") {
            emailError.textContent = "Please enter your email address.";
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailError.textContent = "Please enter a valid email address.";
            isValid = false;
        }

        // Password validation
        if (password === "") {
            passwordError.textContent = "Please enter your password.";
            isValid = false;
        } else if (password.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters.";
            isValid = false;
        }

        if (!isValid) return;

        loginButton.disabled = true;
        buttonText.textContent = "Authenticating...";

        try {
            // Call Backend API
            const response = await ApiService.login(email, password, role);

            if (response && response.success) {
                ApiService.setToken(response.token);
                ApiService.setCurrentUser(response.user);

                loginMessage.style.display = "block";
                loginMessage.style.backgroundColor = "#dcfce7";
                loginMessage.style.color = "#166534";
                loginMessage.style.borderColor = "#bbf7d0";
                loginMessage.textContent = `Welcome back, ${response.user.name}! Redirecting...`;

                setTimeout(() => {
                    if (response.user.role === "teacher") {
                        window.location.href = "teacher-dashboard.html";
                    } else {
                        window.location.href = "dashboard.html";
                    }
                }, 600);
            } else {
                showError(response ? response.message : "Invalid credentials.");
            }
        } catch (apiError) {
            console.warn("Backend API request error:", apiError);

            // Allow offline demo credentials fallback only if matching demo credentials
            const isDemoStudent = (email.toLowerCase() === "student@gmail.com" && (password === "123456" || password === "password123"));
            const isDemoTeacher = (email.toLowerCase() === "teacher@gmail.com" && (password === "123456" || password === "password123"));

            if (role === "teacher" && isDemoTeacher) {
                const teacherUser = {
                    id: "mem_teacher_01",
                    name: "Prof. Rajesh Sharma",
                    email: email,
                    role: "teacher",
                    department: "Computer Science & Engineering",
                    designation: "Head of Department (HOD)",
                };
                ApiService.setToken("demo_token_teacher");
                ApiService.setCurrentUser(teacherUser);
                setTimeout(() => { window.location.href = "teacher-dashboard.html"; }, 500);
            } else if (role === "student" && isDemoStudent) {
                const studentUser = {
                    id: "mem_student_01",
                    name: "Tanu Singh",
                    email: email,
                    role: "student",
                    stream: "Computer Science",
                    rollNumber: "STU-101",
                    classOrYear: "12th Standard",
                    parentMobile: "9876543210",
                    parentEmail: "parent.tanu@gmail.com",
                };
                ApiService.setToken("demo_token_student");
                ApiService.setCurrentUser(studentUser);
                setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
            } else {
                showError("Unable to connect to authentication server or invalid credentials. Please check your email and password.");
            }
        }
    });

    function showError(msg) {
        loginButton.disabled = false;
        buttonText.textContent = roleInput && roleInput.value === "teacher" ? "Sign In to Teacher Panel →" : "Sign In to Dashboard →";
        loginMessage.style.display = "block";
        loginMessage.style.backgroundColor = "#fee2e2";
        loginMessage.style.color = "#991b1b";
        loginMessage.style.borderColor = "#fecaca";
        loginMessage.textContent = msg;
    }

    function isValidEmail(emailStr) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(emailStr);
    }

    function clearErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";
        loginMessage.style.display = "none";
        loginMessage.textContent = "";
    }
});
