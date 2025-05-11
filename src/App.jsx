import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'

// Import actual components
import Home from './components/Home';
import Movies from './components/Movies';
import MovieDetails from './components/MovieDetails';
import PersonDetails from './components/PersonDetails';
import Register from './components/Register';
import Login from './components/Login';

import { logoutUser, refreshToken as refreshApiServiceToken } from './services/api';

// Create context for authentication state with a default value
export const AuthContext = createContext({
  isLoggedIn: false,
  userEmail: '',
  token: null,
  refreshToken: null,
  login: () => {},
  logout: async () => {},
});

// Navigation component to use useNavigate hook
const NavigationLinks = () => {
  const { isLoggedIn, userEmail, logout: contextLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await contextLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/movies">Movies</Link></li>
        {!isLoggedIn ? (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        ) : (
          <>
            <li className="user-email">{userEmail}</li>
            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Check for existing token on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedToken && storedEmail && storedRefreshToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
      setUserEmail(storedEmail);
      setRefreshToken(storedRefreshToken);
    } else {
      // Clear any partial auth state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      setIsLoggedIn(false);
      setUserEmail('');
      setToken(null);
      setRefreshToken(null);
    }
  }, []);

  const performLogin = useCallback((email, bearerTokenVal, refreshTokenVal) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setToken(bearerTokenVal);
    setRefreshToken(refreshTokenVal);
    localStorage.setItem('token', bearerTokenVal);
    localStorage.setItem('refreshToken', refreshTokenVal);
    localStorage.setItem('userEmail', email);
  }, []);

  const performLogout = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    const currentRefreshToken = localStorage.getItem('refreshToken');

    if (currentRefreshToken && currentToken) {
      try {
        await logoutUser(currentToken, currentRefreshToken);
        console.log("Successfully logged out from API.");
      } catch (error) {
        console.error('API Logout error:', error.message);
        // Proceed with local logout even if API call fails
      }
    }
    
    // Clear state and local storage
    setIsLoggedIn(false);
    setUserEmail('');
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  }, []);

  // Setup token refresh interval
  useEffect(() => {
    let intervalId;
    if (isLoggedIn && refreshToken) {
      const attemptTokenRefresh = async () => {
        try {
          console.log("Attempting token refresh...");
          const newTokens = await refreshApiServiceToken();
          if (newTokens && newTokens.bearerToken && newTokens.refreshToken) {
            setToken(newTokens.bearerToken.token);
            setRefreshToken(newTokens.refreshToken.token);
            localStorage.setItem('token', newTokens.bearerToken.token);
            localStorage.setItem('refreshToken', newTokens.refreshToken.token);
            console.log("Token refreshed successfully.");
          } else {
            console.log("Token refresh failed, logging out.");
            await performLogout();
          }
        } catch (error) {
          console.error('Error during scheduled token refresh:', error);
          await performLogout();
        }
      };
      
      const refreshInterval = (600 - 60) * 1000; // 9 minutes
      intervalId = setInterval(attemptTokenRefresh, refreshInterval);
    }
    return () => clearInterval(intervalId);
  }, [isLoggedIn, refreshToken, performLogout]);

  const authContextValue = useMemo(() => ({
    isLoggedIn,
    userEmail,
    token,
    refreshToken,
    login: performLogin,
    logout: performLogout
  }), [isLoggedIn, userEmail, token, refreshToken, performLogin, performLogout]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <div className="app-container">
          <NavigationLinks />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:imdbID" element={<MovieDetails />} />
              <Route path="/person/:personId" element={<PersonDetails />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
            </Routes>
          </main>

          <footer className="footer">
            <p>All data is from IMDB, Metacritic and RottenTomatoes. &copy; {new Date().getFullYear()} Your Name</p>
          </footer>
          
          
        </div>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
