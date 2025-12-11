import { loginUser } from "./api.js";

// Form + input fields
const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Error message elements
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const errorMsg = document.getElementById("errorMessage");

// Function to clear errors as user types
function clearFieldError(inputElement, errorElement) {
  inputElement.classList.remove("outline-error");
  inputElement.classList.add("outline-primary");
  errorElement.textContent = "";
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hidden");
}

// Live clearing for email and password fields
emailInput.addEventListener("input", () =>
  clearFieldError(emailInput, emailError)
)

passwordInput.addEventListener("input", () =>
  clearFieldError(passwordInput, passwordError)
)

// Handles form submission for login
async function onLoginFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  const errorIcon =
    '<ion-icon name="alert-circle" class="alert-circle self-start mt-0.5"></ion-icon>';
  let hasError = false;

  // Clear previous messages
  emailError.textContent = "";
  passwordError.textContent = "";

  // Simple input-level required checks
  if (!formFields.email) {
    emailError.textContent = "Email is required";
    emailInput.classList.add("outline-error");
    emailInput.classList.remove("outline-none");
    hasError = true;
  }

  if (!formFields.password) {
    passwordError.textContent = "Password is required";
    passwordInput.classList.add("outline-error");
    passwordInput.classList.remove("outline-none");
    hasError = true;
  }

  // Email validation
  if (formFields.email && !emailInput.checkValidity()) {
    emailInput.classList.add("outline-error");
    emailInput.classList.remove("outline-none");
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="flex items-center gap-1">${errorIcon} ${emailInput.validationMessage}</p>`;
    hasError = true;
  }

  // Password validation
  const minPasswordLength = 8;
  if (passwordInput.value.length < minPasswordLength) {
    passwordInput.classList.add("outline-error");
    passwordInput.classList.remove("outline-none");
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="flex items-center gap-1">${errorIcon} Password must be at least ${minPasswordLength} characters long.</p>`;
    hasError = true;
  }

  // If any error happened, stop here
  if (hasError) return;

  // Submit login request
  try {
    const response = await loginUser(formFields);
    const accessToken = response?.data?.accessToken;

    if (accessToken) {
      // Redirect to profile page on successful login
      window.location.href = "../profile/index.html"
    }
  } catch (error) {
    const errorIcon =
      '<ion-icon name="alert-circle" class="alert-circle"></ion-icon>';

    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = `<p class="flex items-center gap-1">${errorIcon} ${error.message || "Invalid email or password"
      }</p>`;
  }
}

// Attach form submit handler
loginForm.addEventListener("submit", onLoginFormSubmit);