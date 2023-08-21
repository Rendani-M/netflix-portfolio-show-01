import "./app.scss";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Watch from "./pages/watch/Watch";
import Login from "./pages/login/Login";

import { useContext } from "react";
import { AuthContext } from "./authContext/AuthContext";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import User from "./pages/user/User";

const App = () => {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      children: [
        {
          path: "/",
          element: <ProtectedRoute><Home /></ProtectedRoute>,
        },
        {
          path: "/movies",
          element: <ProtectedRoute><Home type="movie" /></ProtectedRoute>,
        },
        {
          path: "/series",
          element: <ProtectedRoute><Home type="series" /></ProtectedRoute>,
        },
        {
          path: "/watch/:movieId",
          element: <ProtectedRoute><Watch /></ProtectedRoute>,
        },
        {
          path: "/user/:userId",
          element: <User />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
