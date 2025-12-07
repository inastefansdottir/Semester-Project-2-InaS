import { getListingById, updateListing, deleteListing } from "./api.js";

const CLOUD_NAME = "dobcqphb0";
const UPLOAD_PRESET = "BidVerse";
const MAX_IMAGES = 4;

const selectedFiles = [];

const form = document.getElementById("createListingForm");
const imageContainer = document.getElementById("imagePreviewContainer");
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const endsAtInput = document.getElementById("endsAt");

const titleError = document.getElementById("titleError");
const descriptionError = document.getElementById("descriptionError");
const imageError = document.getElementById("imageError");
const endsAtError = document.getElementById("endsAtError");

const deleteButton = document.getElementById("deleteButton");
const cancelButton = document.getElementById("cancelButton");

// Get listing ID from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Function to clear errors as user types
function clearFieldError(inputElement, errorElement) {
  inputElement.classList.remove("outline-error");
  inputElement.classList.add("outline-primary");
  errorElement.textContent = "";
}

// Live clearing for fields
titleInput.addEventListener("input", () =>
  clearFieldError(titleInput, titleError)
)

descriptionInput.addEventListener("input", () =>
  clearFieldError(descriptionInput, descriptionError)
)

imageInput.addEventListener("input", () =>
  clearFieldError(imageInput, imageError)
)

// Fetch listing + prefill form
async function fetchListing() {
  if (!listingId) return;

  // Get existing listing from API
  const listing = await getListingById(listingId);

  // Prefill title + description
  titleInput.value = listing.title;
  descriptionInput.value = listing.description;

  // endsAt is locked (API does not allow updates)
  endsAtInput.value = listing.endsAt.split("T")[0];
  endsAtInput.disabled = true; // User cannot change
  endsAtInput.classList.add("opacity-70", "cursor-not-allowed");

  // Add existing images into "selectedFiles"
  listing.media.forEach((img) => {
    selectedFiles.push({
      file: null,           // no file because it's already uploaded
      previewUrl: img.url,  // the existing Cloudinary URL
      alt: img.alt || ""
    });
  });

  renderSlots();
}

// Template for each image preview square
function createPreviewSlot(url, index) {
  const slot = document.createElement("div");
  slot.className = "relative w-[112px] h-[112px] rounded-xl overflow-hidden bg-neutral-0";

  slot.innerHTML = `
    <img src="${url}" alt="preview ${index + 1}" class="object-cover w-full h-full" />
    <button type="button" data-remove="${index}" 
      class="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">×</button>
  `;

  return slot;
}

// Renders all image preview squares
function renderSlots() {
  imageContainer.innerHTML = "";
  selectedFiles.forEach((fileObj, idx) => {
    const url = fileObj.previewUrl || URL.createObjectURL(fileObj.file);
    fileObj.previewUrl = url;
    imageContainer.appendChild(createPreviewSlot(url, idx));
  });
  if (selectedFiles.length < MAX_IMAGES) imageContainer.appendChild(uploadBtn);
}

// Upload functions and event listeners same as create-listing.js

// Clicking the big + button
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (selectedFiles.length >= MAX_IMAGES) return;
  imageInput.click();
});

// When user selects files
imageInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  const remaining = MAX_IMAGES - selectedFiles.length;

  // Only allow as many images as remaining slots
  files.slice(0, remaining).forEach((f) => selectedFiles.push({ file: f, previewUrl: null, alt: "" }));
  imageInput.value = "";
  renderSlots();
});

// Removing an image from preview
imageContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-remove]");
  if (!btn) return;
  const index = Number(btn.dataset.remove);
  selectedFiles.splice(index, 1);
  renderSlots();
});

// Upload a single file to Cloudinary
async function uploadFileToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: data }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message);

  return json.secure_url;
}

// Upload all NEW FILES, keep OLD URLs untouched
async function uploadAllSelectedFiles() {
  // Only new files need uploading
  const uploadable = selectedFiles.filter(f => f.file);

  // If no new files → return existing URLs
  if (!uploadable.length) return selectedFiles.map(f => f.previewUrl);

  // Upload in parallel
  const urls = await Promise.all(uploadable.map(f => uploadFileToCloudinary(f.file)));

  // Replace previewUrl for new uploads
  let i = 0;
  selectedFiles.forEach(f => { if (f.file) f.previewUrl = urls[i++]; });

  // Return final list of URLs
  return selectedFiles.map(f => f.previewUrl);
}

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather input values
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  // endsAt cannot be changed — user sees it only
  const endsAtValue = endsAtInput.value;

  let hasError = false;
  if (!title) {
    titleError.textContent = "Title is required";
    titleInput.classList.add("outline-error");
    titleInput.classList.remove("outline-primary");
    hasError = true;
  }

  if (!description) {
    descriptionError.textContent = "Description is required";
    descriptionInput.classList.add("outline-error");
    descriptionInput.classList.remove("outline-primary");
    hasError = true;
  }

  if (selectedFiles.length === 0) {
    imageError.textContent = "Atleast one image is required";
    hasError = true;
  }

  // endsAt is disabled, but if empty → show explanation
  if (!endsAtValue) {
    endsAtError.textContent = "You cannot change the date";
    hasError = true;
  }

  if (hasError) return;

  try {
    // Upload new images OR reuse existing ones
    const uploadedUrls = await uploadAllSelectedFiles();

    // Format final media array
    const media = uploadedUrls.map((url, i) => ({ url, alt: `Listing image ${i + 1}` }));

    // API does NOT allow updating endsAt > do not send it
    await updateListing(listingId, { title, description, media });

    alert("Listing updated!");
    window.location.href = "../profile/index.html";
  } catch (err) {
    console.error(err);
    imageError.textContent = err.message || "Failed to update listing";
  }
});

deleteButton.addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this listing?");
  if (!confirmDelete) return;

  try {
    await deleteListing(listingId);
    alert("Listing deleted.");
    window.location.href = "../profile/index.html";
  } catch (err) {
    alert(err.message || "Failed to delete listing");
  }
});

cancelButton.addEventListener("click", () => {
  window.location.href = "../profile/index.html";
});

renderSlots();
fetchListing();
