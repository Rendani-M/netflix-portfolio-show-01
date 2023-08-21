import { loginFailure, loginStart, loginSuccess, logoutAction } from "./AuthActions";
import { makeRequest } from "../../axios";

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await makeRequest.post("auth/login", user);
    res.data.isAdmin && dispatch(loginSuccess(res.data));
  } catch (err) {
    dispatch(loginFailure());
  }
};

export const logout = async (dispatch) => {
  try {
    // const res = await makeRequest.post("auth/logout");
    dispatch(logoutAction());
  } catch (err) {
    dispatch(loginFailure());
  }
};