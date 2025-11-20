const API_BASE_URL = "https://v2.api.noroff.dev";
const AUTH_REGISTER_URL = `${API_BASE_URL}/auth/register`;
const AUTH_LOGIN_URL = `${API_BASE_URL}/auth/login`;

const NOROFF_API_KEY = "72566b4d-607a-4ba6-9e7f-cc634bc1f6a2";

/**
 * Register a new user
 * @param {object} userDetails - {name, email, password}
 * @returns {Promise<object>} Status and response from API
 */
export async function registerUser(userDetails) {
  try {
    const fetchOptions = {
      method: "POST",
      body: JSON.stringify(userDetails),
      headers: {
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
    const json = await response.json();

    // Return both the status and the body
    return {
      ok: response.ok,
      status: response.status,
      ...json
    };
  } catch (error) {
    console.log(error)
  }
}

/**
 * Login a user
 * @param {object} - {email, password} 
 * @returns {Promise<object>} API response
 */
export async function loginUser({ email, password }) {
  try {
    const fetchOptions = {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(AUTH_LOGIN_URL, fetchOptions);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errors?.[0]?.message || "Invalid email or password");
    }

    return json;
  } catch (error) {
    throw error;
  }
}