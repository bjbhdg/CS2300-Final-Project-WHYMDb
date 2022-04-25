import React, {useEffect, useState} from 'react';
// import {Link} from 'react-router-dom';

function MovieSearch() {
    useEffect( () => {
        fetchItems();
    }, []);

    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        const data = await fetch('/movieSearch');
        const items = await data.json();
        setItems(items);
    };

    return(
            
        <div class="container-fluid">
            <h1 class="mt-5">Search</h1>
            <form method="GET" action="/movieSearch">
                <div class="input-group justify-content-center">
                    <div class="input-group-prepend">
                        <input type="text" name="movieTitleInput" class="form-control" />
                        <input type="date" name="movieReleaseDateInput" class="form-control" />
                        <input type="submit" value="Send" class="btn btn-primary mb-2" />
                    </div>
                </div>
            </form>
            {
            items.map(item => (
                <div class="row padding">
                    <div class="alert alert-info rounded-pill" role="alert">
                        {item.Title}, {item.Release_Date}
                    </div>
                </div>       
            ))
            }
        </div>
    );
}

export default MovieSearch;