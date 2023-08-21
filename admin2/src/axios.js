import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://netflixclone01-mongo-api-portfolio.onrender.com/api/",
  withCredentials: true,
});
