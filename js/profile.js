import { getProfile, getUserListings, getUserBids, getListingById } from "./api.js";
import { protectPage } from "./auth.js";
import { clearStorage } from "./utils.js";

protectPage();

// Buttons
const listingsBtn = document.getElementById("showListingsBtn");
const bidsBtn = document.getElementById("showBidsBtn");

const thumbnailsContainer = document.getElementById("thumbnailsContainer");

// Loader
const pageLoader = document.getElementById("pageLoader");
const pageContent = document.getElementById("pageContent");

function showPageLoader() {
  pageLoader.classList.remove("hidden");
  pageContent.classList.add("hidden");
}

function hidePageLoader() {
  pageLoader.classList.add("hidden");
  pageContent.classList.remove("hidden");
}

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

function createListingSkeleton() {
  const skeleton = document.createElement("div");

  skeleton.className =
    "listing-skeleton p-4 rounded-2xl bg-neutral-0 border border-neutral-300 shadow-[0_6px_16px_0_rgba(102,102,255,0.25)] flex flex-col animate-pulse";

  skeleton.innerHTML = `
    <div class="relative">
      <div class="relative w-full aspect-square bg-neutral-200 rounded-xl"></div>

      <div class="absolute top-2 left-2 h-8 w-32 bg-neutral-200 rounded-full border border-neutral-300"></div>

      <div class="absolute top-2 right-2 h-8 w-8 bg-neutral-200 rounded-full border border-neutral-300"></div>
    </div>

    <div class="flex flex-col h-full">
      <div class="h-5 bg-neutral-200 rounded mt-2.5 w-4/5"></div>
      <div class="h-5 bg-neutral-200 rounded mt-1.5 w-3/5"></div>

      <div class="mt-auto pt-2">
        <div class="h-3.5 bg-neutral-200 rounded w-20"></div>

        <div class="flex justify-between items-center mt-2">
          <div class="h-5 bg-neutral-200 rounded w-24"></div>

          <div class="flex items-center gap-1">
            <div class="w-6.25 h-6.25 rounded-full bg-neutral-200"></div>
            <div class="h-4 bg-neutral-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return skeleton;
}

function createBidSkeleton() {
  const skeleton = document.createElement("div");

  skeleton.className =
    "bid-skeleton p-4 rounded-2xl bg-neutral-0 border border-neutral-300 shadow-[0_6px_16px_0_rgba(102,102,255,0.25)] flex flex-col animate-pulse";

  skeleton.innerHTML = `
    <div class="relative">
      <div class="relative w-full aspect-square bg-neutral-200 rounded-xl"></div>

      <div class="absolute top-2 left-2 h-8 w-32 bg-neutral-200 rounded-full border border-neutral-300"></div>
    </div>

    <div class="flex flex-col h-full">
      <div class="h-5 bg-neutral-200 rounded mt-2.5 w-4/5"></div>
      <div class="h-5 bg-neutral-200 rounded mt-1.5 w-3/5 mb-auto"></div>

      <div class="mt-auto pt-2">
        <div class="flex justify-between gap-4 w-full">
          <div class="h-3.5 bg-neutral-200 rounded w-16"></div>
          <div class="h-3.5 bg-neutral-200 rounded w-28"></div>
        </div>

        <div class="flex justify-between items-center mt-2">
          <div class="h-5 bg-neutral-200 rounded w-24"></div>

          <div class="flex items-center gap-1">
            <div class="w-6.25 h-6.25 rounded-full bg-neutral-200"></div>
            <div class="h-4 bg-neutral-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return skeleton;
}

function showListingSkeletons(count = 8) {
  thumbnailsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    thumbnailsContainer.appendChild(createListingSkeleton());
  }
}

function showBidSkeletons(count = 8) {
  thumbnailsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    thumbnailsContainer.appendChild(createBidSkeleton());
  }
}

function getTimerClasses(endsAt) {
  const timeText = formatTimeRemaining(endsAt);

  if (timeText === "Ended") {
    return "bg-light-error text-error border-error";
  }

  return "bg-secondary text-primary border-primary";
}

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
        <span class="timer-styling font-bold font-roboto-mono py-1 px-2.5 rounded-full border absolute top-2 left-2 ${getTimerClasses(listing.endsAt)}" data-endsat="${listing.endsAt}"> 
          <i class="fa-regular fa-clock"></i> ${formatTimeRemaining(listing.endsAt)}
        </span>
        <button class="edit-button text-neutral-0 font-bold font-roboto-mono bg-primary border border-neutral-0 py-1.25 px-2.5 rounded-full absolute top-2 right-2 cursor-pointer hover:bg-secondary  hover:text-primary hover:border-primary transition-colors duration-100"> 
          <i class="fa-solid fa-pen"></i>
        </button>
      </div>
      <div class="flex flex-col h-full">
        <span class="text-[18px] font-bold mt-2.5 wrap-break line-clamp-2">${listing.title}</span>
        <div class="mt-auto">
          <span class="text-[14px] text-neutral-500">current bid</span>
          <div class="flex justify-between">
            <span class="font-bold">${highestBid || 0} Credits</span>
            <div class="flex items-center gap-1">
              <img src="${listing.seller?.avatar?.url || '../images/placeholder-avatar.png'}" 
                alt="Username avatar" class="w-6.25 h-6.25 rounded-full object-cover">
              <strong class="font-bold max-w-20 truncate block">
                ${listing.seller?.name || 'Unknown'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);

    const editBtn = thumb.querySelector(".edit-button");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `../profile/edit-listing.html?id=${listing.id}`;
    });
  });
}

async function renderBidThumbnails(bids) {
  if (!bids || bids.length === 0) {
    thumbnailsContainer.innerHTML = `<p class="text-center text-neutral-500">No bids found.</p>`;
    return;
  }

  const fullListings = await Promise.all(
    bids.map(async (bid) => {
      const fullListing = await getListingById(bid.listing.id);

      return {
        bid,
        fullListing,
      };
    })
  );

  thumbnailsContainer.innerHTML = "";

  fullListings.forEach(({ bid, fullListing }) => {
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
          <img src="${fullListing.media?.[0]?.url || "../images/no-image.png"}" alt="${fullListing.media?.[0]?.alt || fullListing.title || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="timer-styling font-bold font-roboto-mono py-1 px-2.5 rounded-full border absolute top-2 left-2 ${getTimerClasses(fullListing.endsAt)}" data-endsat="${fullListing.endsAt}"> 
          <i class="fa-regular fa-clock"></i> ${formatTimeRemaining(fullListing.endsAt)}
        </span>
      </div>
      <div class="flex flex-col h-full">
        <span class="text-[18px] font-bold mt-2.5 wrap-break line-clamp-2 mb-auto">${fullListing.title}</span>
        <div class="mt-auto">
          <div class="flex justify-between">
            <span class="text-[14px] text-neutral-500">your bid</span>
            <span class="text-[14px] text-neutral-500">Highest: <strong class="font-roboto-mono">${highestBid || 0}</strong> Credits</span>
          </div>
          <div class="flex justify-between">
            <span class="font-bold">${bid.amount || 0} Credits</span>
            <div class="flex items-center gap-1">
              <img src="${seller?.avatar?.url || '../images/placeholder-avatar.png'}" 
                  alt="Username avatar" class="w-6.25 h-6.25 rounded-full object-cover">
              <strong class="font-bold max-w-25 truncate block">${seller?.name || 'Unknown'}</strong>
            </div>
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

  document.title = `BidVerse | Profile | ${profile.data.name}`;

  document.getElementById("meta-title").setAttribute("content", `BidVerse | Profile | ${profile.data.name}`);
  document.getElementById("meta-description").setAttribute("content", `View and manage the profile of ${profile.data.name} on BidVerse. Check their listings, bio, and auction activity.`);

  username.textContent = profile.data.name || "Username";
  credits.textContent = profile.data.credits || 0;
  bio.textContent = profile.data.bio || "User has no bio..";

  avatar.src = profile.data.avatar?.url || "../images/placeholder-avatar.png";
  avatar.alt = `${profile.data.name}'s avatar`;
  banner.src = profile.data.banner?.url || "../images/banner.png";
  banner.alt = `${profile.data.name}'s banner`;

  // Fetch listings and bids
  let userListings = await getUserListings(user.name);
  let userBids = await getUserBids(user.name);


  // Event listeners
  listingsBtn.addEventListener("click", () => {
    activeTab(listingsBtn);
    showListingSkeletons(8);

    setTimeout(() => {
      renderThumbnails(userListings);
    }, 150);
  });

  bidsBtn.addEventListener("click", async () => {
    activeTab(bidsBtn);
    showBidSkeletons(8);

    await renderBidThumbnails(userBids);
  });

  // Initialize with listings
  activeTab(listingsBtn);
  showListingSkeletons(8);

  setTimeout(() => {
    renderThumbnails(userListings);
  }, 150);
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
    } else {
      timer.classList.add("bg-secondary", "text-primary", "border-primary");
      timer.classList.remove("bg-light-error", "text-error", "border-error");
    }
  });
}


// Log out button
logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  clearStorage();
  location.href = "../login/index.html"
})

async function loadPage() {
  showPageLoader();

  try {
    await loadProfile();

    hidePageLoader();
  } catch (error) {
    pageLoader.innerHTML = `
      <p class="text-center text-primary text-xl font-bold">
        Failed to load page. Please try again.
      </p>
    `;
  }
}

loadPage();