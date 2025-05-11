import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getPersonDetails } from '../services/api';
import { AuthContext } from '../App';
// import { Bar } from 'react-chartjs-2'; // yarn add react-chartjs-2 chart.js
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './PersonDetails.css';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PersonDetails = () => {
  const { personId } = useParams();
  const { isLoggedIn, token } = useContext(AuthContext);
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination for roles
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 10;

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // getPersonDetails now uses the correct endpoint format
        const data = await getPersonDetails(personId);
        setPerson(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch person details. Token might be invalid or expired.');
        if (err.message.includes("Authorization header") || err.message.includes("Token")) {
            // Potentially trigger logout or token refresh here if not handled by fetchWithAuth
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [personId, isLoggedIn, token]); // re-fetch if token changes (e.g. after refresh)

  if (!isLoggedIn && !loading) {
    return (
      <div className="person-details-container unauthorized">
        <h2>Access Denied</h2>
        <p>You must be logged in to view person details.</p>
        <p><Link to="/login">Please login</Link> or <Link to="/register">register</Link>.</p>
      </div>
    );
  }

  if (loading) return <p>Loading person details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!person) return <p>Person not found or access denied.</p>;

  // Chart data preparation (Example: IMDb ratings distribution)
  // const ratingsData = person.roles?.reduce((acc, role) => {
  //   const rating = Math.floor(role.imdbRating);
  //   if (rating) {
  //     acc[rating] = (acc[rating] || 0) + 1;
  //   }
  //   return acc;
  // }, {});

  // const chartData = {
  //   labels: ratingsData ? Object.keys(ratingsData).sort((a,b) => a-b).map(r => `${r}-${r}.9`) : [],
  //   datasets: [
  //     {
  //       label: 'Number of Films by IMDb Rating',
  //       data: ratingsData ? Object.values(ratingsData) : [],
  //       backgroundColor: 'rgba(75, 192, 192, 0.6)',
  //     },
  //   ],
  // };
  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: { position: 'top' },
  //     title: { display: true, text: 'IMDb Ratings at a Glance' },
  //   },
  //   scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  // };

  // Pagination logic for roles
  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = person.roles?.slice(indexOfFirstRole, indexOfLastRole) || [];
  const totalRolePages = Math.ceil((person.roles?.length || 0) / rolesPerPage);

  const paginateRoles = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="person-details-container">
      <h2>{person.name}</h2>
      <p><strong>Born:</strong> {person.birthYear || 'N/A'}</p>
      {person.deathYear && <p><strong>Died:</strong> {person.deathYear}</p>}

      <h3>Roles</h3>
      {currentRoles.length > 0 ? (
        <>
          <table className="roles-table">
            <thead>
              <tr>
                <th>Movie Name</th>
                <th>Category</th>
                <th>Characters</th>
                <th>IMDb Rating</th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.map((role, index) => (
                <tr key={`${role.movieId}-${index}`}>
                  <td><Link to={`/movie/${role.movieId}`}>{role.movieName}</Link></td>
                  <td>{role.category}</td>
                  <td>{role.characters?.join(', ') || '-'}</td>
                  <td>{role.imdbRating || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalRolePages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalRolePages }, (_, i) => i + 1).map(number => (
                <button key={number} onClick={() => paginateRoles(number)} className={currentPage === number ? 'active' : ''}>
                  {number}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>No roles found for this person.</p>
      )}

      {/* <div className="chart-container">
        {person.roles && person.roles.length > 0 ? (
          // <Bar options={chartOptions} data={chartData} />
          <p>Chart will be displayed here if react-chartjs-2 is installed and configured.</p>
        ) : (
          <p>Not enough data for a chart.</p>
        )}
      </div> */}
    </div>
  );
};

export default PersonDetails;
