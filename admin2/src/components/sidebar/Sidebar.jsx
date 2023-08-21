import "./sidebar.css";
import { AddToQueue, ArrowCircleLeft, LineStyle, List, PermIdentity, PlayCircleOutline, QueuePlayNext, Report } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../context/authContext/apiCalls";
import { AuthContext } from "../../context/authContext/AuthContext";
import { useContext, useState } from "react";

export default function Sidebar() {
  const history = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const [activeLink, setActiveLink] = useState('/');

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    await logout(dispatch);
    if(user ===null){
      history("/login");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Menu</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/')}
              >
                <LineStyle className="sidebarIcon" />
                Home
              </li>
            </Link>
            <Link to="/users" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/users' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/users')}
              >
                <PermIdentity className="sidebarIcon" />
                Users
              </li>
            </Link>
            <Link to="/movies" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/movies' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/movies')}
              >
                <PlayCircleOutline className="sidebarIcon" />
                Movies
              </li>
            </Link>
            <Link to="/lists" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/lists' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/lists')}
              >
                <List className="sidebarIcon" />
                Lists
              </li>
            </Link>
            <Link to="/newMovie" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/newMovie' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/newMovie')}
              >
                <AddToQueue className="sidebarIcon" />
                Add Movie
              </li>
            </Link>
            <Link to="/newList" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/newList' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/newList')}
              >
                <QueuePlayNext className="sidebarIcon" />
                Add List
              </li>
            </Link>
            <li className="sidebarListItem" onClick={()=>{window.location.href = "https://rendi-portfolio-neflixclone.netlify.app/"}}>
              <ArrowCircleLeft className="sidebarIcon" />
              Neflix App
            </li>
            <li className="sidebarListItem" onClick={handleLogin}>
              <Report className="sidebarIcon" />
              LogOut
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
