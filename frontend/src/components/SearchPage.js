import React from 'react';

function SearchPage() {
  return(
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      <p>Begin Searching For Movies By Using the Fields Below:</p>
      <form method="POST" action="/searchSubmitted">
        <table className="mt-3" style={{ textAlign: "left", tableLayout: "fixed", marginLeft: "auto", marginRight: "auto", width: "auto" }}>
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
                <input type="text" name="genreList" placeholder="Genres"
                  className="form-control" style={{ width: "auto" }}
                />
              </td>
            </tr> 
            <tr>
              <td>
                <label>Release Date:</label>
              </td>
              <td>
                <input type="date" name="releaseDate" className="form-control" />
              </td>
            </tr>
            <tr>
              <td>
                <label>Rating:</label>
              </td>
              <td>
                <label style={{ width: "auto" }}>Min Score:</label>
                <input type="number" defaultValue={0} name="minScore" className="form-control" style={{ width: "auto" }} />
              </td>
              <td>
                <label style={{ width: "auto" }}>Max Score:</label>
                <input type="number" defaultValue={0} name="maxScore" className="form-control" style={{ width: "auto" }} />
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          
        </div>
        <div>
          <input type="submit" value="Search" className="btn btn-primary mb-2" style={{ marginTop: "5px" }} />
        </div>
      </form>
    </div>
  );
}

export default SearchPage;