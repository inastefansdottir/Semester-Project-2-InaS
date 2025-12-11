import { registerUser } from "./api.js";

// Form + input fields
const registerForm = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Error message containers
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const errorMsg = document.getElementById("errorMessage");

function clearFieldError(inputElement, errorElement) {
  inputElement.classList.remove("outline-error");
  inputElement.classList.add("outline-primary");
  errorElement.textContent = "";
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hidden");
}

// Live validation clearing
nameInput.addEventListener("input", () =>
  clearFieldError(nameInput, nameError)
);

emailInput.addEventListener("input", () =>
  clearFieldError(emailInput, emailError)
);

passwordInput.addEventListener("input", () =>
  clearFieldError(passwordInput, passwordError)
);

async function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  const errorIcon =
    '<ion-icon name="alert-circle" class="alert-circle"></ion-icon>';
  let hasError = false;

  // Clear previous messages
  nameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";

  // Simple input-level required checks
  if (!formFields.name) {
    nameError.textContent = "Username is required";
    nameInput.classList.add("outline-error");
    nameInput.classList.remove("outline-primary");
    hasError = true;
  }

  if (!formFields.email) {
    emailError.textContent = "Email is required";
    emailInput.classList.add("outline-error");
    emailInput.classList.remove("outline-primary");
    hasError = true;
  }

  if (!formFields.password) {
    passwordError.textContent = "Password is required";
    passwordInput.classList.add("outline-error");
    passwordInput.classList.remove("outline-primary");
    hasError = true;
  }

  // Username restrictions
  const nameRegex = /^[a-zA-Z0-9_]+$/;
  if (formFields.name && !nameRegex.test(formFields.name)) {
    nameInput.classList.add("outline-error");
    nameInput.classList.remove("outline-primary");
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="error-message">${errorIcon} Username can only contain letters, numbers, and underscores. No spaces or special characters allowed.</p>`;
    hasError = true;
  }

  // Email validation
  if (formFields.email && !emailInput.checkValidity()) {
    emailInput.classList.add("outline-error");
    emailInput.classList.remove("outline-primary");
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="error-message">${errorIcon} ${emailInput.validationMessage}</p>`;
    hasError = true;
  }

  // Password validation
  const minPasswordLength = 8;
  if (passwordInput.value.length < minPasswordLength) {
    passwordInput.classList.add("outline-error");
    passwordInput.classList.remove("outline-primary");
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="error-message">${errorIcon} Password must be at least ${minPasswordLength} characters long.</p>`;
    hasError = true;
  }

  // If any error happened, stop here
  if (hasError) return;

  try {
    const response = await registerUser(formFields);

    if (response?.ok) {
      registerForm.reset(); // Clear the form
      alert("Registered successfully. Please log in.");
      location.href = "../login/index.html";
    } else {
      // If registration fails, show errors
      if (response?.errors) {
        errorMsg.classList.remove("hidden");
        errorMsg.innerHTML = response.errors
          .map(
            error =>
              `<p class="error-message">${errorIcon} ${error.message}</p>`
          )
          .join("<br>");
      } else if (response?.message) {
        errorMsg.classList.remove("hidden");
        errorMsg.innerHTML = `<p class="error-message">${errorIcon} ${response.message}</p>`;
      } else {
        errorMsg.classList.remove("hidden");
        errorMsg.innerHTML = `<p class="error-message">${errorIcon} Registration failed. Please check your inputs.</p>`
      }
    }
  } catch (error) {
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="error-message">${errorIcon} We can't reach the server right now. Please check your connection and try again.</p>`
  }
}

// Attach submit handler
registerForm.addEventListener("submit", onRegisterFormSubmit);