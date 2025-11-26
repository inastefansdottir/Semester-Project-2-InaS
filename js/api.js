import { saveToken, getToken, saveUser } from "./utils.js";

const API_BASE_URL = "https://v2.api.noroff.dev";
const AUTH_REGISTER_URL = `${API_BASE_URL}/auth/register`;
const AUTH_LOGIN_URL = `${API_BASE_URL}/auth/login`;
const AUCTION_PROFILES_URL = `${API_BASE_URL}/auction/profiles`
const AUCTION_LISTINGS_URL = `${API_BASE_URL}/auction/listings`

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

    const accessToken = json.data?.accessToken;
    const user = json.data

    if (accessToken) {
      saveToken("accessToken", accessToken);
      saveUser(user.name);

      // Fetch full profile (includes bio)
      const profileResponse = await getProfile(user.name, accessToken);
      const profile = profileResponse.data;

      // Save full profile to localStorage
      localStorage.setItem("loggedInUser", JSON.stringify({
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        credits: profile.credits,
        avatarUrl: profile.avatar?.url,
        avatarAlt: profile.avatar?.alt,
        bannerUrl: profile.banner?.url,
        bannerAlt: profile.banner?.alt,
      }));

      window.location.href = "../profile/index.html";
    }

    return json;
  } catch (error) {
    throw error;
  }
}

export async function getProfile(username, accessToken = getToken("accessToken")) {
  try {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": NOROFF_API_KEY
      }
    }
    const response = await fetch(`${AUCTION_PROFILES_URL}/${username}`, fetchOptions);

    if (!response.ok) {
      throw new Error("Failed to load profile");
    }

    return response.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
}

/**
 * Fetch listings of a specific user
 * @param {string} username
 * @returns {Promise<Array>} Array of listing objects
 */
export async function getUserListings(username) {
  const accessToken = getToken("accessToken");

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": NOROFF_API_KEY
    }
  }
  const response = await fetch(`${AUCTION_PROFILES_URL}/${username}/listings`, fetchOptions);

  if (!response.ok) {
    throw new Error("Failed to load user listings");
  }

  const json = await response.json();
  return json.data || [];
}

/**
 * Fetch bids of a specific user
 * @param {string} username
 * @returns {Promise<Array>} Array of bid objects
 */
export async function getUserBids(username) {
  const accessToken = getToken("accessToken");

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": NOROFF_API_KEY
    }
  }
  const response = await fetch(`${AUCTION_PROFILES_URL}/${username}/bids`, fetchOptions);

  if (!response.ok) {
    throw new Error("Failed to load user bids");
  }

  const json = await response.json();
  return json.data || [];
}

export async function fetchListings() {
  try {
    const accessToken = getToken("accessToken");
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": NOROFF_API_KEY
      }
    };
    const response = await fetch(
      `${AUCTION_LISTINGS_URL}?_seller=true&_bids=true`,
      fetchOptions
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getListingById(listingId) {
  try {
    const accessToken = getToken("accessToken");
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": NOROFF_API_KEY
      }
    };
    const response = await fetch(
      `${AUCTION_LISTINGS_URL}/${listingId}`,
      fetchOptions
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.log(error);
  }
}