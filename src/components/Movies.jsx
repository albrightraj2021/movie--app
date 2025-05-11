import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies } from '../services/api';
import './Movies.css'; // We'll create this CSS file

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const years = ['Any Year', ...Array.from({ length: 2023 - 1990 + 1 }, (_, i) => 2023 - i)];

  const fetchMovies = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const yearToSearch = searchYear === 'Any Year' || !searchYear ? '' : searchYear;
      const data = await searchMovies(searchTerm, yearToSearch, page);
      setMovies(data.data || []);
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.lastPage);
        setTotalResults(data.pagination.total);
      } else {
        // Handle cases where pagination might be missing for single-page results
        setCurrentPage(1);
        setTotalPages(1);
        setTotalResults(data.data ? data.data.length : 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch movies.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchYear]);

  useEffect(() => {
    fetchMovies(1); // Fetch on initial load or when search terms change
  }, [fetchMovies]); // Removed currentPage from dependency array to avoid double fetch on page change

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchMovies(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchMovies(newPage);
    }
  };

  return (
    <div className="movies-container">
      <h2>Search Movies</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Movies containing the text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label htmlFor="year-select">From:</label>
        <select 
          id="year-select"
          value={searchYear} 
          onChange={(e) => setSearchYear(e.target.value)}
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {loading && movies.length === 0 && <p>Loading movies...</p>}
      
      {!loading && movies.length === 0 && !error && <p>No movies found for your criteria.</p>}

      {movies.length > 0 && (
        <>
          <div className="results-summary">
            Showing {((currentPage - 1) * 100) + 1}-{Math.min(currentPage * 100, totalResults)} of {totalResults} results
          </div>
          <table className="movies-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Year</th>
                <th>IMDb Rating</th>
                <th>Rotten Tomatoes</th>
                <th>Metacritic</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.imdbID}>
                  <td><Link to={`/movie/${movie.imdbID}`}>{movie.title}</Link></td>
                  <td>{movie.year}</td>
                  <td>{movie.imdbRating || 'N/A'}</td>
                  <td>{movie.rottenTomatoesRating ? `${movie.rottenTomatoesRating}%` : 'N/A'}</td>
                  <td>{movie.metacriticRating || 'N/A'}</td>
                  <td>{movie.classification || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1 || loading}
            >
              &lt;&lt; Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages || loading}
            >
              Next &gt;&gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Movies;
