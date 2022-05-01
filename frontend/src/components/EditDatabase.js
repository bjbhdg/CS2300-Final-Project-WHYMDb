import React from 'react';
import ShowRelationData from './ShowRelationData';

const resetDBUpdateType = {
  updateDBChosen: false,
  deleteDBChosen: false,
  insertDBChosen: false,

  toggleOpHourEdit: false
}

const resetDropDownMenu = {
  theaterChosen: false,
  movieChosen: false,
  showingInChosen: false,
  filmWorkerChosen: false,
  workedOnChosen: false,
  studioChosen: false,
  producedByChosen: false,
  dbUserChosen: false,
  ratingChosen: false,

  toggleOpHourEdit: false,
  showRelationRows: false
};

class EditDatabase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateDBChosen: false,
      deleteDBChosen: false,
      insertDBChosen: false,

      theaterChosen: false,
      movieChosen: false,
      showingInChosen: false,
      filmWorkerChosen: false,
      workedOnChosen: false,
      studioChosen: false,
      producedByChosen: false,
      dbUserChosen: false,
      ratingChosen: false,

      disableRelationChoice: true,
      toggleOpHourEdit: false,

      currChosenRelation: "Default",
      showRelationRows: false
    }

    this.changeChosenDBEditType = this.changeChosenDBEditType.bind(this);
    this.changeRenderedRelationOption = this.changeRenderedRelationOption.bind(this);
    this.changeRouterURL = this.changeRouterURL.bind(this);
  }

  changeChosenDBEditType(event) {
    this.setState({ ...resetDBUpdateType, disableRelationChoice: false});

    switch(event.target.value) {
      case "update":
        this.setState({ updateDBChosen: true });
        break;

      case "delete":
        this.setState({ deleteDBChosen: true });
        break;

      case "insert":
        this.setState({ insertDBChosen: true });
        break;

      default:
        console.log("You're not supposed to be here! What did you do??? >:(")
    }
  }

  changeRenderedRelationOption(event) {
    switch(event.target.value) {
      case "Theater":
        this.setState({ ...resetDropDownMenu, theaterChosen: true });
        break;

      case "Movie":
        this.setState({ ...resetDropDownMenu, movieChosen: true });
        break;

      case "SHOWING_IN":
        this.setState({ ...resetDropDownMenu, showingInChosen: true });
        break;
      
      case "Film_Workers":
        this.setState({ ...resetDropDownMenu, filmWorkerChosen: true });
        break;

      case "WORKED_ON":
        this.setState({ ...resetDropDownMenu, workedOnChosen: true });
        break;

      case "Studio":
        this.setState({ ...resetDropDownMenu, studioChosen: true });
        break;

      case "PRODUCED_BY":
        this.setState({ ...resetDropDownMenu, producedByChosen: true });
        break;

      case "DB_User":
        this.setState({ ...resetDropDownMenu, dbUserChosen: true });
        break;

      case "Rating":
        this.setState({ ...resetDropDownMenu, ratingChosen: true });
        break;

      default:
        this.setState({ ...resetDropDownMenu });
    }

    this.setState({ currChosenRelation: event.target.value });
  }

  changeRouterURL(event) {
    // Grabs the current route that the edit database form will submit data to.
    const currentRoute = document.getElementById("alterDatabase").attributes.action.value;

    // If the database edit type is switched and we are not at the default route.
    if(event.target.name === "dbUpdateType" && currentRoute !== "/editDatabaseDefault")
    {
      // Change the beginning of the route URL to either "update", "delete", or "insert". The currentRoute.substring(7) grabs the
      // remaining part of the previous URL. This is used when a user swaps a database edit type while already having a relation selected.
      document.getElementById("alterDatabase").action = `/${event.target.value}${currentRoute.substring(7)}`;      
    // The else if statement is called when a user chooses a relation from the drop down list.
    } else if(event.target.name !== "dbUpdateType") {
      // Below, the relation name is appended to the end of the routing URL for correct data handling.
      if(this.state.deleteDBChosen) {
        document.getElementById("alterDatabase").action = `/delete${event.target.value}`;
      } else if(this.state.updateDBChosen) {
        document.getElementById("alterDatabase").action = `/update${event.target.value}`;
      } else if(this.state.insertDBChosen) {
        document.getElementById("alterDatabase").action = `/insert${event.target.value}`;
      }
    }

    // If by any chance the user selectes "-Select Relation-" in the relation drop down menu, then route the database edit form
    // to the default database edit route. 
    if(event.target.value === "Default" && event.target.name !== "dbUpdateType") {
      document.getElementById("alterDatabase").action = `/editDatabaseDefault`
    }
  }

  renderTheaterEdit() {
    const daysOfWeek = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];
    const dayOfWeekDDMEntries = daysOfWeek.map((day) =>
      <option key={day} value={day}>{day}</option>
    )

    return (
      <div style={{ marginTop: "5px" }}>
        { this.state.updateDBChosen
          ? <div>
              <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                <tbody>
                  <tr>
                    <td><label>Pre-Existing Location:</label></td>
                    <td><input type="text" name="preExistTheater" placeholder="Theater Address" className="form-control" /></td>
                  </tr>
                  <tr>
                    <td><label>Updated Location:</label></td>
                    <td>
                      <input type="text" name="theaterLocation" placeholder="Updated Address (If Applicable)"
                        className="form-control"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td><label>Updated Owner:</label></td>
                    <td><input type="text" name="newOwner" placeholder="Owner" className="form-control" /></td>
                  </tr>
                  <tr>
                    <td><label>Just Editing Operating Hours?</label></td>
                    <td>
                      <input id="opHourEditEnable" type="checkbox" name="opHourEditEnable"
                        onChange={() => this.setState({ toggleOpHourEdit: !this.state.toggleOpHourEdit })}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                { this.state.toggleOpHourEdit
                  ? <tbody>
                      <tr>
                        <td><label>Day of the Week</label></td>
                        <td><select id="dayOfWeek" name="dayOfWeek">{dayOfWeekDDMEntries}</select></td>
                      </tr>
                      <tr>
                        <td><label>Opening Time:</label></td>
                        <td><input type="time" name="openingTime" className="form-control" style={{ width: "auto" }} /></td>
                      </tr>
                      <tr>
                        <td><label>Closing Time:</label></td>
                        <td><input type="time" name="closingTime" className="form-control" style={{ width: "auto" }} /></td>
                      </tr>
                    </tbody>
                : null
              }
              </table>
            </div>
          : this.state.deleteDBChosen
            ? <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                <tbody>
                  <tr>
                    <td><label>Location:</label></td>
                    <td><input type="text" name="theaterLocation" placeholder="Theater Address" className="form-control" /></td>
                  </tr>
                </tbody>
              </table>
            : this.state.insertDBChosen
              ? <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                  <tbody>
                    <tr>
                      <td><label>Location:</label></td>
                      <td><input type="text" name="theaterLocation" placeholder="Theater Address" className="form-control" /></td>
                    </tr>
                    <tr>
                      <td><label>Owner:</label></td>
                      <td><input type="text" name="theaterOwner" placeholder="Owner" className="form-control" /></td>
                    </tr>
                    <tr>
                      <td><label>Just Insert Operating Hours?</label></td>
                      <td>
                      <input id="opHourEditEnable" type="checkbox" name="opHourInsertEnable"
                        onChange={() => this.setState({ toggleOpHourEdit: !this.state.toggleOpHourEdit })}
                      />
                      </td>
                    </tr>
                  </tbody>
                  { this.state.toggleOpHourEdit
                    ? <tbody>
                        <tr>
                          <td><label>Pre-Existing Theater:</label></td>
                          <td>
                            <input type="text" name="preExistingTheater" placeholder="Theater Address" className="form-control" />
                          </td>
                        </tr>
                        <tr>
                          <td><label>Day of the Week</label></td>
                          <td><select id="dayOfWeek" name="dayOfWeek">{dayOfWeekDDMEntries}</select></td>
                        </tr>
                        <tr>
                          <td><label>Opening Time:</label></td>
                          <td><input type="time" name="openingTime" className="form-control" style={{ width: "auto" }} /></td>
                        </tr>
                        <tr>
                          <td><label>Closing Time:</label></td>
                          <td><input type="time" name="closingTime" className="form-control" style={{ width: "auto" }} /></td>
                        </tr>
                      </tbody>
                    : null
                  }
                </table>
              : null
        }
      </div>
    );
  }

  renderFilmWorkerEdit() {
    return (
      <div style={{ marginTop: "5px" }}>
        <div style={{ display: "inline-flex", marginLeft: "auto", marginRight: "auto" }}>

          <p>Be Sure to Specify What Type of Film Worker:</p>

          <div>
            <input style={{ marginLeft: "10px" }} type="radio" name="filmWorkerType" id="actor" value="Actor_Actress"
              onChange={event => this.changeRouterURL(event)}
            />
            <label style={{ marginLeft: "2px" }} htmlFor="actor">Actor/Actress</label>
          </div>
          <div>
            <input style={{ marginLeft: "10px" }} type="radio" name="filmWorkerType" id="director" value="Director"
              onChange={event => this.changeRouterURL(event)}
            />
            <label style={{ marginLeft: "2px" }} htmlFor="director">Director</label>
          </div>

        </div>

        { this.state.updateDBChosen
          ? <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
              <tbody>
                <tr>
                  <td><label>Film Maker ID:</label></td>
                  <td><input type="number" name="filmWorkerID" placeholder="Actor/Director ID" className="form-control" /></td>
                </tr>
                <tr>
                  <td><label>Updated First Name:</label></td>
                  <td><input type="text" name="newFirstName" placeholder="First Name (Not Needed)" className="form-control" /></td>
                </tr>
                <tr>
                  <td><label>Updated Last Name:</label></td>
                  <td><input type="text" name="newLastName" placeholder="Last Name (Not Needed)" className="form-control" /></td>
                </tr>
                <tr>
                  <td><label>Make Specified Film Worker Type?</label></td>
                  <td><input type="checkbox" name="specifyFWType" /></td>
                </tr>
              </tbody>
          </table>
          : this.state.deleteDBChosen
            ? <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                <tbody>
                  <tr>
                    <td><label>Film Worker ID:</label></td>
                    <td><input type="number" name="filmWorkerID" placeholder="Actor/Director ID" className="form-control" /></td>
                  </tr>
                  <tr>
                    <td><label>Only Remove Specified Film Worker Type?</label></td>
                    <td><input type="checkbox" name="specifyFWType" /></td>
                </tr>
                </tbody>
            </table>
            : this.state.insertDBChosen
              ? <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto" }}>
                  <tbody>
                    <tr>
                      <td><label>First Name:</label></td>
                      <td><input type="text" name="firstName" placeholder="First Name" className="form-control" /></td>
                    </tr>
                    <tr>
                      <td><label>Last Name:</label></td>
                      <td><input type="text" name="lastName" placeholder="Last Name" className="form-control" /></td>
                    </tr>
                  </tbody>
                </table>
              : null
          }
      </div>
    )
  }

  render() {
    return (
      <div style={{ marginLeft: "auto", marginRight: "auto" }}>
        <h2 className="mt-3">Edit Database:</h2>
        <div>
          <form id="alterDatabase" method="POST" action='/editDatabaseDefault'>
            <div style={{ display: "inline-flex" }}>
              <p>Action You Will Perform:</p>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="update" value="update"
                  onClick={event => {this.changeChosenDBEditType(event); this.changeRouterURL(event)}} 
                />
                <label style={{ marginLeft: "2px" }} htmlFor="update">Update</label>
              </div>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="delete" value="delete"
                  onClick={event => {this.changeChosenDBEditType(event); this.changeRouterURL(event)}}
                />
                <label style={{ marginLeft: "2px" }} htmlFor="delete">Delete</label>
              </div>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="insert" value="insert"
                  onClick={event => {this.changeChosenDBEditType(event); this.changeRouterURL(event)}}
                />
                <label style={{ marginLeft: "2px" }} htmlFor="insert">Insert</label>
              </div>
            </div>

            <p>Select the Relation you Would Like To Edit:</p>
            <select disabled={this.state.disableRelationChoice} id="selectedRelation" name="selectedRelation">
              <option value="Default" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                -Select Relation-
              </option>

              <option value="Theater" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Theater
              </option>

              <option value="Movie" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Movie
              </option>

              <option value="SHOWING_IN" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Showing In
              </option>

              <option value="Film_Workers" onClick={event => this.changeRenderedRelationOption(event)}>
                Film Worker
              </option>

              <option value="WORKED_ON" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Worked On
              </option>

              <option value="Studio" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Studio
              </option>

              <option value="PRODUCED_BY" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Produced By
              </option>

              <option value="DB_User" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                User
              </option>

              <option value="Rating" onClick={event => {this.changeRenderedRelationOption(event); this.changeRouterURL(event)}}>
                Rating
              </option>

            </select><br/>
            <div>
              <label>{`Show Existing Entries in the ${this.state.currChosenRelation} Relation?`}</label>
              <input type="checkbox" checked={this.state.showRelationRows} style={{ marginLeft: "5px" }}
                onChange={() => this.setState({ showRelationRows: !this.state.showRelationRows })}
              />
              { this.state.showRelationRows
                ? <ShowRelationData currRelation={this.state.currChosenRelation} />
                : null
              }
            </div>
            <p>Use the Fields Below to Alter the Database:</p>
            <div>
              { this.state.theaterChosen ? this.renderTheaterEdit() : null}
              { this.state.filmWorkerChosen ? this.renderFilmWorkerEdit() : null}
            </div>
            <input type="submit" className="btn btn-primary mb-2" value="Submit Changes" style={{ marginTop: "5px" }} />
          </form>
        </div>
      </div>
    );
  }
}

export default EditDatabase;