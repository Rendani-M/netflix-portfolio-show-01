import { loginFailure, loginStart, loginSuccess } from "./AuthActions";
import { makeRequest } from "../axios";
import { Navigate } from "react-router-dom";

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await makeRequest.post("auth/login", user);
    console.log(res.data)
    dispatch(loginSuccess(res.data));
    Navigate("/");
    console.log("hello")
  } catch (err) {
    dispatch(loginFailure());
  }
};
