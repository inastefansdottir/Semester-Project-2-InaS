import { getProfile, getUserListings, getUserBids } from "./api.js";
import { protectPage } from "./auth.js";
import { clearStorage } from "./utils.js";

protectPage();

// Buttons
const listingsBtn = document.getElementById("showListingsBtn");
const bidsBtn = document.getElementById("showBidsBtn");

const thumbnailsContainer = document.getElementById("thumbnailsContainer");

// Render function
function renderThumbnails(listings) {
  thumbnailsContainer.innerHTML = "";

  if (!listings || listings.length === 0) {
    thumbnailsContainer.innerHTML = `<p class="text-center text-neutral-500">No items found.</p>`;
    return;
  }

  listings.forEach(listing => {
    const thumb = document.createElement("div");
    thumb.className = "p-4 rounded-2xl shadow-[0_4px_10px_0_rgba(102,102,255,0.30)] border border-neutral-300";

    thumb.innerHTML = `
      <div class="relative">
        <div class="relative w-full aspect-square">
          <img src="${listing.image?.url || listing.image}" alt="${listing.image?.alt || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="text-primary font-bold font-roboto-mono bg-secondary py-1 px-2.5 rounded-full border border-primary absolute top-2 left-2">
          <i class="fa-regular fa-clock"></i> ${listing.timer || ''}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-[18px] font-bold mt-2.5">${listing.title}</span>
        <span class="text-[14px] text-neutral-500">current bid</span>
        <div class="flex justify-between">
          <span class="font-bold">${listing.price || listing.currentBid || 0} Credits</span>
          <div class="flex items-center gap-1">
            <img src="${listing.author?.avatar?.url || listing.authorAvatar || '../images/placeholder-avatar.png'}" 
                 alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
            <strong class="font-bold">${listing.author?.name || listing.authorName || 'Unknown'}</strong>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  });
}

function renderBidThumbnails(bids) {
  thumbnailsContainer.innerHTML = "";

  if (!bids || bids.length === 0) {
    thumbnailsContainer.innerHTML = `<p class="text-center text-neutral-500">No bids found.</p>`;
    return;
  }

  bids.forEach(bid => {
    const thumb = document.createElement("div");
    thumb.className = "p-4 rounded-2xl shadow-[0_4px_10px_0_rgba(102,102,255,0.30)] border border-neutral-300";

    thumb.innerHTML = `
      <div class="relative">
        <div class="relative w-full aspect-square">
          <img src="${bid.image?.url || bid.image}" alt="${bid.image?.alt || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="text-primary font-bold font-roboto-mono bg-secondary py-1 px-2.5 rounded-full border border-primary absolute top-2 left-2">
          <i class="fa-regular fa-clock"></i> ${bid.timer || ''}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-[18px] font-bold mt-2.5">${bid.title}</span>
        <div class="flex justify-between">
          <span class="text-[14px] text-neutral-500">your bid</span>
          <span class="text-[14px] text-neutral-500">Highest: ${bid.highestBid || bid.price || 0} Credits</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold">${bid.userBid || bid.price || 0} Credits</span>
          <div class="flex items-center gap-1">
            <img src="${bid.author?.avatar?.url || bid.authorAvatar || '../images/placeholder-avatar.png'}" 
                 alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
            <strong class="font-bold">${bid.author?.name || bid.authorName || 'Unknown'}</strong>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  });
}


// Tab toggle function
function activeTab(activeButton) {
  const allTabs = [listingsBtn, bidsBtn];

  allTabs.forEach(btn => {
    // Remove active styles
    btn.classList.remove("text-primary", "bg-secondary", "px-5", "py-[5px]", "rounded-full");
  });

  // Add active styles to clicked button
  activeButton.classList.add("text-primary", "bg-secondary", "px-5", "py-[5px]", "rounded-full");
}

async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

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

  avatar.src = profile.data.avatar?.url || "../images/placeholder-avatar.png";
  banner.src = profile.data.banner?.url || "../images/banner.png";

  // Fetch listings and bids
  let userListings = await getUserListings(user.name);
  let userBids = await getUserBids(user.name);


  // Event listeners
  listingsBtn.addEventListener("click", () => {
    activeTab(listingsBtn);
    renderThumbnails(userListings);
  })

  bidsBtn.addEventListener("click", () => {
    activeTab(bidsBtn);
    renderBidThumbnails(userBids);
  })

  // Initialize with listings
  activeTab(listingsBtn);
  renderThumbnails(userListings);
}

// Log out button
logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  clearStorage();
  location.href = "../login/index.html"
})

loadProfile();