import { useContext, useEffect, useState } from "react";
import "./newMovie.css";

import { createMovie } from "../../context/movieContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";
import app from "../../firebase";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { CircularProgress, LinearProgress } from "@mui/material";
import { AuthContext } from "../../context/authContext/AuthContext";
import { makeRequest } from "../../axios";

export default function NewMovie() {
  const [movie, setMovie] = useState(null);
  const [img, setImg] = useState(null);
  const [imgTitle, setImgTitle] = useState(null);
  const [imgSm, setImgSm] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [video, setVideo] = useState(null);
  const [uploaded, setUploaded] = useState(0);
  const [allInputsPresent, setAllInputsPresent] = useState(false);
  const [uploading, setUploading] = useState(false);
  // const [totalUploaded, setTotalUploaded] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [fetchedData, setFetchedData] = useState(false);
  const { user } = useContext(AuthContext);
  const [firebaseStorageCapacity, setFirebaseStorageCapacity] = useState(null);
  const [firebaseUploadCapacity, setFirebaseUploadCapacity] = useState(null);
  const [mongoDBCapacity, setMongoDBCapacity] = useState(null);

  const { dispatch } = useContext(MovieContext);
  // Add an effect to update the allFilesPresent state whenever one of the file inputs changes
  useEffect(() => {
    setAllInputsPresent(
      !!img &&
      !!imgTitle &&
      !!imgSm &&
      !!trailer &&
      !!video &&
      !!movie?.title
    );
  }, [img, imgTitle, imgSm, trailer, video, movie]);

  useEffect(() => {
    // const items = [img, imgTitle, imgSm, trailer, video];
    // const countUploaded = items.filter((item) => item !== null).length;
    // setTotalUploaded(countUploaded);
  }, [img, imgTitle, imgSm, trailer, video]); 

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

  //getting the data Operations 
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        // Fetch the movie information using the movie ID
        if(fetchedData===false){
          const res = await makeRequest.get("/dataOperations/find"); // Call the getMovie function with the movie ID and dispatch
          res.data.upload? setUploadCount(uploadCount + res.data.upload): setUploadCount(0);
          if (typeof res.data.upload === 'number') {
              setUploadCount(uploadCount + res.data.upload);
          } else {
              setUploadCount(0);
          }
          
          setFetchedData(true);
          
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [fetchedData, uploadCount]);
  // 
  
  const dataOperations= async()=>{

    await makeRequest.post("/dataOperations", {"upload":uploadCount}, {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    })
    .catch (function (error) { // add a catch method to handle the error response
        alert(error.response.data.message); // display the custom message in an alert box
        console.log("error",error)
    });
  }
  
  const reset = () => {
    setUploading(false);
    setMovie(null);
    setImg(null);
    setImgTitle(null);
    setImgSm(null);
    setTrailer(null);
    setVideo(null);
    setUploaded(0);
    setAllInputsPresent(false);

    // Reset the form inputs
    const form = document.querySelector('.addProductForm');
    form && form.reset();
  };

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const upload = (items) => {
    setUploading(true);
    items?.forEach((item) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + item.label + item.file.name;
      const storageRef = ref(storage, `/items/${user._id}/${item.label}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, item.file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // setUploadCount(uploadCount + 1);
            // console.log("first DATA ",uploadCount)
            setUploadCount((prevCount) => prevCount + 1);
            setMovie((prev) => {
              return { ...prev, [item.label]: downloadURL };
            });
            setUploaded((prev) => prev + 1);
          });
        }
      );
    });
  };
  
  const handleUpload = (e) => {
    e.preventDefault();

    //if the storage or upload capacity is above 97%, or if the DB is 99% full stop any uploading
    if(firebaseStorageCapacity < 97 || firebaseUploadCapacity < 97 || mongoDBCapacity < 99){
      upload([
        { file: img, label: "img" },
        { file: imgTitle, label: "imgTitle" },
        { file: imgSm, label: "imgSm" },
        { file: trailer, label: "trailer" },
        { file: video, label: "video" },
      ]);
    }else{
      alert('Storage or Database Capacity Reached! Please delete movies to upload');
      window.location.reload();
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    await dataOperations();
    createMovie(movie, dispatch).then(() => { // add a then method here
      reset(); // move the reset function here
     })
     .catch((error) => {
       // Handle any error that occurs during movie creation
       console.log(error);
     });
  };
  
  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Movie</h1>
      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input
            type="file"
            id="img"
            name="img"
            onChange={(e) => e.target && setImg(e.target.files[0])}
            style={{ border: !img ? "1px solid red" : "" }}
          />
        </div>
        <div className="addProductItem">
          <label>Title image</label>
          <input
            type="file"
            id="imgTitle"
            name="imgTitle"
            onChange={(e) => e.target && setImgTitle(e.target.files[0])}
            style={{ border: !imgTitle ? "1px solid red" : "" }}
          />
        </div>
        <div className="addProductItem">
          <label>Thumbnail image</label>
          <input
            type="file"
            id="imgSm"
            name="imgSm"
            onChange={(e) => e.target && setImgSm(e.target.files[0])}
            style={{ border: !imgSm ? "1px solid red" : "" }}
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input
            type="text"
            placeholder="Title"
            name="title"
            onChange={handleChange}
            className={!movie?.title ? "highlight" : ""}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            type="text"
            placeholder="description"
            name="desc"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Year</label>
          <input
            type="text"
            placeholder="Year"
            name="year"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Genre</label>
          <input
            type="text"
            placeholder="Genre"
            name="genre"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Duration</label>
          <input
            type="text"
            placeholder="Duration"
            name="duration"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Limit</label>
          <input
            type="text"
            placeholder="limit"
            name="limit"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Is Series?</label>
          <select name="isSeries" id="isSeries" onChange={handleChange}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div className="addProductItem">
          <label>Trailer</label>
          <input
            type="file"
            name="trailer"
            onChange={(e) => e.target && setTrailer(e.target.files[0])}
            style={{ border: !trailer ? "1px solid red" : "" }}
          />
        </div>
        <div className="addProductItem">
          <label>Video</label>
          <input
            type="file"
            name="video"
            onChange={(e) => e.target && setVideo(e.target.files[0])}
            style={{ border: !video ? "1px solid red" : "" }}
          />
        </div>
        <div className="process">
          {uploaded === 5 ? (
            <button className="addProductButton" onClick={handleSubmit}>
              Create
            </button>
          ) : (
            <button
              className="addProductButton"
              onClick={handleUpload}
              disabled={!allInputsPresent} >
              {uploading ? <CircularProgress size={24} /> : "Upload"}
            </button>)
          }
          <div className="progress">
            {uploading && (
              <>
                <LinearProgress variant="determinate" value={progress} />
                <span>{progress}% Completed</span>
              </>
            )}
          </div>
        </div>
        
      </form>
    </div>
  );
}
