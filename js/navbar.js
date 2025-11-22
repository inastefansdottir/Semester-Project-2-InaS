import { isAuthenticated } from "./auth.js";

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");


function toggleMenuLinks() {
  const loggedInLinks = document.querySelectorAll(".logged-in");
  const loggedOutLinks = document.querySelectorAll(".logged-out");

  if (isAuthenticated()) {
    loggedInLinks.forEach((el) => el.classList.remove("hidden"));
    loggedOutLinks.forEach((el) => el.classList.add("hidden"));

    insertUserNavbarData();
  } else {
    loggedInLinks.forEach((el) => el.classList.add("hidden"));
    loggedOutLinks.forEach((el) => el.classList.remove("hidden"));
  }
}

function insertUserNavbarData() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  // Desktop elements
  const desktopAvatar = document.getElementById("desktopAvatar");
  const desktopCredits = document.getElementById("desktopCredits");

  // Mobile elements
  const mobileAvatar = document.getElementById("mobileAvatar");
  const mobileUsername = document.getElementById("mobileUsername");
  const mobileCredits = document.getElementById("mobileCredits");

  // Set avatar images
  if (desktopAvatar) desktopAvatar.src = user.avatarUrl;
  if (mobileAvatar) mobileAvatar.src = user.avatarUrl;

  // Set credits text
  if (desktopCredits) desktopCredits.textContent = user.credits ?? 0;
  if (mobileCredits) mobileCredits.textContent = user.credits ?? 0;

  // Username in mobile menu
  if (mobileUsername) mobileUsername.textContent = user.name || "Profile";
}

toggleMenuLinks(); // set links on page load

function openMenu() {
  mobileMenu.classList.remove("translate-x-full");
}

function closeMenuFunc() {
  mobileMenu.classList.add("translate-x-full");
}

hamburger.addEventListener("click", openMenu);
closeMenu.addEventListener("click", closeMenuFunc);
