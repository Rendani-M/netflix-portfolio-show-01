import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import Home from "./pages/home/Home";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import UserList from "./pages/userList/UserList";
import Login from "./pages/login/Login";
import { AuthContext } from "./context/authContext/AuthContext";
import { useContext } from "react";
import ListList from "./pages/listList/ListList";
import List from "./pages/list/List";
import NewList from "./pages/newList/NewList";
import MovieList from "./pages/movieList/MovieList";
import NewMovie from "./pages/newMovie/NewMovie";
import { Box, Stack } from "@mui/material";
import Movie from "./pages/movie/Movie";

function App() {
  const { user } = useContext(AuthContext);
  const Layout = () => { 
    return (
      <>
        <Topbar />
        <Stack direction="row" spacing={2}>
          <Box sx={{ display:{xs:'none', sm:'block'} }}>
            <Sidebar />
          </Box>
          
          <Outlet />
        </Stack>
        
      </>
        
    );
  };

  const ProtectedRoute = ({ children }) => {
    console.log("user: ", user)
    if (!user) {
      console.log("back to login")
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/users",
          element: <UserList />,
        },
        {
          path: "/movies",
          element: <MovieList />,
        },
        {
          path: "/movie/:movieId",
          element: <Movie />,
        },
        {
          path: "/newMovie",
          element: <NewMovie />,
        },
        {
          path: "/lists",
          element: <ListList />,
        },
        {
          path: "/list/:listId",
          element: <List />,
        },
        {
          path: "/newlist",
          element: <NewList />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);
  
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
