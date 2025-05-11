import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieDetails } from '../services/api';
import { AuthContext } from '../App'; // To check login status for person links
import './MovieDetails.css'; // We'll create this CSS file

const MovieDetails = () => {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMovieDetails(imdbID);
        setMovie(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch movie details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [imdbID]);

  if (loading) return <p>Loading movie details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  const getRatingValue = (sourceName) => {
    const rating = movie.ratings?.find(r => r.source === sourceName);
    return rating ? rating.value : 'N/A';
  };

  return (
    <div className="movie-details-container">
      <div className="movie-header">
        <h1>{movie.title} ({movie.year})</h1>
        {movie.poster && <img src={movie.poster} alt={`${movie.title} poster`} className="movie-poster-small" />}
      </div>
      
      <div className="movie-info-layout">
        <div className="movie-main-info">
          <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
          <p><strong>Genres:</strong> {movie.genres?.join(', ') || 'N/A'}</p>
          <p><strong>Country:</strong> {movie.country || 'N/A'}</p>
          <p><strong>Box Office:</strong> {movie.boxoffice ? `$${movie.boxoffice.toLocaleString()}` : 'N/A'}</p>
          <p><strong>Plot:</strong> {movie.plot || 'N/A'}</p>
        </div>
        {movie.poster && (
          <div className="movie-poster-large-container">
            <img src={movie.poster} alt={`${movie.title} poster`} className="movie-poster-large" />
          </div>
        )}
      </div>

      <div className="movie-ratings-principals">
        <div className="movie-ratings">
          <h3>Ratings</h3>
          <p><strong>IMDb:</strong> {getRatingValue('Internet Movie Database')}/10</p>
          <p><strong>Rotten Tomatoes:</strong> {getRatingValue('Rotten Tomatoes')}%</p>
          <p><strong>Metacritic:</strong> {getRatingValue('Metacritic')}/100</p>
        </div>

        <div className="movie-principals">
          <h3>Principals</h3>
          {movie.principals && movie.principals.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Characters</th>
                </tr>
              </thead>
              <tbody>
                {movie.principals.map((principal) => (
                  <tr key={principal.id}>
                    <td>
                      {isLoggedIn ? (
                        <Link to={`/person/${principal.id}`}>{principal.name}</Link>
                      ) : (
                        principal.name // Or show a message/disable link
                      )}
                    </td>
                    <td>{principal.category}</td>
                    <td>{principal.characters?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No principal cast/crew information available.</p>
          )}
           {!isLoggedIn && movie.principals && movie.principals.length > 0 && (
            <p className="login-prompt-principals">
              <Link to="/login">Login</Link> to view details about cast and crew.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
