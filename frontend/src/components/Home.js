import React from 'react';

function Home() {
  return(
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      <p>Begin Searching For Movies By Using the Fields Below:</p>
      <form method="POST" action="/searchSubmitted">
        <table className="mt-3" style={{ marginLeft: "auto", marginRight: "auto", width: "50%" }}>
          <tbody>
            <tr>
              <td>
                <label>Movie Title:</label>
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
                <label>Release Date:</label>
              </td>
              <td>
                <input type="date" defaultValue={""} name="releaseDate" className="form-control" style={{ width: "auto" }}/>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <input type="submit" value="Search" className="btn btn-primary mb-2" />
        </div>
      </form>
    </div>
  );
}

export default Home;