# Movie App

A React + Vite web application for searching and analysing movies using a REST API.

## Features

- Search movies by title and year, with pagination
- View detailed information about each movie
- Register and login to access additional features
- View information about people (actors, directors, etc.) after login
- Responsive navigation and user session management

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## API

This app uses the REST API documented at [http://4.237.58.241:3000/](http://4.237.58.241:3000/).

## Notes

- You must register and login to access person details.
- Tokens expire after 10 minutes; the app will prompt you to re-login or refresh as needed.

---
All data is from IMDB, Metacritic and RottenTomatoes. (c) 2025 Your Name
