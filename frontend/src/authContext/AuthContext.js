import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    console.log("loging in")
    const res = await axios.post("https://netflixclone01-mongo-api-portfolio.onrender.com/api/auth/login", inputs, {
      withCredentials: true,
    });
    setCurrentUser(res.data)
  };

  const logout = async () => {
    setCurrentUser(null)
  };

  const update = async (inputs, userId) => {
    console.log("userInput:", inputs);

    console.log("id",userId)
      const res = await axios.put(`https://netflixclone01-mongo-api-portfolio.onrender.com/api/users/${userId}`, inputs,  {
        withCredentials: true,
        }
      ); 
      setCurrentUser(res.data);
      return res;
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{currentUser, login, logout, update}}
    >
      {children}
    </AuthContext.Provider>
  );
};
