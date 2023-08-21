import { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.scss";
import { makeRequest } from "../../axios";
import { Button, CircularProgress } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useNavigate();
  const [formComplete, setFormComplete] = useState(false);
  const [mongoDBCapacity, setMongoDBCapacity] = useState(null);
  const emailRef = useRef();
  
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        
          const resDBSize = await makeRequest.get("/dataOperations/mongoDBStorageSize"); 
          //setting DBstorage
          //max storage size is 512Mb*1024= 524288KB
          setMongoDBCapacity((resDBSize.data.storageSize/524288)*100);
          
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [mongoDBCapacity]);

  useEffect(() => {
    const checkFormCompletion = () => {
      if (username && email && password) {
        setFormComplete(true);
      } else {
        setFormComplete(false);
      }
    };
    checkFormCompletion();
  }, [username, email, password]);

  const handleStart = () => {
    if(mongoDBCapacity < 99){ 
      setEmail(emailRef.current.value);
    }else{
      alert('Database Capacity Reached! Use email: admin@gmail.com; password: admin123 to login if you still cannot register');
      window.location.href = "/";
    }
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    
    if (formComplete) {
      setLoading(true);
      try {
        const input = {
          'email': email,
          'username': username,
          'password': password,
          'isAdmin': isAdmin
        };
        
        await makeRequest.post("auth/register", input);
        alert("Registration successful!");
        window.location.href = "/login";
        
      } catch (err) {
        alert(err.response.data);
        setLoading(false);}
    }
    else{
      const missingFields = [];
      if (!username) {
        missingFields.push("Username");
      }
      if (!email) {
        missingFields.push("Email Address");
      }
      if (!password) {
        missingFields.push("Password");
      }
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
    }
  };

  return (
    <div className="register">
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
        
        <h1>Unlimited movies, TV shows, and more.</h1>
        <h2>Watch anywhere. Cancel anytime.</h2>
        <p>Ready to watch? Enter your email to create or restart your membership.</p>
        {!email ? (
          <div className="input">
            <input type="email" placeholder="email address" ref={emailRef} />
            <Button variant="contained" sx={{ cursor:'pointer', background:'red', width:{xs:'100%', sm:'45%', md:'35%'}, marginBottom:'7em' }} onClick={handleStart}>
              Get Started
            </Button>
          </div>
        ) : (
          <form className="input">
            <input type="username" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
            <div style={{ display: "flex", alignItems: "center", marginTop: "1em", marginBottom: "0.5em" }}>
              <input type="checkbox" name="admin" onChange={(e) => setIsAdmin(e.target.checked)} id="adminCheckbox" style={{ height: "100%" }} />
              <label htmlFor="adminCheckbox" style={{ display: "inline-block", marginLeft: "10px" }}>
                Admin
              </label>
            </div>
            <Button variant="contained" endIcon={<Send />} sx={{ cursor:'pointer', background:'red', width:{xs:'100%', sm:'45%', md:'35%'}, marginBottom:'7em' }} onClick={handleFinish}>
              {loading ? 
                (<CircularProgress />) : "Register"
              }
            </Button>
          </form>
        )}
        <Button className="loginButton" variant="contained" sx={{ position:'fixed' ,cursor:'pointer', background:'red', bottom:'1em' }} onClick={()=> {history("/login")}}>
          Sign In
        </Button>
      </div>
    </div>
  );
}
