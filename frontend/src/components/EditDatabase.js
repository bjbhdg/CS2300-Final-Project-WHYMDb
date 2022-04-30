import React from 'react';

const resetDBUpdateType = {
  updateDBChosen: false,
  deleteDBChosen: false,
  insertDBChosen: false
}

const resetDropDownMenu = {
  theaterChose: false,
  movieChosen: false,
  showingInChosen: false,
  filmWorkerChosen: false,
  workedOnChosen: false,
  studioChosen: false,
  producedByChosen: false,
  dbUserChosen: false,
  ratingChosen: false
};

class EditDatabase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateDBChosen: false,
      deleteDBChosen: false,
      insertDBChosen: false,

      theaterChosen: true,
      movieChosen: false,
      showingInChosen: false,
      filmWorkerChosen: false,
      workedOnChosen: false,
      studioChosen: false,
      producedByChosen: false,
      dbUserChosen: false,
      ratingChosen: false,

      disableRelationChoice: true,
      chosenRelation: ""
    }

    this.changeChosenDBEditType = this.changeChosenDBEditType.bind(this);
    this.changeRenderedRelationOption = this.changeRenderedRelationOption.bind(this);
    this.changeRouterURL = this.changeRouterURL.bind(this);
    this.getPreexistingTuple = this.getPreexistingTuple.bind(this);
  }

  changeChosenDBEditType(event) {
    this.setState({...resetDBUpdateType, disableRelationChoice: false});

    switch(event.target.value) {
      case "UPDATE":
        this.setState({ updateDBChosen: true });
        break;

      case "DELETE":
        this.setState({ deleteDBChosen: true });
        break;

      case "INSERT":
        this.setState({ insertDBChosen: true });
        break;

      default:
        console.log("You're not supposed to be here! What did you do??? >:(")
    }
  }

  changeRenderedRelationOption(event) {
    this.setState(resetDropDownMenu);

    switch(event.target.value) {
      case "Theater":
        this.setState({ theaterChosen: true });
        break;

      case "Movie":
        this.setState({ movieChosen: true });
        break;

      case "SHOWING_IN":
        this.setState({ showingInChosen: true });
        break;
      
      case "Film_Worker":
        this.setState({ filmWorkerChosen: true });
        break;

      case "WORKED_ON":
        this.setState({ workedOnChosen: true });
        break;

      case "Studio":
        this.setState({ studioChosen: true });
        break;

      case "PRODUCED_BY":
        this.setState({ producedByChosen: true })
        break;

      case "DB_User":
        this.setState({ dbUserChosen: true });
        break;

      case "Rating":
        this.setState({ ratingChosen: true })
        break;

      default:
        console.log("How did you even get here? What did you do??? >:(");
    }

    this.getPreexistingTuple(event);
  }

  getPreexistingTuple(event) {
    switch(event.target.value) {
      case "Theater":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "Movie":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "SHOWING_IN":
        this.setState({ chosenRelation: event.target.value });
        break;
      
      case "Film_Worker":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "WORKED_ON":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "Studio":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "PRODUCED_BY":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "DB_User":
        this.setState({ chosenRelation: event.target.value });
        break;

      case "Rating":
        this.setState({ chosenRelation: event.target.value });
        break;

      default:
        console.log("If you managed to get here, run...");
    }
  }

  changeRouterURL(event) {
    if(this.state.deleteDBChosen) {
      document.getElementById("alterDatabase").action = `delete${event.target.value}`;
    } else if(this.state.updateDBChosen) {
      document.getElementById("alterDatabase").action = `update${event.target.value}`;
    } else if(this.state.insertDBChosen) {
      document.getElementById("alterDatabase").action = `insert${event.target.value}`;
    }
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
                  <td><input type="text" name="newFirstName" placeholder="First Name" className="form-control" /></td>
                </tr>
                <tr>
                  <td><label>Updated Last Name:</label></td>
                  <td><input type="text" name="newLastName" placeholder="Last Name" className="form-control" /></td>
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
          <form id="alterDatabase" method="POST" action='/editDatabase'>
            <div style={{ display: "inline-flex" }}>
              <p>Action You Will Perform:</p>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="update" value="UPDATE"
                  onClick={event => this.changeChosenDBEditType(event)} 
                />
                <label style={{ marginLeft: "2px" }} htmlFor="update">Update</label>
              </div>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="delete" value="DELETE"
                  onClick={event => this.changeChosenDBEditType(event)}
                />
                <label style={{ marginLeft: "2px" }} htmlFor="delete">Delete</label>
              </div>
              <div>
                <input style={{ marginLeft: "10px" }} type="radio" name="dbUpdateType" id="insert" value="INSERT"
                  onClick={event => this.changeChosenDBEditType(event)}
                />
                <label style={{ marginLeft: "2px" }} htmlFor="insert">Insert</label>
              </div>
            </div>

            <p>Select the Relation you Would Like To Edit:</p>
            <select disabled={this.state.disableRelationChoice} id="selectedRelation" name="selectedRelation">

              <option value="Theater" onClick={event => this.changeRenderedRelationOption(event)}>
                Theater
              </option>

              <option value="Movie" onClick={event => this.changeRenderedRelationOption(event)}>
                Movie
              </option>

              <option value="SHOWING_IN" onClick={event => this.changeRenderedRelationOption(event)}>
                Showing In
              </option>

              <option value="Film_Worker" onClick={event => this.changeRenderedRelationOption(event)}>
                Film Worker
              </option>

              <option value="WORKED_ON" onClick={event => this.changeRenderedRelationOption(event)}>
                Worked On
              </option>

              <option value="Studio" onClick={event => this.changeRenderedRelationOption(event)}>
                Studio
              </option>

              <option value="PRODUCED_BY" onClick={event => this.changeRenderedRelationOption(event)}>
                Produced By
              </option>

              <option value="DB_User" onClick={event => this.changeRenderedRelationOption(event)}>
                User
              </option>

              <option value="Rating" onClick={event => this.changeRenderedRelationOption(event)}>
                Rating
              </option>

            </select>
            <div>
              { this.state.filmWorkerChosen
                ? this.renderFilmWorkerEdit()
                : null
              }
            </div>
            <input type="submit" className="btn btn-primary mb-2" value="Submit Changes" style={{ marginTop: "5px" }} />
          </form>
        </div>
      </div>
    );
  }
}

export default EditDatabase;