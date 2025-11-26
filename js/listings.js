import { fetchListings } from "./api.js";

const thumbnailsContainer = document.getElementById("thumbnailsContainer")

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


function renderThumbnails(listings) {
  thumbnailsContainer.innerHTML = "";

  listings.forEach(listing => {
    const thumb = document.createElement("div");
    thumb.className = "p-4 rounded-2xl bg-neutral-0 shadow-[0_4px_10px_0_rgba(102,102,255,0.30)] border border-neutral-300 flex flex-col";

    const highestBid = listing.bids?.length ? Math.max(...listing.bids.map(b => b.amount)) : 0;

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
        <div class="mt-auto">
          <span class="text-[14px] text-neutral-500">current bid</span>
          <div class="flex justify-between">
            <span class="font-bold">${highestBid || 0} Credits</span>
            <div class="flex items-center gap-1">
              <img src="${listing.seller?.avatar?.url || "../images/placeholder-avatar.png"}" 
                  alt="Username avatar" class="w-[25px] h-[25px] rounded-full object-cover">
              <strong class="font-bold">${listing.seller?.name || 'Unknown'}</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    thumbnailsContainer.appendChild(thumb);
  });
}

async function main() {
  const listings = await fetchListings();
  console.log(listings)

  renderThumbnails(listings);
}

main();

setInterval(updateAllTimers, 1000);

function updateAllTimers() {
  const timers = document.querySelectorAll(".timer-styling");

  timers.forEach(timer => {
    const endsAt = timer.dataset.endsat;
    const timeText = formatTimeRemaining(endsAt);

    timer.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeText}`;

    // Ended → change visual style
    if (timeText === "Ended") {
      timer.classList.add("bg-light-error", "text-error", "border-error");
      timer.classList.remove("bg-secondary", "text-primary", "border-primary");
    }
  });
}