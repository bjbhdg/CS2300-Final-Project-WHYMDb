import React, {useEffect, useState} from 'react';
// import {Link} from 'react-router-dom';

function SearchResults() {
  useEffect( () => {
    fetchItems();
  }, []);

  const [items, setItems] = useState([]);

  // Grabs the matching movie titles of the search filters filled out in the "Home" page from "handler.js".
  const fetchItems = async () => {
    const data = await fetch('/search');
    const items = await data.json();
    setItems(items);
  };

  return(    
    <div className="container-fluid">
      <h1 className="mt-5">WHYMDb</h1>
      <h2 className="mt-3">Search Results</h2>
      { items.length
        ? items.map(item => (
          <div className="row padding">
            <div>
              {item.Searched_Movie_Title}
            </div>
          </div>       
        ))
        : "It looks like no results came up with your previous search, try again."
      }
    </div>
  );
}

export default SearchResults;
