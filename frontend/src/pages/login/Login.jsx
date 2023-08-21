import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../authContext/AuthContext";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const { login } = useContext(AuthContext);
  const [formComplete, setFormComplete] = useState(false);
  
  useEffect(() => {
    const checkFormCompletion = () => {
      if ( email && password) {
        setFormComplete(true);
      } else {
        setFormComplete(false);
      }
    };
    checkFormCompletion();
  }, [ email, password]);

  const handleLogin = async(e) => {
    e.preventDefault();

    if (formComplete) {
      setLoading(true)
      try { 
        await login({ email, password });
        alert("Login successful!");
        window.location.href = "/";
      } catch (err) {
        alert(err.response.data);
        setLoading(false);
      }
    } else {
      const missingFields = [];
      if (!email) {
        missingFields.push("Email");
      }
      if (!password) {
        missingFields.push("Password");
      }
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
    }
  };

  const goToRegister=()=>{
    navigate("/register");
  }

  return (
    <div className="login">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt=""
          />
        </div>
      </div>
      <div className="container">
        <form className="formContainer">
          <Typography variant="span" component="h1" sx={{ fontSize:{xs:'1.3em', sm:'2.5em'} }}>Sign In</Typography>
          <input
            type="email"
            placeholder="Email or phone number"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" className="loginButton" onClick={handleLogin} sx={{ fontSize:{xs:'15px', sm:'18px'} }}>
            {loading ? 
              (<CircularProgress />) : "Sign In"
            }
          </Button>
          <span>
            New to Netflix? <b onClick={goToRegister} style={{ cursor:'pointer', color:'red' }}>Sign up here</b>
          </span>
          <Typography variant="p" component="small" sx={{ fontSize:{xs:'0.8em', sm:'0.8em'} }}>
            This page is the login created by yours truly Rendani Makhavhu. Enjoy every moment! <b>Please note that the cover images of the video do not represent the content videos </b>.
          </Typography>
        </form>
      </div>
    </div>
  );
}
