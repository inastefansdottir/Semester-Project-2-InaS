import { isAuthenticated } from "./auth.js";
import { getToken } from "./utils.js";

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");

export async function loadNavbarUser() {
  const token = getToken("accessToken");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || !token) return;

  const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${user.name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": "72566b4d-607a-4ba6-9e7f-cc634bc1f6a2",
    },
  });

  const json = await response.json();

  if (!response.ok) return;

  const profile = json.data;

  localStorage.setItem("loggedInUser", JSON.stringify(profile));

  document.getElementById("desktopCredits").textContent = profile.credits;
  document.getElementById("mobileCredits").textContent = profile.credits;

  // Desktop elements
  const desktopAvatar = document.getElementById("desktopAvatar");

  // Mobile elements
  const mobileAvatar = document.getElementById("mobileAvatar");
  const mobileUsername = document.getElementById("mobileUsername");

  // Set avatar images
  if (desktopAvatar) desktopAvatar.src = profile.avatar?.url || '../images/placeholder-avatar.png';
  if (mobileAvatar) mobileAvatar.src = profile.avatar?.url || '../images/placeholder-avatar.png';

  // Username in mobile menu
  if (mobileUsername) mobileUsername.textContent = profile.name || "Profile";

  return profile;
}

function toggleMenuLinks() {
  const loggedInLinks = document.querySelectorAll(".logged-in");
  const loggedOutLinks = document.querySelectorAll(".logged-out");

  if (isAuthenticated()) {
    loggedInLinks.forEach((el) => el.classList.remove("hidden"));
    loggedOutLinks.forEach((el) => el.classList.add("hidden"));

    loadNavbarUser();
  } else {
    loggedInLinks.forEach((el) => el.classList.add("hidden"));
    loggedOutLinks.forEach((el) => el.classList.remove("hidden"));
  }
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

loadNavbarUser();
