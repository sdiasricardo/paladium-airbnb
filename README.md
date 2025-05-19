# Airbnb-like Project

A simple Airbnb clone built with React, TypeScript, and IndexDB. There are 4 versions for this website:
### V0:
- Implemented the MVP: a working website, without any css
### V1:
- Added the postconfig CSS (Tailwind) to V0
### V2:
- Refactor APIs for a better design
- Added calendar with blocked book dates
- Added dashboard with bookings and revenue (with chart)
- Added amenities (mandatory and optional)
- Implemented visible address vs full address
### V3
- Added aximum number of guests
- Added earch bar with filters
- Added cancel booking feature
- Changed the imaging from URL to encoded PNG, so that hosts can add multiple images

## Use of AI
For this project, I relied on Amazon Q Pro AI assistant, integrated with VSCode to help me build the code, specially for the front end components, since I do not have a huge familiarity with them.

The first step was to use the following prompt to generate the initial code:
```
I want to do an Airbnb-like project, with the following requirements:

- Users can create accounts as either guest or host.
- Hosts can:
- Add new properties with pictures.
- View a list of their own properties.
- Guests can:
- Browse available properties.
- Rent a property (only if it’s not already booked for the selected date).
- A property cannot be rented by more than one guest for the same time period.

For the stack, I want to use React.js with typescript. You can use any libraries you like.
For the data base, use SQLite.

There is no need to create a whole backend, we can directly access the database through the front end.
```

Then, the AI did its job and gave me the initial project files (you can see the "initial commit" to see exactly what it gave me). Obviously, it had some issues, regarding Vite and Tailwind, which I solved manually.

With the Version 0 ready (V0 branch on this repository), I moved on to add the remaining features I wanted:
- Dates through calendars
- Amenities (some mandatory, some optional)
- Visible address vs full address
- Cancel bookings
- Search bar (with filters)
- Dashboards for hosts

To add theses features, I went for an atomic behaviour: for each feature, I gave Amazon Q a prompt, as detailed as possible, and let it implement. Then, I tested it through the web and, if necessary, did manual corrections by myself. Here there is an example of a prompt I used to construct the Serch Bar:
```
I want to add a search bar, so that guests can search for properties based on their description and address.

The search bar should also contain a filter, that allow guests to filter their searches based on amenities, price range, number of guests, and number of rooms and bathrooms.
```
Overall, this dynamic worked very well. Naturally, Amazon Q left some details aside, but they could be easily solved either manually, or with a new prompt asking for the fix/addition.

## Features

- User authentication (guest/host)
- Property listing and browsing
- Property booking system
- Host property management

## Tech Stack

- React.js with TypeScript
- IndexDB database (direct access from frontend)
- React Router for navigation
- Tailwind CSS for styling

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## User Types

### Guest
- Browse available properties
- Book properties for specific dates
- View booking history

### Host
- Add new properties with details and images
- View and manage their property listings
- View and manage their upcoming bookings
- Dashboard with montly revenue, properties and booking summary