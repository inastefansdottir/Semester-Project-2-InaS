import { createListing } from "./api.js";
const CLOUD_NAME = "dobcqphb0"; // Cloudinary cloud name
const UPLOAD_PRESET = "BidVerse"; // unsigned upload preset
const MAX_IMAGES = 4;

const selectedFiles = []; // stores File objects the user selected

const form = document.getElementById("createListingForm");
const imageContainer = document.getElementById("imagePreviewContainer");
const uploadBtn = document.getElementById("uploadBtn"); // add-square button
const imageInput = document.getElementById("imageInput");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description")
const endsAtInput = document.getElementById("endsAt");

const titleError = document.getElementById("titleError");
const descriptionError = document.getElementById("descriptionError");
const imageError = document.getElementById("imageError");
const endsAtError = document.getElementById("endsAtError");

const cancelButton = document.getElementById("cancelButton")

const loading = document.getElementById("loadingOverlay");

// prevent access unless logged in
(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const overlay = document.getElementById("authOverlay");
  const main = document.querySelector("main");

  if (!user) {
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    // Blur and disable clicking on content
    main.classList.add("blur-sm", "pointer-events-none");

    // stop JS execution for the create listing logic
    throw new Error("User not authenticated");
  }
})();


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

endsAtInput.addEventListener("input", () =>
  clearFieldError(endsAtInput, endsAtError)
)

// ensure uploadBtn is type="button" in HTML to avoid accidental form submit
if (uploadBtn && uploadBtn.tagName === "BUTTON") uploadBtn.type = "button";

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

function renderSlots() {
  // clear all preview slots except keep uploadBtn in DOM only as last element if space
  imageContainer.innerHTML = "";

  // render previews left -> right
  selectedFiles.forEach((fileObj, idx) => {
    const url = fileObj.previewUrl || URL.createObjectURL(fileObj.file);
    fileObj.previewUrl = url; // cache so we can revoke later if needed
    imageContainer.appendChild(createPreviewSlot(url, idx));
  });

  // append upload button only if there's space
  if (selectedFiles.length < MAX_IMAGES) {
    imageContainer.appendChild(uploadBtn);
  }
}

// click the visible SVG button to open file picker
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // limit how many can be added
  const remaining = MAX_IMAGES - selectedFiles.length;
  if (remaining <= 0) return;
  // allow selecting only one at a time for simpler UX
  imageInput.click();
});

// handle file selection (preview only)
imageInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const remaining = MAX_IMAGES - selectedFiles.length;
  const toAdd = files.slice(0, remaining);

  toAdd.forEach((f) => {
    selectedFiles.push({ file: f, previewUrl: null, alt: "" });
  });

  imageInput.value = ""; // reset so same file can be selected later
  renderSlots();
});

// remove image handler via event
imageContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-remove]");
  if (!btn) return;
  const index = Number(btn.dataset.remove);
  if (!Number.isInteger(index)) return;

  // revoke object URL if created
  if (selectedFiles[index]?.previewUrl) {
    URL.revokeObjectURL(selectedFiles[index].previewUrl);
  }
  selectedFiles.splice(index, 1);
  renderSlots();
});

// Cloudinary upload
async function uploadFileToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    // Cloudinary returns an error structure
    const msg = json.error?.message || `Cloudinary upload failed`;
    throw new Error(msg);
  }
  return json.secure_url;
}

async function uploadAllSelectedFiles() {
  if (selectedFiles.length === 0) return [];

  // Upload in parallel
  const uploadPromises = selectedFiles.map(s => uploadFileToCloudinary(s.file));
  return Promise.all(uploadPromises);
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title")?.value?.trim();
  const description = document.getElementById("description")?.value?.trim() || "";
  const endsAtValue = document.getElementById("endsAt")?.value; // expects yyyy-mm-dd

  let hasError = false;

  // Basic validation
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

  if (!endsAtValue) {
    endsAtError.textContent = "End date is required";
    endsAtInput.classList.add("outline-error");
    endsAtInput.classList.remove("outline-primary");
    hasError = true;
  }

  // If any error happened, stop here
  if (hasError) return;

  loading.classList.remove("hidden");
  loading.classList.add("flex");

  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.disabled = true;

  try {
    // Upload images first
    const uploadedUrls = await uploadAllSelectedFiles();

    const media = uploadedUrls.map((url, i) => ({
      url,
      alt: `Listing image ${i + 1}`,
    }));

    const payload = {
      title,
      description,
      media,
      endsAt: new Date(endsAtValue).toISOString(),
    };

    const result = await createListing(payload);

    const newListingId = result.data?.id ?? result.id ?? null;

    alert("Listing created!");

    if (newListingId) {
      window.location.href = `../all-listings/listing.html?id=${newListingId}`;
    } else {
      window.location.href = "../all-listings/index.html";
    }

  } catch (err) {
    imageError.textContent = err.message || "Failed to create listing";
  } finally {
    submitBtn.disabled = false;
    loading.classList.remove("flex");
    loading.classList.add("hidden")
  }
});

cancelButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});

// initial render (shows upload button)
renderSlots();
