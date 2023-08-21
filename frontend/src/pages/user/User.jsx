import { useNavigate,  useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { ArrowBackOutlined, CalendarToday, LocationSearching, MailOutline, PermIdentity, PhoneAndroid, Publish } from "@mui/icons-material";
import "./user.scss";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { makeRequest } from "../../axios";
import app from "../../firebase";
import { AuthContext } from "../../authContext/AuthContext";
import { CircularProgress } from "@mui/material";

export default function User() {
  const { userId } = useParams();
  const { update } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [updateUser, setupdateUser] = useState(false);
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    profilePic: "",
  });
  const history= useNavigate();
  const [firebaseStorageCapacity, setFirebaseStorageCapacity] = useState(null);
  const [firebaseUploadCapacity, setFirebaseUploadCapacity] = useState(null);
  const [mongoDBCapacity, setMongoDBCapacity] = useState(null);
  
  //getting the user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch the movie information using the movie ID
        const res = await makeRequest.get(`/users/find/${userId}`); // Call the getMovie function with the movie ID and dispatch
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchUser();
  }, [userId]);

  useEffect(() => {
    setInputs({
      username: user?.username || "",
      email: user?.email || "",
      profilePic: user?.profilePic || "",
    });
  }, [user]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        
        // if(fetchedData===false){
          const resStorageSize = await makeRequest.get("/dataOperations/find"); 
          const resDBSize = await makeRequest.get("/dataOperations/mongoDBStorageSize"); 
          //setting data operation variables
          setFirebaseStorageCapacity((resStorageSize.data.fileSize/5)*100); //Measured in GB
          setFirebaseUploadCapacity((resStorageSize.data.upload/20000)*100);
          
          //setting DBstorage
          //max storage size is 512Mb*1024= 524288KB
          setMongoDBCapacity((resDBSize.data.storageSize/524288)*100);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [mongoDBCapacity, firebaseStorageCapacity, firebaseUploadCapacity]);

  const handleChange = (e) => {
      setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const field = e.target.name;
    setInputs((prev) => ({ ...prev, [field]: file }));
  };

  const handleupdateUser = useCallback(async (inputData) => {
    try {
      if (inputData.profilePic === "") {
        setInputs((prevInputs) => ({
          ...prevInputs,
          profilePic: user?.profilePic,
        }));
      } 

      const updatedUser = await update(inputData, userId);
      
      if (updatedUser && updatedUser.data) {
        setUser(updatedUser.data);
        setupdateUser(false);
        setInputs((prevInputs) => ({
          ...prevInputs,
          profilePic: null,
        }));
        alert("User updated successfully!");

      } else {
        let errorMessage = "Failed to update user.";
        if (updatedUser && updatedUser.data) {
          errorMessage = updatedUser.data;
        }
        alert(errorMessage);
      }
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.status);
        console.log(error.response.data);
        alert(`Failed to update user. Error: ${error.response.data}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        alert("Failed to update user. No response received from the server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        alert("Failed to update user. An error occurred.");
      }
    }
  }, [update, user?.profilePic, userId]);
  

  const handleFileUpload = (file, field) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, `/items/${userId}/profilePic/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done for ${field}`);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setInputs((prevInputs) => ({ ...prevInputs, [field]: downloadURL }));
              resolve();
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        }
      );
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if(firebaseStorageCapacity < 97 || firebaseUploadCapacity < 97 || mongoDBCapacity < 99){
      setLoading(true);
      try {
        if (inputs.profilePic && inputs.profilePic instanceof File) {
          await handleFileUpload(inputs.profilePic, 'profilePic');
        }
        setupdateUser(true);

      } catch (error) {
        console.log(error);
      }
    }
    else{
      alert('Storage or Database Capacity Reached! Please delete movies to upload');
      window.location.reload();
    }  
  };
  
  useEffect(() => {
    const updateUserMethod = async () => {
      if (updateUser) {
        await handleupdateUser(inputs);
      }
    };

    updateUserMethod();
  }, [inputs, updateUser, handleupdateUser]);
  

  return (
    <div className="user" style={{ overflow: "visible" }}>
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <div className="back" onClick={()=>{history('/')}}>
          <ArrowBackOutlined />
          Home
        </div>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img
              src={user?.profilePic? user.profilePic: 'https://toppng.com/uploads/preview/app-icon-set-login-icon-comments-avatar-icon-11553436380yill0nchdm.png'}
              alt=""
              className="userShowImg"
            />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{inputs?.username}</span>
              <span className="userShowUserTitle" style={{ color:"red" }}>Active</span>
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">{inputs?.username}</span>
            </div>
            <div className="userShowInfo">
              <CalendarToday className="userShowIcon" />
              <span className="userShowInfoTitle">08/11/1998</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <PhoneAndroid className="userShowIcon" />
              <span className="userShowInfoTitle">+27 793 456 6754</span>
            </div>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{inputs?.email}</span>
            </div>
            <div className="userShowInfo">
              <LocationSearching className="userShowIcon" />
              <span className="userShowInfoTitle">johannesburg | South Africa</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm">
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={inputs?.username}
                  className="userUpdateInput"
                  onChange={handleChange}
                />
              </div>
              <div className="userUpdateItem">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder={inputs?.username}
                  className="userUpdateInput"
                />
              </div>
              <div className="userUpdateItem">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder={inputs?.email}
                  className="userUpdateInput"
                  onChange={handleChange}
                />
              </div>
              <div className="userUpdateItem">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="+1 123 456 67"
                  className="userUpdateInput"
                />
              </div>
              <div className="userUpdateItem">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="New York | USA"
                  className="userUpdateInput"
                />
              </div>
            </div>
            <div className="userUpdateRight">
              <div className="userUpdateUpload">
                <img
                  className="userUpdateImg"
                  src={user?.profilePic? user.profilePic : 'https://toppng.com/uploads/preview/app-icon-set-login-icon-comments-avatar-icon-11553436380yill0nchdm.png'}
                  alt=""
                />
                <label htmlFor="file">
                  <Publish className="userUpdateIcon" />
                </label>
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  name="profilePic"
                  onChange={handleFileChange}
                />
              </div>
              <button className="userUpdateButton" onClick={handleUpload}>
                {loading? <CircularProgress size={24} /> : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
