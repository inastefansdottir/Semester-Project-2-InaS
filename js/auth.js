import { getToken } from "./utils.js";

/**
 * Check if the user is logged in
 * @returns {boolean} True is access token exists
 */
export function isAuthenticated() {
  return !!getToken("accessToken");
}