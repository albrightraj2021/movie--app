import { loginUser, registerUser, logoutUser, refreshToken as refreshAuthToken } from './api';

export const login = async (email, password, longExpiry = false) => {
  return loginUser(email, password, longExpiry);
};

export const register = async (email, password) => {
  return registerUser(email, password);
};

export const logout = async (token, refreshTokenValue) => {
  return logoutUser(token, refreshTokenValue);
};

export const refreshToken = async () => {
  return refreshAuthToken();
};

// Optional: Function to decode JWT (if you need to extract info like expiry directly)
// You might need a library like jwt-decode for this
// import { jwtDecode } from 'jwt-decode'; // yarn add jwt-decode or npm install jwt-decode
// export const decodeToken = (token) => {
//   try {
//     return jwtDecode(token);
//   } catch (error) {
//     console.error("Failed to decode token:", error);
//     return null;
//   }
// };

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  // Optionally, you could check token expiry here if you decode it
  return !!token;
};

export const getUserEmail = () => {
  return localStorage.getItem('userEmail');
};
