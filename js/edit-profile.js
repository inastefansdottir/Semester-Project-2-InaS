import { updateProfile, getProfile } from "./api.js";
import { clearStorage } from "./utils.js";

const avatarImg = document.getElementById("avatarImg");
const bannerImg = document.getElementById("bannerImg");
const nameSpan = document.getElementById("name");
const emailSpan = document.getElementById("email");
const creditsSpan = document.getElementById("credits");
const bioInput = document.getElementById("bio");

const editAvatarBtn = document.getElementById("editAvatarBtn");
const editBannerBtn = document.getElementById("editBannerBtn");


const logoutBtn = document.getElementById("logoutBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const CLOUD_NAME = "dobcqphb0"; // Cloudinary cloud name
const UPLOAD_PRESET = "BidVerse"; // unsigned upload preset

// Track temporary changes
let newAvatarFile = null;
let newBannerFile = null;
let originalAvatar = "";
let originalBanner = "";
let originalBio = "";

// Create hidden file inputs for avatar/banner
const avatarInput = document.createElement("input");
avatarInput.type = "file";
avatarInput.accept = "image/*";

const bannerInput = document.createElement("input");
bannerInput.type = "file";
bannerInput.accept = "image/*";

// Handle avatar change
editAvatarBtn.addEventListener("click", (e) => {
  e.preventDefault();
  avatarInput.click(); // open file picker
});

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  newAvatarFile = file; // store temporarily
  avatarImg.src = URL.createObjectURL(file); // preview
});

// Handle banner change
editBannerBtn.addEventListener("click", (e) => {
  e.preventDefault();
  bannerInput.click(); // open file picker
});

bannerInput.addEventListener("change", () => {
  const file = bannerInput.files[0];
  if (!file) return;
  newBannerFile = file; // store temporarily
  bannerImg.src = URL.createObjectURL(file); // preview
});

// Function to upload image to Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data.secure_url; // URL for the api
}

// Load profile data from api
async function loadProfile() {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return;

    const profile = await getProfile(user.name);

    avatarImg.src = profile.data.avatar.url;
    bannerImg.src = profile.data.banner.url;
    bioInput.value = profile.data.bio || "";

    nameSpan.textContent = profile.data.name;
    emailSpan.textContent = profile.data.email;
    creditsSpan.textContent = profile.data.credits;

    // Save originals for cancel button
    originalAvatar = { ...profile.data.avatar }; // {url, alt}
    originalBanner = { ...profile.data.banner };
    originalBio = profile.data.bio || "";

  } catch (err) {
    alert("Failed to load profile. Please refresh the page.");
  }
}

// Save profile changes
saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  // Upload new files if selected
  let avatarUrl = newAvatarFile ? await uploadToCloudinary(newAvatarFile) : originalAvatar.url;
  let bannerUrl = newBannerFile ? await uploadToCloudinary(newBannerFile) : originalBanner.url;

  try {

    // Build API object with updated URLs
    const updatedProfile = {
      avatar: { url: avatarUrl, alt: originalAvatar.alt || "User avatar" },
      banner: { url: bannerUrl, alt: originalBanner.alt || "User banner" },
      bio: bioInput.value
    };

    // Call API
    const updatedUserFromAPI = await updateProfile(user.name, updatedProfile);
    if (!updatedUserFromAPI) throw new Error("Failed to update profile");

    // Update localStorage **in the login-compatible format**
    const userForStorage = {
      ...user, // keep name, email, credits
      avatarUrl: updatedProfile.avatar.url,
      avatarAlt: updatedProfile.avatar.alt,
      bannerUrl: updatedProfile.banner.url,
      bannerAlt: updatedProfile.banner.alt,
      bio: updatedProfile.bio
    };

    localStorage.setItem("loggedInUser", JSON.stringify(userForStorage));

    alert("Profile updated!");

    // Redirect to profile page
    window.location.href = "/profile/index.html"
  } catch (err) {
    alert("Failed to update profile.");
  }
})

// Log out button
logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  clearStorage();
  location.href = "../login/index.html"
})

cancelBtn.addEventListener("click", e => {
  e.preventDefault();
  location.href = "/profile/index.html"
})

// Load profile on page load
loadProfile();