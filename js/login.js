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

    // Check if already logged in
    if (localStorage.getItem("studentLoggedIn") === "true") {
        window.location.href = "dashboard.html";
        return;
    }

    // =============================
    // SHOW / HIDE PASSWORD TOGGLE
    // =============================
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }
    });

    // =============================
    // FORM SUBMISSION & VALIDATION
    // =============================
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
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

        // Demo credentials validation
        const demoEmail = "student@gmail.com";
        const demoPassword = "123456";

        if (email === demoEmail && password === demoPassword) {
            handleLoginSuccess(email);
        } else {
            loginMessage.style.display = "block";
            loginMessage.textContent = "Invalid email or password. Please try again.";
        }
    });

    // Helper: Regex Email Format Validation
    function isValidEmail(emailStr) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(emailStr);
    }

    // Helper: Reset Field Error States
    function clearErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";
        loginMessage.style.display = "none";
        loginMessage.textContent = "";
    }

    // Helper: Successful Authentication Handler
    function handleLoginSuccess(authenticatedEmail) {
        loginButton.disabled = true;
        buttonText.textContent = "Signing in...";

        // Store session state in LocalStorage
        localStorage.setItem("studentLoggedIn", "true");
        localStorage.setItem("studentEmail", authenticatedEmail);

        // Redirect to Student Dashboard after delay
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    }
});