import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("currentUser");

      if (token && storedUser) {
        try {
          // Parse the stored user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (err) {
          console.error('Error parsing stored user data:', err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post("/user/login", { email, password });
    // Handle the nested token structure from backend
    localStorage.setItem("access_token", res.data.token.access_token);
    localStorage.setItem("currentUser", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
