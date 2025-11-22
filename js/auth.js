import { getToken } from "./utils.js";

const currentPath = window.location.pathname; // Current page path
const publicPages = ["/profile/index.html", "/profile/edit-profile.html", "/create-listing/index.html"]; // Pages that need login

/**
 * Check if the user is logged in
 * @returns {boolean} True is access token exists
 */
export function isAuthenticated() {
  return !!getToken("accessToken");
}

/**
 * Protect pages that require login
 * Redirects to login page if user is not authenticated
 */
export function protectPage() {
  if (!isAuthenticated() && publicPages.includes(currentPath)) {
    window.location.href = "../";
  }
}