import { getProfile } from "./api.js";
import { protectPage } from "./auth.js";

protectPage();

async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const profile = await getProfile(user.name);

  // HTML elements
  const username = document.getElementById("username");
  const credits = document.getElementById("credits");
  const bio = document.getElementById("bio");

  const avatar = document.getElementById("avatar");
  const banner = document.getElementById("banner");

  username.textContent = profile.data.name || "Username";
  credits.textContent = profile.data.credits || 0;
  bio.textContent = profile.data.bio || "User has no bio..";

  avatar.src = profile.data.avatar?.url;
  banner.src = profile.data.banner?.url;
}

loadProfile();