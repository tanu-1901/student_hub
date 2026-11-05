document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const passwordInput = document.getElementById("regPassword");
    const roleInput = document.getElementById("regRole");
    const streamInput = document.getElementById("regStream");
    const classInput = document.getElementById("regClass");
    const parentMobileInput = document.getElementById("regParentMobile");
    const parentEmailInput = document.getElementById("regParentEmail");
    const deptInput = document.getElementById("regDept");
    const desigInput = document.getElementById("regDesignation");
    const registerMessage = document.getElementById("registerMessage");
    const registerBtn = document.getElementById("registerBtn");
    const regBtnText = document.getElementById("regBtnText");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearMessages();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleInput.value || "student";

        if (!name || !email || !password) {
            showMessage("Please fill in all mandatory fields.", true);
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters long.", true);
            return;
        }

        const payload = {
            name,
            email,
            password,
            role,
        };

        if (role === "student") {
            const parentMobile = parentMobileInput.value.trim();
            const parentEmail = parentEmailInput.value.trim();

            if (!parentMobile || !parentEmail) {
                showMessage("Parent Mobile Number and Parent Email are required for student registration.", true);
                return;
            }

            payload.stream = streamInput.value;
            payload.classOrYear = classInput.value.trim() || "12th Standard";
            payload.parentMobile = parentMobile;
            payload.parentEmail = parentEmail;
        } else {
            payload.department = deptInput ? deptInput.value.trim() : "Engineering";
            payload.designation = desigInput ? desigInput.value.trim() : "Faculty Instructor";
        }

        registerBtn.disabled = true;
        regBtnText.textContent = "Creating Account...";

        try {
            const response = await ApiService.register(payload);

            if (response && response.success) {
                ApiService.setToken(response.token);
                ApiService.setCurrentUser(response.user);

                showMessage("Account created successfully! Redirecting to your dashboard...", false);

                setTimeout(() => {
                    if (response.user.role === "teacher") {
                        window.location.href = "teacher-dashboard.html";
                    } else {
                        window.location.href = "dashboard.html";
                    }
                }, 1000);
            } else {
                showMessage(response ? response.message : "Failed to register account.", true);
                registerBtn.disabled = false;
                regBtnText.textContent = role === "teacher" ? "Create Teacher Account →" : "Create Student Account →";
            }
        } catch (err) {
            console.error("API registration error:", err);
            showMessage(err.message || "Unable to connect to registration server. Please check your network and try again.", true);
            registerBtn.disabled = false;
            regBtnText.textContent = role === "teacher" ? "Create Teacher Account →" : "Create Student Account →";
        }
    });

    function showMessage(msg, isError = false) {
        registerMessage.style.display = "block";
        if (isError) {
            registerMessage.style.backgroundColor = "#fee2e2";
            registerMessage.style.color = "#991b1b";
            registerMessage.style.borderColor = "#fecaca";
        } else {
            registerMessage.style.backgroundColor = "#dcfce7";
            registerMessage.style.color = "#166534";
            registerMessage.style.borderColor = "#bbf7d0";
        }
        registerMessage.textContent = msg;
    }

    function clearMessages() {
        registerMessage.style.display = "none";
        registerMessage.textContent = "";
    }
});
