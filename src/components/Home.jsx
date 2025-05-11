import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // We'll create this CSS file

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Firstname Lastname's Fabulous Movie Searching Website</h1>
      </header>
      <section className="hero-section">
        <img 
          src="https://placehold.co/600x400?text=MoiveGo" 
          alt="Old fashioned film projector" 
          className="hero-image"
        />
        <h2>I hope you find the movie you're after!</h2>
      </section>
      <section className="cta-section">
        <p>Explore our vast collection of movies. Find details, ratings, and more.</p>
        <Link to="/movies" className="cta-button">Search Movies</Link>
      </section>
    </div>
  );
};

export default Home;
