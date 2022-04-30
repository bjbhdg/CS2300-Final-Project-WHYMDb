import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

function SearchResults() {
  useEffect( () => {
    fetchMovies();
  }, []);

  const [movies, setMovies] = useState([]);

  // Grabs the matching movie titles of the search filters filled out in the "Home" page from "handler.js".
  const fetchMovies = async () => {
    const data = await fetch('/search');
    const searchedMovies = await data.json();
    setMovies(searchedMovies);
  };

  return(    
    <div className="container-fluid">

      <Link style={{ marginTop: "5px" }} className="btn btn-primary mb-2" to='/'>{"<- Back To Search"}</Link>

      <h1 className="mt-5">WHYMDb</h1>
      <h2 className="mt-3">Search Results</h2>
      { movies.length
        ? movies.map(movie => (
          <div key={movie.Search_ID} style={{ alignContent: "center" }}>
            <div>
              {movie.Searched_Movie_Title}
            </div>
          </div>       
        ))
        : "It looks like no results came up with your previous search, please try again."
      }
    </div>
  );
}

export default SearchResults;
