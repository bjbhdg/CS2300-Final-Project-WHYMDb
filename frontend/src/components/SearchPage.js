import React, { useState } from 'react';

function SearchPage() {

  // These are used to give visual feedback on the value of each slider for the rating search.
  const [minRatingValue, setMinRatingValue] = useState([]);
  const [maxRatingValue, setMaxRatingValue] = useState([]);

  return(
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      <p>Begin Searching For Movies By Using the Fields Below:</p>
      <form method="POST" action="/searchSubmitted">
        <table className="mt-3"
          style={{ textAlign: "left", tableLayout: "fixed", marginLeft: "auto", marginRight: "auto", width: "auto" }}
        >
          <tbody>
            <tr>
              <td>
                <label style={{ justifyContent: "right" }}>Movie Title:</label>
              </td>
              <td>
                <input type="text" name="title" placeholder="Movie Title" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Starring Actor:</label>
              </td>
              <td>
                <input type="text" name="actorFirstName" placeholder="First Name" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
              <td>
                <input type="text" name="actorLastName" placeholder="Last Name" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Director:</label>
              </td>
              <td>
                <input type="text" name="directorFirstName" placeholder="First Name" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
              <td>
                <input type="text" name="directorLastName" placeholder="Last Name" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Studio:</label>
              </td>
              <td>
                <input type="text" name="studioName" placeholder="Studio Name" className="form-control"
                  style={{ width: "auto" }} 
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Theater Location:</label>
              </td>
              <td>
                <input type="text" name="theaterLocation" placeholder="Theater Address" className="form-control"
                  style={{ width: "auto" }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Genres:</label>
              </td>
              <td>
                <input type="text" name="genreList" placeholder="Genres (genre1, genre2, ...)"
                  className="form-control" style={{ width: "auto" }}
                />
              </td>
            </tr> 
            <tr>
              <td>
                <label>Release Date Range:</label>
              </td>
              <td>
                <label style={{ width: "auto" }}>Start Date:</label>
                <input type="date" name="releaseDateStart" className="form-control" />
              </td>
              <td>
                <label style={{ width: "auto" }}>End Date:</label>
                <input type="date" name="releaseDateEnd" className="form-control" />
              </td>
            </tr>
            <tr>
              <td>
                <label>Rating:</label>
              </td>
              <td>
                <label style={{ width: "auto" }}>Min Score: {minRatingValue}</label>
                <input id="minScore" name="minScore" type="range" min={0} max={10} step={0.1} defaultValue={0} className="form-control"
                  onChange={() => setMinRatingValue(document.getElementById("minScore").value)} style={{ width: "auto" }}
                />
              </td>
              <td>
                <label style={{ width: "auto" }}>Max Score: {maxRatingValue}</label>
                <input id="maxScore" name="maxScore" type="range" min={0} max={10} step={0.1} defaultValue={0} className="form-control"
                  onChange={() => setMaxRatingValue(document.getElementById("maxScore").value)} style={{ width: "auto" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <input type="submit" value="Search" className="btn btn-primary mb-2" style={{ marginTop: "5px" }} />
        </div>
      </form>
    </div>
  );
}

export default SearchPage;