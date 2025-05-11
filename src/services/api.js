const API_BASE_URL = 'http://4.237.58.241:3000';

// Function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Function to make authenticated API calls
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && url !== `${API_BASE_URL}/refresh`) { // Unauthorized
    // Try to refresh token
    const newTokens = await refreshToken();
    if (newTokens) {
      headers['Authorization'] = `Bearer ${newTokens.bearerToken.token}`;
      // Retry the original request with the new token
      const retryResponse = await fetch(url, { ...options, headers });
      return handleResponse(retryResponse);
    } else {
      // If refresh fails, logout or redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/login'; // Or use React Router navigate
      throw new Error('Session expired. Please login again.');
    }
  }
  return handleResponse(response);
};

// Search movies endpoint
export const searchMovies = async (title = '', year = '', page = 1) => {
  let query = `page=${page}`;
  if (title) query += `&title=${encodeURIComponent(title)}`;
  if (year) query += `&year=${year}`;
  
  // use correct endpoint: /movies/search
  const response = await fetch(`${API_BASE_URL}/movies/search?${query}`);
  return handleResponse(response);
};

// Get movie details endpoint
export const getMovieDetails = async (imdbID) => {
  // use root /data/{imdbID}
  const response = await fetch(`${API_BASE_URL}/data/${imdbID}`);
  return handleResponse(response);
};

// Get person details endpoint
export const getPersonDetails = async (personId) => {
  // use root /data/person/{personId} format following the pattern of getMovieDetails
  return fetchWithAuth(`${API_BASE_URL}/data/person/${personId}`);
};

// Register user endpoint
export const registerUser = async (email, password) => {
  // use root /register
  const response = await fetch(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Login user endpoint
export const loginUser = async (email, password, longExpiry = false) => {
  // use root /login
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, longExpiry }),
  });
  return handleResponse(response);
};

// Refresh token endpoint
export const refreshToken = async () => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) {
    return null;
  }
  try {
    // use root /refresh
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });
    const data = await handleResponse(response);
    if (data.bearerToken && data.refreshToken) {
      localStorage.setItem('token', data.bearerToken.token);
      localStorage.setItem('refreshToken', data.refreshToken.token);
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear tokens if refresh fails definitively (e.g. refresh token expired)
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    return null;
  }
};

// Logout user endpoint
export const logoutUser = async (token, refreshTokenValue) => {
  if (!refreshTokenValue) {
    console.warn("No refresh token found for logout");
    return { message: "Logged out locally" };
  }
  // use root /logout
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // The bearer token is still needed for this endpoint
    },
    body: JSON.stringify({ refreshToken: refreshTokenValue })
  });
  return handleResponse(response);
};
