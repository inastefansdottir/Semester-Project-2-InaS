import { getProfile, getUserListings, getUserBids, getListingById } from "./api.js";
import { protectPage } from "./auth.js";
import { clearStorage } from "./utils.js";

protectPage();

// Buttons
const listingsBtn = document.getElementById("showListingsBtn");
const bidsBtn = document.getElementById("showBidsBtn");

const thumbnailsContainer = document.getElementById("thumbnailsContainer");

// Format the time
function formatTimeRemaining(endsAt) {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return `${days}d:${hours}h:${minutes}m:${seconds}s`;
}

console.log(getUserBids("Salvie"))

// Render function
function renderThumbnails(listings) {
  thumbnailsContainer.innerHTML = "";

  if (!listings || listings.length === 0) {
    thumbnailsContainer.innerHTML = `<p class="text-center text-neutral-500">No items found.</p>`;
    return;
  }

  listings.forEach(listing => {
    const highestBid = listing.bids?.length
      ? Math.max(...listing.bids.map(b => b.amount))
      : 0;

    const thumb = document.createElement("div");
    thumb.addEventListener("click", () => {
      window.location.href = `../all-listings/listing.html?id=${listing.id}`;
    });
    thumb.className = "p-4 rounded-2xl bg-neutral-0 border border-neutral-300 shadow-[0_6px_16px_0_rgba(102,102,255,0.25)] flex flex-col " +
      "transition-transform transition-shadow duration-200 " +
      "hover:scale-[1.02] hover:shadow-[0_6px_16px_0_rgba(102,102,255,0.45)] cursor-pointer";

    thumb.innerHTML = `
      <div class="relative">
        <div class="relative w-full aspect-square">
          <img src="${listing.media?.[0].url}" alt="${listing.image?.[0].alt || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="timer-styling text-primary font-bold font-roboto-mono bg-secondary py-1 px-2.5 rounded-full border border-primary absolute top-2 left-2" data-endsAt="${listing.endsAt}"> 
          <i class="fa-regular fa-clock"></i> ${formatTimeRemaining(listing.endsAt)}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-[18px] font-bold mt-2.5">${listing.title}</span>
        <span class="text-[14px] text-neutral-500">current bid</span>
        <div class="flex justify-between">
          <span class="font-bold">${highestBid || 0} Credits</span>
          <div class="flex items-center gap-1">
            <img src="${listing.seller?.avatar?.url || '../images/placeholder-avatar.png'}" 
                 alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
            <strong class="font-bold">${listing.seller?.name || 'Unknown'}</strong>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  });
}

async function renderBidThumbnails(bids) {
  thumbnailsContainer.innerHTML = "";

  if (!bids || bids.length === 0) {
    thumbnailsContainer.innerHTML = `<p class="text-center text-neutral-500">No bids found.</p>`;
    return;
  }

  for (const bid of bids) {
    const fullListing = await getListingById(bid.listing.id);

    const seller = fullListing.seller;
    const highestBid = fullListing.bids?.length
      ? Math.max(...fullListing.bids.map(b => b.amount))
      : 0;

    const thumb = document.createElement("div");
    thumb.addEventListener("click", () => {
      window.location.href = `../all-listings/listing.html?id=${bid.listing.id}`;
    });
    thumb.className = "p-4 rounded-2xl bg-neutral-0 border border-neutral-300 shadow-[0_6px_16px_0_rgba(102,102,255,0.25)] flex flex-col " +
      "transition-transform transition-shadow duration-200 " +
      "hover:scale-[1.02] hover:shadow-[0_6px_16px_0_rgba(102,102,255,0.45)] cursor-pointer";

    thumb.innerHTML = `
      <div class="relative">
        <div class="relative w-full aspect-square">
          <img src="${fullListing.media?.[0].url || bid.image}" alt="${fullListing.media?.[0].alt || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="timer-styling text-primary font-bold font-roboto-mono bg-secondary py-1 px-2.5 rounded-full border border-primary absolute top-2 left-2" data-endsAt="${fullListing.endsAt}"> 
          <i class="fa-regular fa-clock"></i> ${formatTimeRemaining(fullListing.endsAt)}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-[18px] font-bold mt-2.5">${fullListing.title}</span>
        <div class="flex justify-between">
          <span class="text-[14px] text-neutral-500">your bid</span>
          <span class="text-[14px] text-neutral-500">Highest: ${highestBid || 0} Credits</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold">${bid.amount || 0} Credits</span>
          <div class="flex items-center gap-1">
            <img src="${seller?.avatar?.url || '../images/placeholder-avatar.png'}" 
                 alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
            <strong class="font-bold">${seller?.name || 'Unknown'}</strong>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  }
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

// Timer updater runs every second to update countdowns on listings
setInterval(updateAllTimers, 1000);

function updateAllTimers() {
  const timers = document.querySelectorAll(".timer-styling");

  timers.forEach(timer => {
    const endsAt = timer.dataset.endsat;
    const timeText = formatTimeRemaining(endsAt);

    timer.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeText}`;

    if (timeText === "Ended") {
      timer.classList.add("bg-light-error", "text-error", "border-error");
      timer.classList.remove("bg-secondary", "text-primary", "border-primary");
    }
  });
}


// Log out button
logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  clearStorage();
  location.href = "../login/index.html"
})

loadProfile();
