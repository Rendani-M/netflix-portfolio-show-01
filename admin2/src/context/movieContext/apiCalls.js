import {
  createMovieFailure,
  createMovieStart,
  createMovieSuccess,
  deleteMovieFailure,
  deleteMovieStart,
  deleteMovieSuccess,
  getMovieFailure,
  getMovieStart,
  getMovieSuccess,
  getMoviesFailure,
  getMoviesStart,
  getMoviesSuccess,
  updateMovieFailure,
  updateMovieStart,
  updateMovieSuccess,
} from "./MovieActions";
import { makeRequest } from "../../axios";

//get All movies
export const getMovies = async (dispatch) => {
  dispatch(getMoviesStart());
  try {
    const res = await makeRequest.get("/movies", {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    });
    dispatch(getMoviesSuccess(res.data));
  } catch (err) {
    dispatch(getMoviesFailure());
  }
};

//get a movie
export const getMovie = async (id, dispatch) => {
  dispatch(getMovieStart());
  try {
    const res = await makeRequest.get(`/movies/find/${id}`, {
      headers: {
        Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    });
    dispatch(getMovieSuccess(res.data));
  } catch (err) {
    dispatch(getMovieFailure());
  }
};

//create
export const createMovie = async (movie, dispatch) => {
  dispatch(createMovieStart());
  await makeRequest.post("/movies", movie, {
    headers: {
      token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
    },
  }).then (function (response) { // add a then method to handle the success response
      alert("Movie created successfully!"); // display a success message in an alert box
      dispatch(createMovieSuccess(response.data)); // move the dispatch action here
  }).catch (function (error) { // add a catch method to handle the error response
      alert(error.response.data.message); // display the custom message in an alert box
      dispatch(createMovieFailure()); // move the dispatch action here
  });
 };
 
//delete
export const updateMovie = async (id, inputs, dispatch) => {
  dispatch(updateMovieStart());
  try {
    const movie = await makeRequest.put("/movies/" + id, inputs, {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    });
    dispatch(updateMovieSuccess(movie.data));
    return movie.data;
  } catch (err) {
    dispatch(updateMovieFailure());
    throw err;
  }
};


//delete
export const deleteMovie = async (id, dispatch) => {
  dispatch(deleteMovieStart());
  try {
    await makeRequest.delete("/movies/" + id, {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    });
    dispatch(deleteMovieSuccess(id));
  } catch (err) {
    dispatch(deleteMovieFailure());
  }
};
