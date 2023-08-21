import { Link, useParams } from "react-router-dom";
import "./movie.css";
import { Publish } from "@mui/icons-material";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { useContext, useEffect, useState } from "react";
import { updateMovie } from "../../context/movieContext/apiCalls";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import app from "../../firebase";
import { makeRequest } from "../../axios";
import { useCallback } from "react";


export default function Movie() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const { dispatch } = useContext(MovieContext);
  const [inputs, setInputs] = useState({
    title: "",
    year: "",
    genre: "",
    limit: "",
    trailer: null,
    video: null,
    img: null,
  });
  // const [fetchedData, setFetchedData] = useState(false);
  const [firebaseStorageCapacity, setFirebaseStorageCapacity] = useState(null);
  const [firebaseUploadCapacity, setFirebaseUploadCapacity] = useState(null);
  const [mongoDBCapacity, setMongoDBCapacity] = useState(null);

  //getting the movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Fetch the movie information using the movie ID
        const res = await makeRequest.get(`/movies/find/${movieId}`); // Call the getMovie function with the movie ID and dispatch
        setMovie(res.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchMovie();
  }, [movieId, dispatch]);

  //getting the data Operations 
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        // Fetch the movie information using the movie ID
        const res = await makeRequest.get("/dataOperations/find"); // Call the getMovie function with the movie ID and dispatch
        console.log("Data Operations",res.data);
        setUploadCount(uploadCount + res.data.upload);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [movieId, dispatch, uploadCount]);
  // console.log("Data Operations",uploadCount);
  
  //initialise the inputs
  useEffect(() => {
    setInputs({
      title: movie?.title || "",
      year: movie?.year || "",
      genre: movie?.genre || "",
      limit: movie?.limit || "",
      imgSm: null,
      trailer: null,
      video: null,
      img: null,
    });
  }, [movie]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
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

  const incrementUploadCount = async() => {
    setUploadCount(uploadCount + 1);
  };

  const dataOperations= useCallback(async()=>{
    await makeRequest.post("/dataOperations", uploadCount, {
      headers: {
        token: "Bearer " + JSON.parse(localStorage.getItem("user")).accessToken,
      },
    })
    .catch (function (error) { // add a catch method to handle the error response
        alert(error.response.data.message); // display the custom message in an alert box
        console.log("error",error)
    });
  }, [uploadCount]);

  //send the updated info to the api
  const handleUpdate = useCallback(async (e) => {
    try {
      
      let updatedInputs = {
        ...inputs,
        imgSm: inputs.img,
      };
  
      if (inputs.img === '' || inputs.img === null) {
        updatedInputs = {
          ...inputs,
          img: movie.img,
          imgSm: movie.img,
        };
      }
  
      if (inputs.trailer === '' || inputs.trailer === null) {
        updatedInputs = {
          ...updatedInputs,
          trailer: movie.trailer,
        };
      }
  
      if (inputs.video === '' || inputs.video === null) {
        updatedInputs = {
          ...updatedInputs,
          video: movie.video,
        };
      }

      console.log("updatedInputs: ", updatedInputs);
      await dataOperations();
      const updatedMovie = await updateMovie(movie._id, updatedInputs, dispatch);
      setMovie(updatedMovie);
      setUpdate(false);
      setLoading(false);
      setInputs((prevInputs) => ({
        ...prevInputs,
        imgSm: null,
        trailer: null,
        video: null,
        img: null,
      }));
      alert("Movie updated successfully!");
    } catch (error) {
      console.log(error);
      alert("Failed to update movie.");
    }
  },[inputs, dataOperations,dispatch,movie._id,movie.img,movie.trailer,movie.video]);

  // console.log("movie: ", movie)
  const handleChange = (e) => {
      setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  //uploads the image, tailer and video to the storage
  const handleFileUpload = (file, field) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done for ${field}`);
          // setImgPerc(Math.round(progress));
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
              console.log(`${field} available at:`, downloadURL);
              incrementUploadCount();
              setInputs((prevInputs) => ({ ...prevInputs, [field]: downloadURL }));
              // console.log("inputs",inputs)
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
  
  useEffect(() => {
    console.log("inputs:", inputs);
    if(update){
      handleUpdate();
    }
  }, [inputs, update, handleUpdate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const field = e.target.name;
    setInputs((prev) => ({ ...prev, [field]: file }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    //if the storage or upload capacity is above 97%, or if the DB is 99% full stop any uploading
    if(firebaseStorageCapacity < 97 || firebaseUploadCapacity < 97 || mongoDBCapacity < 99){
      try {
        if (inputs.trailer && inputs.trailer instanceof File) {
          await handleFileUpload(inputs.trailer, 'trailer');
        }
    
        if (inputs.video && inputs.video instanceof File) {
          await handleFileUpload(inputs.video, 'video');
        }
    
        if (inputs.img && inputs.img instanceof File) {
          await handleFileUpload(inputs.img, 'img');
        }
        setUpdate(true);
        
      } catch (error) {
        console.log(error);
      }
    }
    else{
      alert('Storage or Database Capacity Reached! Please delete movies to upload');
      window.location.reload();
    }
  };
  

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Movie</h1>
        <Link to="/newMovie">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={movie?.img} alt="" className="productInfoImg" />
            <span className="productName">{movie?.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{movie?._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">genre:</span>
              <span className="productInfoValue">{movie?.genre}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">year:</span>
              <span className="productInfoValue">{movie?.year}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">limit:</span>
              <span className="productInfoValue">{movie?.limit}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm">
          <div className="productFormLeft">
            <label>Movie Title</label>
            <input
              type="text"
              placeholder={movie?.title}
              name="title"
              value={inputs.title}
              onChange={handleChange}
            />
            <label>Year</label>
            <input
              type="text"
              placeholder={movie?.year}
              name="year"
              value={inputs.year}
              onChange={handleChange}
            />
            <label>Genre</label>
            <input
              type="text"
              placeholder={movie?.genre}
              name="genre"
              value={inputs.genre}
              onChange={handleChange}
            />
            <label>Limit</label>
            <input
              type="text"
              placeholder={movie?.limit}
              name="limit"
              value={inputs.limit}
              onChange={handleChange}
            />
            <label>Trailer</label>
            <input
              type="file"
              name="trailer"
              onChange={handleFileChange}
            />
            <label>Video</label>
            <input
              type="file"
              name="video"
              onChange={handleFileChange}
              placeholder={movie?.video}
            />
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img
                src={movie?.img}
                alt=""
                className="productUploadImg"
              />
              <label htmlFor="file">
                <Publish />
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                name="img"
                onChange={handleFileChange}
              />
            </div>
            <button className="productButton" onClick={handleUpload}>
              {loading? <CircularProgress size={24} /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
