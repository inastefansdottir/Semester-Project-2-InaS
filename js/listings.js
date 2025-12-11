import { fetchListings, searchListings } from "./api.js";

// The container where all listing thumbnails will be displayed
const thumbnailsContainer = document.getElementById("thumbnailsContainer")

// The "load more" button element
const loadMoreBtn = document.getElementById("loadMoreBtn")

const form = document.getElementById("searchForm");
const input = document.getElementById("search");

// All sort buttons in the UI
const sortButtons = document.querySelectorAll(".sort-btn");
// Empty by default so the page loads unsorted
let currentSort = "";

let currentPage = 1; // Track which page os listings we are currently on
let isLoading = false; // Prevent multiple simultaneous requests
let hasMore = true; // Track whether more pages exist

// Helper: returns the highest bid amount for a listing
function getHighestBid(listing) {
  return listing.bids?.length ? Math.max(...listing.bids.map(b => b.amount)) : 0;
}

// Sort listings depending on the type the user selected
function sortListings(listings, type) {
  switch (type) {
    case "endingSoon":
      // Closest end date first
      return listings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

    case "newest":
      // Latest created first
      return listings.sort((a, b) => new Date(b.created) - new Date(a.created));

    case "lowestBid":
      return listings.sort((a, b) => getHighestBid(a) - getHighestBid(b));

    case "highestBid":
      return listings.sort((a, b) => getHighestBid(b) - getHighestBid(a));

    case "mostBids":
      return listings.sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));

    default:
      // no sorting applied
      return listings;
  }
}

/**
 * When user clicks a sort button:
 * update the button UI
 * change currentSort
 * re-sort already loaded listings
 */
sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Reset styling on ALL buttons
    sortButtons.forEach(b => {
      b.classList.remove("bg-primary", "text-neutral-0");
      b.classList.add("bg-secondary", "text-primary");
    });

    // Highlight the active button
    btn.classList.add("bg-primary", "text-neutral-0");
    btn.classList.remove("bg-secondary", "text-primary");

    // Set current sort
    currentSort = btn.dataset.sort;

    // Re-render with sorting applied
    applySortingToRenderedListings();
  });
});

/**
 * Takes the thumbnails that are already on screen
 * and re-sorts them using the current sort type.
 */
function applySortingToRenderedListings() {
  const cards = Array.from(thumbnailsContainer.children);

  // Each thumbnail has its full listing object stored in data
  const listings = cards.map(card => card._data).filter(Boolean);

  const sorted = sortListings(listings, currentSort);

  // Re-render the sorted list
  renderThumbnails(sorted);
}


/**
 * Converts an end date into a readable countdown string
 * Example: "2d:5h:30m:12s"
 */
function formatTimeRemaining(endsAt) {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return "Ended"; // Auction has ended

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return `${days}d:${hours}h:${minutes}m:${seconds}s`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  try {
    const results = await searchListings(query);

    if (results.length === 0) {
      thumbnailsContainer.classList.remove("grid");
      thumbnailsContainer.innerHTML = `
        <p class="text-center text-primary text-xl font-bold pt-10">No results found.</p>
      `;
      return;
    }

    renderThumbnails(results); // replaces old thumbnails
  } catch (err) {
    thumbnailsContainer.innerHTML = `
    <p class="text-center text-primary text-xl font-bold pt-10">
      Failed to search listings. Please try again.
    </p>
  `;
    thumbnailsContainer.classList.remove("grid");
  }
});

input.addEventListener("input", async () => {
  loadMoreBtn.style.display = "none";

  const query = input.value.trim();

  if (!query) {
    thumbnailsContainer.innerHTML = "";
    currentPage = 1;
    hasMore = true;
    loadMoreBtn.style.display = "block"; // show load-more again
    loadNextPage(); // reload normal listings
    return;
  }

  const results = await searchListings(query);

  if (results.length === 0) {
    thumbnailsContainer.classList.remove("grid");
    thumbnailsContainer.innerHTML = `
      <p class="text-center text-primary text-xl font-bold pt-10">No results found.</p>
    `;
    return;
  }

  const sorted = sortListings(results, currentSort);
  renderThumbnails(sorted);
});


/**
 * Render thumbnails for a list of listings
 * @param {Array} listings - array of listing objects
 * @param {boolean} replace - if true, clears previous thumbnails; if false, appends
 */
function renderThumbnails(listings, replace = true) {
  if (replace) {
    thumbnailsContainer.innerHTML = ""; // Clear old thumbnails if needed
  }

  listings.forEach(listing => {
    const thumb = document.createElement("div");
    thumb.addEventListener("click", () => {
      window.location.href = `../all-listings/listing.html?id=${listing.id}`;
    });
    thumb.className = "p-4 rounded-2xl bg-neutral-0 border border-neutral-300 shadow-[0_6px_16px_0_rgba(102,102,255,0.25)] flex flex-col " +
      "transition-transform transition-shadow duration-200 " +
      "hover:scale-[1.02] hover:shadow-[0_6px_16px_0_rgba(102,102,255,0.45)] cursor-pointer";

    // Calculate highest bid
    const highestBid = listing.bids?.length ? Math.max(...listing.bids.map(b => b.amount)) : 0;

    // Build thumbnail HTML
    thumb.innerHTML = `
      <div class="relative">
        <div class="relative w-full aspect-square">
          <img src="${listing.media?.[0]?.url || "../images/no-image.png"}" alt="${listing.media?.[0]?.alt || listing.title || ''}" 
               class="absolute inset-0 w-full h-full object-cover rounded-xl">
        </div>
        <span class="timer-styling text-primary font-bold font-roboto-mono bg-secondary py-1 px-2.5 rounded-full border border-primary absolute top-2 left-2"
        data-endsAt="${listing.endsAt}">${listing.timer || ''}
        </span>
      </div>
      <div class="flex flex-col h-full">
        <span class="text-[18px] font-bold mt-2.5 wrap-break line-clamp-2">${listing.title}</span>
        <div class="mt-auto flex flex-col">
          <span class="text-[14px] text-neutral-500 leading-tight">current bid</span>
          <span class="font-bold leading-tight">${highestBid || 0} Credits</span>
          <div class="flex justify-between mt-2">
            <div class="flex items-center gap-1">
              <img src="${listing.seller?.avatar?.url || "../images/placeholder-avatar.png"}" 
                  alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
              <strong class="font-bold">${listing.seller?.name || 'Unknown'}</strong>
            </div>
            <a href="../all-listings/listing.html?id=${listing.id}" class="bg-primary text-neutral-0 font-bold text-[14px] px-5 py-[5px] rounded-full hover:bg-accent transition-colors duration-200">Place bid</a>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);

    thumb._data = listing; // store listing data inside the element

  });
}

/**
 * Load the next page of listings from the API
 * Applies filtering, sorting, and appends to the page
 */
async function loadNextPage() {
  if (isLoading || !hasMore) return; // prevent double requests

  isLoading = true;
  loadMoreBtn.disabled = true; // Disable button while loading

  try {
    const rawListings = await fetchListings(currentPage); // Fetch API for current page

    // If no listings returned, stop pagination
    if (!rawListings || rawListings.length === 0) {
      hasMore = false;
      loadMoreBtn.style.display = "none";
      return;
    }

    // Filter logic
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

    const filtered = rawListings.filter(listing => {
      const endsAt = new Date(listing.endsAt);

      if (endsAt > now) return true; // Listing is live
      if (now - endsAt <= threeDays) return true; // Ended less than 3 days ago
      return false; // older than 3 days > skip
    });

    // Skip empty pages automatically
    if (filtered.length === 0) {
      currentPage++;
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadNextPage(); // try next page
      return;
    }

    // Append filtered listings to container
    const sorted = sortListings(filtered, currentSort);
    renderThumbnails(sorted, false);


    currentPage++; // Move to next page for future requests
  } catch (error) {
    thumbnailsContainer.classList.remove("grid");
    thumbnailsContainer.innerHTML = `
    <p class="text-center text-primary text-xl font-bold pt-10">
      Failed to load listings. Please try again.
    </p>
  `;
  }

  isLoading = false;
  loadMoreBtn.disabled = false;
}

// Initial load of listings
loadNextPage();

// Button click to load more listings
loadMoreBtn.addEventListener("click", () => {
  loadNextPage();
});

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

