import { Link,  useParams } from "react-router-dom";
import "./watch.scss";
import { ArrowBackOutlined } from "@mui/icons-material";
import { makeRequest } from "../../axios";
import { useEffect, useState } from "react";

export default function Watch() {
  const { movieId } = useParams();
  // const movie = location.state.movie;
  const [movie, setMovie] = useState({});

  useEffect(() => {
    const getMovie = async () => {
      try {
        const res = await makeRequest.get(`/movies/find/${movieId}`);
        // const res = await makeRequest.get("movies/find/" + item, {
        //   headers: {
        //     token:
        //     "Bearer "+JSON.parse(localStorage.getItem("user")).accessToken,
        //   },
        // });
        setMovie(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMovie();
  }, [movieId]);
  // console.log("movie", movie);
  return (
    <div className="watch">
      <Link to="/">
        <div className="back">
          <ArrowBackOutlined />
          Home
        </div>
      </Link>
      <video className="video" autoPlay progress controls src={movie?.video} style={{ width:{xs:'50%', sm:'100%'} }}/>
    </div>
  );
}
