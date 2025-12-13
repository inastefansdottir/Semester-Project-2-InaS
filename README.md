# BidVerse

<img src="images/logo.svg" alt="BidVerse logo" width="500"/>

BidVerse is a modern auction-style web application built for Noroff – Semester Project 2.
The platform allows users to browse listings, create auctions, place bids, and manage their profiles in a responsive and user-friendly interface.

The project focuses on frontend architecture, API integration, responsive design, and accessibility, using HTML, Tailwind CSS, and Vanilla JavaScript.


## Table of Contents  
1. [Project Overview](#project-overview)
2. [User Stories](#user-stories)
3. [Features](#features)
4. [Extra Features](#extra-features)
5. [Design & UX](#design--ux)
6. [Tech Stack](#tech-stack)
7. [Installation](#installation)


## Project Overview  
BidVerse is an auction marketplace where users can create time-limited listings and bid on items created by other users.

- **Visitors:** Can browse listings and view auction details
- **Registered users:** Can create listings, place bids, manage their listings, and manage their profile.

The project was developed in accordance with Noroff’s Semester Project 2 requirements, with an emphasis on a simple, modern UI, accessibility, responsive layouts, and structured JavaScript code. 


## User Stories 
| Page                | Endpoint                                 | Role         | Goal                                                |
|---------------------|------------------------------------------|--------------|-----------------------------------------------------|
| Register            | POST /auth/register                      | Visitor      | Create a new user account.                          |
| Login               | POST /auth/login                         | Visitor      | Login with email + password.                        |
| Browse listings     | GET /auction/listings                    | Visitor      | View all active auction listings.                   |
| Individual Listing  | GET /auction/listings/:id                | Visitor      | See details, images, and bids for a listing.        |
| Search Listings     | GET /auction/listings/search?q=query     | Visitor      | Search through listings.                            |
| Create Listing      | POST /auction/listings                   | User         | Create an auction with title, images, and end date. |
| Bid on Listing      | POST /auction/listings/:id/bids          | User         | Bid on another user’s listing                       |
| Edit/Delete Listing | PUT & DELETE /auction/listings/:id       | User         | Modify or delete my own listing.                    |
| Profile             | GET /auction/profiles/:username          | User         | View profile details.                               |
| Update Profile      | PUT /auction/profiles/:username          | User         | Update avatar, banner and bio.                      |
| Get User Listings   | GET /auction/profiles/:username/listings | User         | View your own listings.                             |
| Get User Bids       | GET /auction/profiles/:username/bids     | User         | View your own bids.                                 |


## Features  
### Core Features  
- User registration and login
- Browse active auction listings 
- View individual listing details
- Create new listings with images and end date
- Place bids on listings 
- Credit-based bidding system
- Profile page with listings and bids
- Search for listings
- Responsive navigation (desktop & mobile)  

### Extra Features  
- **Cloudinary integration** → upload images from device instead of pasting URLs  
- **Custom placeholders** → shown if images fail to load  
- Error and validation feedback (form-level messages)
- Loading states for async actions (create listing form)
- Fully **responsive design** with desktop & mobile navbars  
- Accessible form labels and focus states
- Clean and consistent UI using Tailwind CSS
- Defensive UI for edge cases (no bids, expired listings, etc.)
- Thoughtful UI/UX to make the app intuitive  


## Design & UX 
**Colors:**  
- **Design approach:** Minimal, modern, and intuitive
- **Responsiveness:** Fully responsive across mobile, tablet, and desktop
- **Accessibility:** Semantic HTML, visible focus states, accessible labels
- **Consistency:** Consistent button styling and component styling across the site

## Tech Stack  
- **Markup:** HTML5
- **Styling:** Tailwind CSS 
- **JavaScript:** Vanilla JavaScript (ES6 modules)
- **Icons:** Ionicons and Font Awesome 
- **Image Hosting:** Cloudinary  
- **API:** Noroff Auth and Auction API
- **Build Tooling:** npm, Tailwind CLI


## Installation  
To get a local copy of this project up and running:  

1. Clone the repo:  
   ```bash
   git clone https://github.com/inastefansdottir/Semester-Project-2-InaS.git
   cd Semester-Project-2-InaS

2. Install dependencies:
   ```bash
   npm install

3. Start the development server:
   ```bash
   npm run dev

4. Open the app in your browser:
  - If using the development server with Tailwind CLI:
     ```bash
    http://localhost:5173

- Or, if using Live Server in your editor:
- Start Live Server from the project folder
- The app will open in your default browser

Note: Node.js is required for the Tailwind build. 
