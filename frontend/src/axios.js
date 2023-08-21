import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://netflixclone-mongo-api-portfolio-01.onrender.com/api/",
  withCredentials: true,
});