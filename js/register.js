document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const passwordInput = document.getElementById("regPassword");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const registerMessage = document.getElementById("registerMessage");
    const registerBtn = document.getElementById("registerBtn");
    const regBtnText = document.getElementById("regBtnText");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let valid = true;

        if (name === "") {
            nameError.textContent = "Name is required.";
            valid = false;
        }

        if (email === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Enter a valid email.";
            valid = false;
        }

        if (password.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters.";
            valid = false;
        }

        if (!valid) return;

        // Save session credentials and redirect directly to Student Dashboard
        localStorage.setItem("studentLoggedIn", "true");
        localStorage.setItem("studentEmail", email);
        localStorage.setItem("studentName", name);

        registerBtn.disabled = true;
        regBtnText.textContent = "Creating Account...";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    });

    function clearErrors() {
        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        registerMessage.style.display = "none";
    }
});