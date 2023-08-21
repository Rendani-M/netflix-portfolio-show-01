import React, { useContext, useState } from "react";
import "./topbar.css";
import { Language, Menu, NotificationsNone, Settings } from "@mui/icons-material";
import { AuthContext } from "../../context/authContext/AuthContext";
import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import Sidebar from "../sidebar/Sidebar";

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({
    left: false
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({[anchor]: open });
  };

  const list = (anchor) => (
    <Box
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
    >
      <Sidebar />
    </Box>
  );

  const warning=()=>{
    alert("There is no functionality programmed on the link or icon you just pressed. Please try a different feature!");
  }

  return (
    <Box className="topbar">
      <Box sx={{ display:{xs:'block', sm:'none'} }}>
        <Drawer 
          anchor='left'
          open={state['left']}
          onClose={toggleDrawer('left', false)}
          sx={{
              width: '240',
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: '240', boxSizing: 'border-box' },
          }}
          >
              
          <Box sx={{ overflow: 'auto' }}>
              {list('left')}
          </Box>
        </Drawer>
      </Box>
      <div className="topbarWrapper">
        <div className="topLeft">
          <Stack flexDirection={'row'} alignItems={'center'} width={'90%'} 
                  // border="1px solid black"
                >
            <Box sx={{ display:{xs:'block', sm:'none'} }}>
              <IconButton 
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  sx={{ mr:'4em', display:{xs:"Block", md: "none"} }}
                  onClick={toggleDrawer('left', true)}>
                <Menu sx={{fontSize:'1.5em', color:"black"}} />  
              </IconButton>
            </Box>
            <Typography className="logo" component={'h2'} variant='span' sx={{mt:'0', width:'10em'}}>NetFlix Admin</Typography>
          </Stack>
        </div>
        <div className="topRight">
          <Box sx={{ display:{xs:'none', sm:'block'} }}  onClick={warning} className="topbarIconContainer">
            <NotificationsNone />
            <span className="topIconBadge">2</span>
          </Box>
          <Box sx={{ display:{xs:'none', sm:'block'} }}  onClick={warning} className="topbarIconContainer">
            <Language />
            <span className="topIconBadge">2</span>
          </Box>
          <Box sx={{ display:{xs:'none', sm:'block'} }}  onClick={warning} className="topbarIconContainer">
            <Settings />
          </Box>
          <img  src={
                user?.profilePic ||
                "https://www.nicepng.com/png/detail/202-2024687_profile-icon-for-the-politics-category-profile-icon.png"
              } 
              alt={`${user?.name}'s profile`} 
              className="topAvatar" />
        </div>
      </div>
    </Box>
  );
}
