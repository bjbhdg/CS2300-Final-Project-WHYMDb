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
      ratingChosen: false
    }

    this.changeChosenDBEditType = this.changeChosenDBEditType.bind(this);
    this.changeRenderedRelationOption = this.changeRenderedRelationOption.bind(this);
  }

  changeChosenDBEditType(event) {
    this.setState(resetDBUpdateType);

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
  }

  renderFilmWorkerEdit() {
    return (
      <div style={{ marginTop: "5px" }}>
        <div style={{ display: "inline-flex", marginLeft: "auto", marginRight: "auto" }}>
          <p>Be Sure to Specify What Kind of Film Worker:</p>
          <div>
            <input style={{ marginLeft: "10px" }} type="radio" name="filmWorkerType" id="actor" value="Actor_Actress" />
            <label style={{ marginLeft: "2px" }} htmlFor="actor">Actor/Actress</label>
          </div>
          <div>
            <input style={{ marginLeft: "10px" }} type="radio" name="filmWorkerType" id="director" value="Director" />
            <label style={{ marginLeft: "2px" }} htmlFor="director">Director</label>
          </div>
        </div>

        { this.state.updateDBChosen
          ? <p>Radtasitcal</p>
          : this.state.deleteDBChosen
            ? <p>Cool</p>
            : this.state.insertDBChosen
              ? <p>Awesome</p>
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
          <form method="POST" action='/editDatabase'>
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
            <select id="selectedRelation" name="selectedRelation">

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