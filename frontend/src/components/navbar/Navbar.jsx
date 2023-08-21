import { useContext, useEffect, useState } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../authContext/AuthContext";
import { ArrowDropDown, Notifications, Search } from "@mui/icons-material";
import { Box } from "@mui/material";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  useEffect(() => {
    setIsAdmin(currentUser?.isAdmin);
  }, [currentUser]);

  const warning=()=>{
    alert("There is no functionality programmed on the link or icon you just pressed. Please try a different feature!");
  }

  return (
    <div className={isScrolled ? "navbar scrolled" : "navbar"}>
      <div className="container">
        <div className="left">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix Logo"
          />
          <Link to="/" className="link">
            <span>Homepage</span>
          </Link>
          <Link to="/series" className="link">
            <span className="navbarmainLinks">Series</span>
          </Link>
          <Link to="/movies" className="link">
            <span className="navbarmainLinks">Movies</span>
          </Link>
        </div>
        <div className="right">
          <Box sx={{ display:{xs:'none', sm:'flex'}, alignItems:'center', justifyContent:'space-around' }}>
            <Search className="icon" onClick={warning}/>
            <span>KID</span>
            <Notifications className="icon" onClick={warning}/>
          </Box>
          
          <Link to={`/user/${currentUser._id}`} className="link">
            <img
              src={
                currentUser?.profilePic ||
                "https://pbs.twimg.com/media/D8tCa48VsAA4lxn.jpg"
              }
              alt="User Profile"
            />
          </Link>
          <div className="profile">
            <ArrowDropDown className="icon" />
            <div className="options" >
              {isAdmin && <span   style={{ color:'white' }}><a style={{ textDecoration: 'none', color:'white'}} href="https://rendi-portfolio-neflixclone-admin.netlify.app">Admin</a></span>}
              <span onClick={()=> navigate(`/user/${currentUser._id}`)}>Profile</span>
              <span onClick={async() => await logout()} >Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
