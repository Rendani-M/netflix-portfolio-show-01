import { useContext, useEffect, useState } from "react";
import "./newList.css";
import {  getMovies } from "../../context/movieContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { ListContext } from "../../context/listContext/ListContext";
import { createList } from "../../context/listContext/apiCalls";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";

export default function NewList() {
  const [list, setList] = useState(null);
  const history = useNavigate()

  const { dispatch } = useContext(ListContext);
  const { movies, dispatch: dispatchMovie } = useContext(MovieContext);
  const [mongoDBCapacity, setMongoDBCapacity] = useState(null);

  useEffect(() => {
    getMovies(dispatchMovie);
  }, [dispatchMovie]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        
          const resDBSize = await makeRequest.get("/dataOperations/mongoDBStorageSize"); 
          console.log("DB fetch",resDBSize.data);
          //setting DBstorage
          //max storage size is 512Mb*1024= 524288KB
          setMongoDBCapacity((resDBSize.data.storageSize/524288)*100);
          
          // setFetchedData(true);
        // }
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchOperations();
  }, [mongoDBCapacity]);

  const handleChange = (e) => {
    const value = e.target.value;
    setList({ ...list, [e.target.name]: value });
  };

  const handleSelect = (e) => {
    let value = Array.from(e.target.selectedOptions, (option) => option.value);
    setList({ ...list, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(mongoDBCapacity < 99){
      createList(list, dispatch);
      history("/lists")
    }
    else{
      alert('Database Capacity Reached! Please delete movies or lists to upload');
      window.location.reload();
    }
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New List</h1>
      <form className="addProductForm">
        <div className="formLeft">
          <div className="addProductItem">
            <label>Title</label>
            <input
              type="text"
              placeholder="Popular Movies"
              name="title"
              onChange={handleChange}
            />
          </div>
          <div className="addProductItem">
            <label>Genre</label>
            <input
              type="text"
              placeholder="action"
              name="genre"
              onChange={handleChange}
            />
          </div>
          <div className="addProductItem">
            <label>Type</label>
            <select name="type" onChange={handleChange}>
              <option>Type</option>
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
          </div>
        </div>
        <div className="formRight">
          <div className="addProductItem">
            <label>Content</label>
            <select
              multiple
              name="content"
              onChange={handleSelect}
              style={{ height: "280px" }}
            >
              {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="addProductButton" onClick={handleSubmit}>
          Create
        </button>
      </form>
    </div>
  );
}
