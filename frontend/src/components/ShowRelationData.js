import React from 'react';

class ShowRelationData extends React.Component {
  constructor(props) {
    // The props sent to ShowRelationData include the name of the relation chosen from '/editDatabase.'
    super(props);

    this.state = {
      relationRows: null
    }

    this.fetchRelationRows();
  }

  // In accordance to the props, the tuples present in the passed in relation's table is sent
  // retrieved and assigned to the state variable relationRows.
  async fetchRelationRows() {
    if(this.props.currRelation !== "Default") {
       const data = await fetch(`/get${this.props.currRelation}Rows`);
       const relationData = await data.json();
       this.setState({ relationRows: relationData });
    } else {
      this.setState({ relationRows: null});
    }
  }

  render() {
    return (
      <div style={{ marginLeft: "auto", marginRight: "auto", overflow: "auto", maxWidth: "500px", maxHeight: "200px" }}>
        <table style={{ marginLeft: "auto", marginRight: "auto", border: "1px solid black", width: "auto", height: "auto" }}
        >
          { // This deeply nested ternary operator renders the data from the passsed in relation. Each relation needs to be
            // handled differently, so each entry in the ternary operator will render the corresponding relation correctly.
            this.state.relationRows !== null
            ? this.props.currRelation === "Theater"
              ? <tbody>
                  <tr style={{ border: "1px solid black" }}>
                    <td style={{ border: "1px solid black" }}><label>Location:</label></td>
                    <td style={{ border: "1px solid black" }}><label>Owner:</label></td>
                    <td style={{ border: "1px solid black" }}><label>Day:</label></td>
                    <td style={{ border: "1px solid black" }}><label>Open Time:</label></td>
                    <td style={{ border: "1px solid black" }}><label>Close Time:</label></td>
                  </tr>
                  {this.state.relationRows.map((row) =>
                  <tr key={`${row.Location}, ${row.Day_Of_Operation}`} style={{ border: "1px solid black" }}>
                    <td style={{ border: "1px solid black" }}>{row.Location}</td>
                    <td style={{ border: "1px solid black" }}>{row.Theater_Owner}</td>
                    <td style={{ border: "1px solid black" }}>{row.Day_Of_Operation}</td>
                    <td style={{ border: "1px solid black" }}>{row.Opening_Time}</td>
                    <td style={{ border: "1px solid black" }}>{row.Closing_Time}</td>
                  </tr>
                  )}
                </tbody>
              : this.props.currRelation === "Movie"
                ? <tbody>
                    <tr style={{ border: "1px solid black" }}>
                      <td style={{ border: "1px solid black" }}><label>Movie ID:</label></td>
                      <td style={{ border: "1px solid black" }}><label>Title:</label></td>
                      <td style={{ border: "1px solid black" }}><label>Release Date:</label></td>
                      <td style={{ border: "1px solid black" }}><label>Genres:</label></td>
                    </tr>
                    {this.state.relationRows.map((row) =>
                    <tr key={`${row.Movie_ID}, ${row.Genre}`} style={{ border: "1px solid black" }}>
                      <td style={{ border: "1px solid black" }}>{row.Movie_ID}</td>
                      <td style={{ border: "1px solid black" }}>{row.Title}</td>
                      <td style={{ border: "1px solid black" }}>{new Date(row.Release_Date).toISOString().split('T')[0]}</td>
                      <td style={{ border: "1px solid black" }}>{row.Genre}</td>
                    </tr>
                    )}
                  </tbody>
                : this.props.currRelation === "SHOWING_IN"
                  ? <tbody>
                      <tr style={{ border: "1px solid black" }}>
                        <td style={{ border: "1px solid black" }}><label>Movie ID:</label></td>
                        <td style={{ border: "1px solid black" }}><label>Movie Title:</label></td>
                        <td style={{ border: "1px solid black" }}><label>Theater Location:</label></td>
                      </tr>
                      {this.state.relationRows.map((row) => 
                      <tr key={`${row.Movie_ID}, ${row.Theater_Location}`} style={{ border: "1px solid black" }}>
                        <td style={{ border: "1px solid black" }}>{row.Movie_ID}</td>
                        <td style={{ border: "1px solid black" }}>{row.Title}</td>
                        <td style={{ border: "1px solid black" }}>{row.Theater_Location}</td>
                      </tr>
                      )}
                    </tbody>
                  : this.props.currRelation === "Film_Workers"
                    ? <tbody>
                        <tr style={{ border: "1px solid black" }}>
                          <td style={{ border: "1px solid black" }}><label>Film Worker ID:</label></td>
                          <td style={{ border: "1px solid black" }}><label>First Name:</label></td>
                          <td style={{ border: "1px solid black" }}><label>Last Name:</label></td>
                          <td style={{ border: "1px solid black" }}><label>Is Actor/Actress?</label></td>
                          <td style={{ border: "1px solid black" }}><label>Is Director?</label></td>
                        </tr>
                        {this.state.relationRows.map((row) =>
                        <tr key={row.Film_Worker_ID} style={{ border: "1px solid black" }}>
                          <td style={{ border: "1px solid black" }}>{row.Film_Worker_ID}</td>
                          <td style={{ border: "1px solid black" }}>{row.First_Name}</td>
                          <td style={{ border: "1px solid black" }}>{row.Last_Name}</td>
                          <td style={{ border: "1px solid black" }}>{row.Is_Actor}</td>
                          <td style={{ border: "1px solid black" }}>{row.Is_Director}</td>
                        </tr>
                        )}
                      </tbody>
                    : this.props.currRelation === "WORKED_ON"
                      ? <tbody>
                          <tr style={{ border: "1px solid black" }}>
                            <td style={{ border: "1px solid black" }}><label>Film Worker ID:</label></td>
                            <td style={{ border: "1px solid black" }}><label>First Name:</label></td>
                            <td style={{ border: "1px solid black" }}><label>Last Name:</label></td>
                            <td style={{ border: "1px solid black" }}><label>Movie ID:</label></td>
                            <td style={{ border: "1px solid black" }}><label>Title:</label></td>
                          </tr>
                          {this.state.relationRows.map((row) => 
                          <tr key={`${row.Film_Worker_ID}, ${row.Movie_ID}`} style={{ border: "1px solid black" }}>
                            <td style={{ border: "1px solid black" }}>{row.Film_Worker_ID}</td>
                            <td style={{ border: "1px solid black" }}>{row.First_Name}</td>
                            <td style={{ border: "1px solid black" }}>{row.Last_Name}</td>
                            <td style={{ border: "1px solid black" }}>{row.Movie_ID}</td>
                            <td style={{ border: "1px solid black" }}>{row.Title}</td>
                          </tr>
                          )}
                        </tbody>
                      : this.props.currRelation === "Studio"
                        ? <tbody>
                            <tr style={{ border: "1px solid black" }}>
                              <td style={{ border: "1px solid black" }}><label>Studio Name:</label></td>
                            </tr>
                            {this.state.relationRows.map((row) =>
                            <tr key={row.Studio_Name} style={{ border: "1px solid black" }}>
                              <td style={{ border: "1px solid black" }}>{row.Studio_Name}</td>
                            </tr>
                            )}
                          </tbody>
                        : this.props.currRelation === "PRODUCED_BY"
                          ? <tbody>
                              <tr style={{ border: "1px solid black" }}>
                                <td style={{ border: "1px solid black" }}><label>Movie ID:</label></td>
                                <td style={{ border: "1px solid black" }}><label>Title:</label></td>
                                <td style={{ border: "1px solid black" }}><label>Studio Name:</label></td>
                              </tr>
                              {this.state.relationRows.map((row) =>
                              <tr key={`${row.Movie_ID}, ${row.Studio_Name}`} style={{ border: "1px solid black" }}>
                                <td style={{ border: "1px solid black" }}>{row.Movie_ID}</td>
                                <td style={{ border: "1px solid black" }}>{row.Title}</td>
                                <td style={{ border: "1px solid black" }}>{row.Studio_Name}</td>
                              </tr>
                              )}
                            </tbody>
                          : this.props.currRelation === "DB_User"
                            ? <tbody>
                                <tr style={{ border: "1px solid black" }}>
                                  <td style={{ border: "1px solid black" }}><label>Username:</label></td>
                                  <td style={{ border: "1px solid black" }}><label>Password:</label></td>
                                  <td style={{ border: "1px solid black" }}><label>Is Moderator:</label></td>
                                </tr>
                                {this.state.relationRows.map((row) =>
                                <tr key={row.Username} style={{ border: "1px solid black" }}>
                                  <td style={{ border: "1px solid black" }}>{row.Username}</td>
                                  <td style={{ border: "1px solid black" }}>{row.User_Password}</td>
                                  <td style={{ border: "1px solid black" }}>{row.Is_Moderator}</td>
                                </tr>
                                )}
                              </tbody>
                            : this.props.currRelation === "Rating"
                              ? <tbody>
                                  <tr>
                                    <td style={{ border: "1px solid black" }}><label>Movie ID:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Title:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Username:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Score:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Updated Last:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Title:</label></td>
                                    <td style={{ border: "1px solid black" }}><label>Description:</label></td>
                                  </tr>
                                  {this.state.relationRows.map((row) =>
                                  <tr key={`${row.Movie_ID}, ${row.Users_Username}`} style={{ border: "1px solid black" }}>
                                    <td style={{ border: "1px solid black" }}>{row.Movie_ID}</td>
                                    <td style={{ border: "1px solid black" }}>{row.Movie_Title}</td>
                                    <td style={{ border: "1px solid black" }}>{row.Users_Username}</td>
                                    <td style={{ border: "1px solid black" }}>{row.Score}</td>
                                    <td style={{ border: "1px solid black" }}>
                                      {new Date(row.Date_Last_Updated).toISOString().split('T')[0]}
                                    </td>
                                    <td style={{ border: "1px solid black" }}>{row.Title}</td>
                                    <td style={{ border: "1px solid black" }}>{row.Rating_Description}</td>
                                  </tr>
                                  )}
                                </tbody>
                              : null
            : null
          }
        </table>
      </div>
    )
  }
}

export default ShowRelationData;
