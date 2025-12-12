import { fetchListings } from "./api.js";

// The container where all listing thumbnails will be displayed
const thumbnailsContainer = document.getElementById("thumbnailsContainer")

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
    // Make the wole card clickable
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
                  alt="Username avatar" class="w-6.25 h-6.25 rounded-full object-cover">
              <strong class="font-bold">${listing.seller?.name || 'Unknown'}</strong>
            </div>

            <a href="../all-listings/listing.html?id=${listing.id}" class="bg-primary text-neutral-0 font-bold text-[14px] px-5 py-1.25 rounded-full hover:bg-accent transition-colors duration-200">Place bid</a>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  });
}

/**
 * Determines how many listings should be shown based on Tailwind breakpoints
 * This matches the CSS grid styling exactly
 */
function getListingCount() {
  const width = window.innerWidth;

  if (width >= 1536) {
    return 4; // 2xl:grid-cols-4
  }

  if (width >= 1024) {
    return 3; // lg:grid-cols-3
  }

  if (width >= 630) {
    return 4; // min-[630px]:grid-cols-2
  }

  return 4; // max-[629px]:grid-cols-1
}

// Stores all fetched listings so we only fetch once
let allListings = [];

/** Load listings once.
 * Filters out expired listings older than 3 days.
 * Sorts by newest created date.
 * stores them in allListings.
 * Displats the correct amount based on screen size.
 */
async function loadListings() {
  const raw = await fetchListings(1); // fetch page 1

  // Filter + sort
  const now = new Date();
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  const filtered = raw
    .filter(l => {
      const endsAt = new Date(l.endsAt);
      // Keep active auctions
      if (endsAt > now) return true;

      // Keep ended listings ONLY if they ended within the last 3 days
      if (now - endsAt <= threeDays) return true;

      // Older than 3 days > do not show
      return false;
    })
    // Sort newest > oldest
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  allListings = filtered;

  updateDisplayedListings();
}

/**
 * Picks how many listings should be shown based on screen width.
 * Uses the sorted allListings list and slices the first X items.
 */
function updateDisplayedListings() {
  const count = getListingCount();

  // Select only the newest X listings (X depends on screen size)
  // Example: if count = 4 → show only the 4 most recent listings
  const limited = allListings.slice(0, count);

  renderThumbnails(limited);
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

/** Handle resizing */
window.addEventListener("resize", updateDisplayedListings);

/** Start */
loadListings();