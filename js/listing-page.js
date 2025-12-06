import { getListingById, bidOnListing } from "./api.js";
import { loadNavbarUser } from "./navbar.js";

const title = document.getElementById("title");
const description = document.getElementById("description");
const authorImage = document.getElementById("authorImage");
const authorName = document.getElementById("authorName");

const mainThumbnail = document.getElementById("mainThumbnail");
const thumbnailsButtons = document.getElementById("thumbnailsButtons");

const endsAt = document.getElementById("endsAt");
const highestBidderAvatar = document.getElementById("highestBidderAvatar");
const highestBidderCredits = document.getElementById("highestBidderCredits");

const biddersContainer = document.getElementById("biddersContainer");

// elemnts for bid function
const bidForm = document.getElementById("bidForm");
const bidAmountInput = document.getElementById("bidAmount");
const bidButton = document.getElementById("bidButton");
const bidError = document.getElementById("bidError");

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

let currentListing = null; // store latest listing data globally

// Utilities
function formatBidDate(isoString) {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}:${seconds}`
  };
}

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

function updateEndsAt() {
  const timeString = formatTimeRemaining(endsAt.dataset.time);
  endsAt.innerHTML = `${timeString}`;
}

function shortenName(name, maxLength = 10) {
  return name.length > maxLength ? name.slice(0, maxLength) + "…" : name;
}

// Bid list refresh
async function refreshBidList() {
  const updated = await getListingById(listingId);
  currentListing = updated;

  biddersContainer.innerHTML = "";

  if (updated.bids.length === 0) {
    biddersContainer.innerHTML = `<p class="text-neutral-500 self-center">No one has made a bid on this listing yet</p>`;
    return;
  }

  updated.bids.forEach(bid => {
    const wrapper = document.createElement("div");
    wrapper.className = "grid grid-cols-[57px_1fr] auto-rows-auto";

    const bidTime = formatBidDate(bid.created);
    const shortName = shortenName(bid.bidder.name);

    wrapper.innerHTML = `
      <img src="${bid.bidder.avatar.url}" alt="${bid.bidder.avatar.alt}" class="h-[47px] w-[47px] rounded-full object-cover row-span-2">
      <p class="font-bold text-[18px] col-start-2">Bid: ${bid.amount} credits</p>
      <div class="flex justify-between col-start-2">
        <p class="text-neutral-500">By ${shortName}</p>
        <p class="font-roboto-mono">${bidTime.date} <span class="text-neutral-500 ml-1 max-[485px]:hidden">${bidTime.time}</span></p>
      </div>
    `;

    biddersContainer.appendChild(wrapper);
  });
}

// Highest bid update
function updateHighestBid(newAmount) {
  const LoggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  highestBidderCredits.textContent = newAmount;
  highestBidderAvatar.src = LoggedInUser.avatar.url;
  highestBidderAvatar.alt = LoggedInUser.name;
}

// Bidding handler
bidForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  bidError.textContent = "";

  const amount = parseInt(bidAmountInput.value);

  // Validate input
  if (isNaN(amount)) {
    alert("Please enter a valid number.");
    return;
  }

  // Always get newest data before bidding
  const latest = await getListingById(listingId);
  currentListing = latest;

  // Check auction ended
  if (new Date(latest.endsAt) <= new Date()) {
    bidError.textContent = "This auction has ended.";
    return;
  }

  // Check not bidding on own listing
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user.name === latest.seller.name) {
    bidError.textContent = "You cannot bid on your own listing.";
    return;
  }

  // Determine highest bid
  const highestBid = latest.bids.length
    ? Math.max(...latest.bids.map((b) => b.amount))
    : 0;

  if (amount <= highestBid) {
    bidError.textContent = `Your bid must be higher than ${highestBid}.`;
    return;
  }

  // Send API request
  const result = await bidOnListing(listingId, amount);

  if (!result) {
    bidError.textContent = "Failed to place bid. Try again.";
    return;
  }

  loadNavbarUser();

  // Success
  bidAmountInput.value = "";
  updateHighestBid(amount);
  await refreshBidList();

  const updatedUser = await refreshUserProfile();
  if (updatedUser) {
    updateNavbarCredits(updatedUser.credits);
  }
})

async function setupListingPage(listing) {
  currentListing = listing;

  // Update page content dynamically
  document.title = `BidVerse | Listings | ${listing.title}`;
  title.textContent = listing.title;
  description.textContent = listing.description;
  authorImage.src = listing.seller.avatar.url
  authorImage.alt = listing.seller.avatar.alt
  authorName.textContent = listing.seller.name

  // Calculate highest bid
  let highestBid = null;
  if (listing.bids.length > 0) {
    highestBid = listing.bids.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max
    );
  }

  if (highestBid) {
    highestBidderCredits.textContent = highestBid.amount;
    highestBidderAvatar.src = highestBid.bidder.avatar.url || "../images/placeholder-avatar.png";
    highestBidderAvatar.alt = highestBid.bidder.avatar.alt || "Highest bidder avatar";
  } else {
    // There are no bids
    highestBidderCredits.textContent = "0";
    highestBidderAvatar.src = "../images/placeholder-avatar.png";
    highestBidderAvatar.alt = "No bids yet";
  }

  // Image gallery section
  mainThumbnail.src = listing.media[0]?.url || "../images/no-image.png"
  mainThumbnail.alt = listing.media[0]?.alt || listing.title;

  thumbnailsButtons.innerHTML = ""; // Clear any exisiting thumbnails

  listing.media.forEach((image, index) => {
    const thumb = document.createElement("img");

    thumb.src = image.url;
    thumb.alt = image.alt || `Image ${index + 1}`;
    thumb.className =
      "w-[104px] h-[104px] object-cover rounded-[10px] cursor-pointer max-[485px]:w-20 max-[485px]:h-20";

    // Clicking a thumbnail updates the main image
    thumb.addEventListener("click", () => {
      mainThumbnail.src = image.url;
      mainThumbnail.alt = image.alt || listing.title;
    })

    thumbnailsButtons.appendChild(thumb);
  })

  // Auction info section
  endsAt.dataset.time = listing.endsAt;
  updateEndsAt();
  setInterval(updateEndsAt, 1000);

  setInterval(refreshBidList, 10000);


  // All bids section
  listing.bids.forEach(bid => {
    const wrapper = document.createElement("div");
    wrapper.className = "grid grid-cols-[57px_1fr] auto-rows-auto";

    const bidTime = formatBidDate(bid.created);

    const shortName = shortenName(bid.bidder.name, 10);

    wrapper.innerHTML = `
      <img src="${bid.bidder.avatar.url}" alt="${bid.bidder.avatar.alt}" class="h-[47px] w-[47px] rounded-full row-span-2 object-cover">
      <p class="font-bold text-[18px] col-start-2">Bid: ${bid.amount} credits</p>
      <div class="flex justify-between col-start-2">
        <p class="text-neutral-500">By ${shortName}</p>
        <p class="font-roboto-mono">${bidTime.date} <span class="text-neutral-500 ml-1 max-[485px]:hidden">${bidTime.time}</span></p>
      </div>
    `;

    biddersContainer.appendChild(wrapper);
  })

  if (listing.bids.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.className = "text-neutral-500 self-center"
    paragraph.textContent = "No one has made a bid on this listing yet"
    biddersContainer.appendChild(paragraph);
  }

  const LoggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (LoggedInUser.name === listing.seller.name) {
    disableBidButton("You cannot bid on your own listing");
  }

  if (new Date(listing.endsAt) <= new Date()) {
    disableBidButton("This auction has ended");
  }

}

function disableBidButton(message) {
  bidButton.disabled = true;
  bidButton.classList.remove("bg-primary", "text-neutral-0");
  bidButton.classList.add("bg-accent", "text-secondary");
  bidError.textContent = message;
}

async function fetchListingPage(listingId) {
  try {
    const data = await getListingById(listingId);

    console.log("Listing data:", data);

    setupListingPage(data);
  } catch (error) {
    console.error("Error fetching listing data:", error);
  }
}

fetchListingPage(listingId);