import React, { useContext, useEffect, useState } from "react";
import { login } from "../../context/authContext/apiCalls";
import { AuthContext } from "../../context/authContext/AuthContext";
import "./login.css";
import { useNavigate  } from 'react-router-dom';
import {CircularProgress, Typography} from '@mui/material';
import { Box, Button } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, isFetching, dispatch } = useContext(AuthContext);
  const history = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user !== null) {
      
      history('/');
    }
  }, [user, history]);

  const handleLogin = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ "email": email, "password": password }, dispatch);
    } catch (error) {
      alert(error);
      window.location.reload();
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="login"> 
      <Box className="loginContainer" sx={{ mr:{xs:'0', sm:'7em'} }}>
        <Typography variant="h3" component="h2" sx={{mb:'0.4em', fontSize:{xs: '1.7em', sm:'3.5em'} }}>NetFlix-Admin</Typography>
        <form className="loginForm">
          <input
            type="text"
            placeholder="email"
            className="loginInput"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            className="loginInput"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="loginButton"
            onClick={handleLogin}
            disabled={isFetching}
            sx={{ background:'rgb(0, 102, 161)', color:'white' }}
          >
            {loading ? 
              (<CircularProgress size={24}/>) : "Login"
            }
          </Button>
        </form>
      </Box>
      
    </div>
  );
}
