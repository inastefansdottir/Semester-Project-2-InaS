const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");

let isLoggedIn = false; // set to true if the user is logged in

function toggleMenuLinks() {
  const loggedInLinks = document.querySelectorAll(".logged-in");
  const loggedOutLinks = document.querySelectorAll(".logged-out");

  if (isLoggedIn) {
    loggedInLinks.forEach((el) => el.classList.remove("hidden"));
    loggedOutLinks.forEach((el) => el.classList.add("hidden"));
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
