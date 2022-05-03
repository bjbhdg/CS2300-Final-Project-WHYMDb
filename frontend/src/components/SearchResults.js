import React from 'react';
import {Link} from 'react-router-dom';
import styles from './Popups.module.css';

class SearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userLoggedInInfo: "",
      searchResultsData: "",

      showTheaterInfo: false,
      showRatings: false,
      showUserAuthenticate: false,
      showRatingInsert: false,

      currMovieIndex: 0,
      currentMovie: ""
    }

    this.fetchUserLoggedIn();
    this.fetchSearchResults();

    this.handleSearchCycle = this.handleSearchCycle.bind(this);
  }

  // Checks to see if the user searching the database is logged in.
  async fetchUserLoggedIn() {
    const rawData = await fetch('/account');
    const logInInfo = await rawData.json();
    this.setState({ userLoggedInInfo: logInInfo });
  }

  // Grabs matching movie info using the search filters filled out in the "Home" page from "handler.js".
  async fetchSearchResults() {
    const data = await fetch('/search');
    const searchedMovies = await data.json();
    if(searchedMovies.length !== 0) {
      this.setState({ searchResultsData: searchedMovies, currentMovie: searchedMovies[this.state.currMovieIndex] });
    }
  }

  handleSearchCycle(event) {
    let newIndex = this.state.currMovieIndex;

    switch(event.target.id) {
      // If the user pressed the button to cycle the movie to the left, execute this.
      case "movieDecrement":
        if (this.state.currMovieIndex <= 0) {
          newIndex = this.state.searchResultsData.length - 1;
        } else {
          newIndex -= 1;
        }
        break;

      // If the user pressed the button to cycle the selected movie to the right, execute this.
      case "movieIncrement":
        if (this.state.currMovieIndex >= this.state.searchResultsData.length - 1) {
          newIndex = 0;
        } else {
          newIndex += 1;
        }
        break;

      // Does nothing if this is somehow reached.
      default:
        break;
    }

    // The state is updated with the new index.
    this.setState({ currMovieIndex: newIndex });
    this.setState({ currentMovie: this.state.searchResultsData[newIndex] });
  }

  authenticateUserForRatings() {
    // If the user isn't logged in, then send them an alert directing them to the login page.
    if(this.state.userLoggedInInfo.length === 0) {
      window.alert(`You must log in to your account before you can leave a rating. Go to the "Account" link in the top right to log in or create an account.`);
      this.setState({ showRatingInsert: false, showUserAuthenticate: false });
    // If the user is logged in, then send them to the add rating popup page.
    } else {
      this.setState({ showRatingInsert: true, showUserAuthenticate: false })
    }
  }

  getAverageScore(currMovie) {    
    let total_score = 0;
    let num_scores = 0;

    currMovie.Ratings.split(' | ').forEach((rating) => {
      const separatedRatingData = rating.split(', ');
      total_score += parseInt(separatedRatingData[1]); // The user's score will appear second in the rating array.
      num_scores += 1
    })

    // Rounds the average rating to the nearest tenth.
    return Number((total_score / num_scores).toFixed(1));
  }

  // This pops up when the user clicks on the blue button inside the "Showing In:"
  // row of the search results table.
  theaterPopUp(movie) {
    // Theater data grabbed from the database is structure like this:
    // Location | Owner | Day | Open Time | Close Time || (New Day Data) ... ||| (New theater location data)

    // This separates all movie theater location data into an array.
    const theaters = movie.Theaters.split(' ||| ')

    return(
      <div className={styles.popupBox}>
        <div className={styles.box}>
        <h2 className="mt-3">Theater Locations Showing "{movie.Title}":</h2>
        { theaters.map((theater) =>
          <table key={theater.split(' || ')[0].split(' | ')[0]}
            style={{ marginLeft: "auto", marginRight: "auto", width: "inherit" , marginBottom: "25px",  tableLayout: "fixed" }}
          >
            <tbody>
              <tr style={{ border: "1px solid black" }}>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Location:</label></td>
                <td>{theater.split(' || ')[0].split(' | ')[0]}</td>
              </tr>
              <tr style={{ border: "1px solid black" }}>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Owner:</label></td>
                <td>{theater.split(' || ')[0].split(' | ')[1]}</td>
              </tr>
              {/* Empty space to separate the theater location/owner with its operating hours. */}
              <tr style={{ border: "1px solid black" }}>
                <td></td>
              </tr>
              <tr style={{ border: "1px solid black" }}>
                <td></td>
                <td><label style={{ fontWeight: "bold" }}>Operating Hours:</label></td>
                <td></td>
              </tr>
              <tr style={{ border: "1px solid black" }}>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Day of Week:</label></td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Opening Time:</label></td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Closing Time:</label></td>
              </tr>
              { theater.split(' || ').map((day) =>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black" }}>{day.split(' | ')[2]}</td>
                  <td style={{ border: "1px solid black" }}>{day.split(' | ')[3]}</td>
                  <td style={{ border: "1px solid black" }}>{day.split(' | ')[4]}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <input type="button" className="btn btn-primary mb-2" value="Return to Search"
          onClick={() => this.setState({ showTheaterInfo: !this.state.showTheaterInfo })}
        />
        </div>
      </div>
    );
  }

  // This pops up when the user clicks on the number of ratings shown in blue next to the
  // average rating of a movie.
  ratingPopUp(movie) {
    // When grabbing the rating data from the database, it is structured as follows:
    // Username, Score, Date Updated, Title, Description | (New Rating Entry)...

    // The split function below separates individual ratings into an array.
    const ratings = movie.Ratings.split(' | ');

    return (
      <div className={styles.popupBox}>
        <div className={styles.box}>
          <h2 className="mt-3">User Ratings For "{movie.Title}":</h2>
          { ratings.map((rating) =>
            <table key={rating.split(', ')[0]}
              style={{ border: "1px solid black", marginLeft: "auto", marginRight: "auto", width: "inherit" ,
                marginBottom: "20px",  tableLayout: "fixed" }}
            >
              <tbody>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Rating User:</label></td>
                  <td style={{ border: "1px solid black" }}>{rating.split(', ')[0]}</td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Score:</label></td>
                  <td style={{ border: "1px solid black" }}>{rating.split(', ')[1]}</td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Date Last Updated:</label></td>
                  <td style={{ border: "1px solid black" }}>{new Date(rating.split(', ')[2]).toISOString().split('T')[0]}</td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Rating Title:</label></td>
                  <td style={{ border: "1px solid black" }}>{rating.split(', ')[3]}</td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Rating Description:</label></td>
                  <td style={{ border: "1px solid black" }}>{rating.split(', ')[4]}</td>
                </tr>
              </tbody>
            </table>
          )}
          <button type="button" className="btn btn-primary mb-2" style={{ marginRight: "5px" }}
            onClick={() => this.setState({ showRatings: false, showUserAuthenticate: true })}
          >
            Add Rating
          </button>

          <button type="button" className="btn btn-primary mb-2" style={{ marginLeft: "5px" }}
            onClick={() => this.setState({ showRatings: !this.state.showRatings })}
          >
            Return to Search
          </button>        
        </div>
      </div>
    );
  }

  // This last pop up comes up whenever a logged in user wants to leave a rating for a movie.
  addRatingPopUp() {
    return (
      <div className={styles.popupBox}>
        <div className={styles.box}>
          <form method="POST" action="/addMovieRating">
            <h1>Adding Rating for "{this.state.currentMovie.Title}":</h1>
            <h2 className="mt-3">Fill In The Fields Below:</h2>
            <table style={{ marginLeft: "auto", marginRight: "auto", width: "50%",  tableLayout: "fixed", marginBottom: "10px" }}>
              <tbody>
                <tr>
                  <td><label>Movie ID:</label></td>
                  <td>
                    <input type="text" value={this.state.currentMovie.Movie_ID} readOnly={true} className="form-control"
                      name="theMovieID"
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Your Username:</label></td>
                  <td>
                    <input type="text" value={this.state.userLoggedInInfo[0].Logged_In_Username} readOnly={true}
                      className="form-control" name="myUsername"
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Score:</label></td>
                  <td>
                    <input type="number" max={10} min={0} name="myRating" placeholder="Out of 10 (Required)"
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Title:</label></td>
                  <td><input type="text" name="myTitle" placeholder="Rating Title (Optional)" className="form-control" /></td>
                </tr>
                <tr>
                  <td><label>Description:</label></td>
                  <td>
                    <input type="text" name="myDescription" placeholder="Elaborate Here (Optional)" className="form-control" />
                  </td>
                </tr>
              </tbody>
            </table>
            <input type="button" className="btn btn-primary mb-2" value="Cancel" style={{ marginRight: "5px" }}
              onClick={() => this.setState({ showRatingInsert: false, showRatings: true })}
            />
            <input type="submit" value="Submit" className="btn btn-primary mb-2" style={{ marginLeft: "5px" }} />
          </form>
        </div>
      </div>
    );
  }

  render() {
    return(
      <div className="container-fluid">
    
        <Link style={{ marginTop: "5px" }} className="btn btn-primary mb-2" to='/'>{"<- Back To Search"}</Link>
    
        <h1 className="mt-5">WHYMDb</h1>
        <h2 className="mt-3">
          { this.state.currentMovie.length !== 0
            ? `Search Result ${this.state.currentMovie.Search_ID} of ${this.state.searchResultsData.length}:`
            : `Search Results:`
          }
        </h2>
        
        { this.state.currentMovie.length !== 0
          ? <div id={this.state.currentMovie.Movie_ID}
              style={{ marginLeft: "auto", marginRight: "auto", justifyContent: "space-evenly", marginBottom: "10px" }}
            >
              {/* The two buttons below cycle through all of the movies that are in the search results. */}
              <button type="button" id="movieDecrement" className="btn btn-primary mb-2" style={{ marginRight: "5px" }}
                onClick={(event) => this.handleSearchCycle(event)}
              >
                Previous Movie
              </button>
              <button type="button" id="movieIncrement" className="btn btn-primary mb-2" style={{ marginLeft: "5px" }}
                onClick={(event) => this.handleSearchCycle(event)}
              >
                Next Movie
              </button>
            </div>
          : null
        }

        { this.state.showRatings ? this.ratingPopUp(this.state.currentMovie) : null }
        { this.state.showTheaterInfo ? this.theaterPopUp(this.state.currentMovie) : null }
        { this.state.showRatingInsert ? this.addRatingPopUp() : null }
        { this.state.showUserAuthenticate ? this.authenticateUserForRatings() : null }

        {/* If the user's search yields results, render what's below. */}
        { this.state.searchResultsData.length !== 0
          // The table below contains data about the currently selected movie.
          ? <table style={{ border: "1px solid black", marginLeft: "auto", marginRight: "auto",
              width: "35%", marginBottom: "30px",  tableLayout: "auto" }}
            >
              <tbody>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Title:</label></td>
                  <td style={{ border: "1px solid black" }}>{this.state.currentMovie.Title}</td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                    <label>{`Genre${this.state.currentMovie.Genres.split(', ').length === 1 ? "" : "s"}:`}</label>
                  </td>
                  <td style={{ border: "1px solid black" }}><label>{this.state.currentMovie.Genres}</label></td>
                </tr>
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Average Rating:</label></td>
                  <td style={{ border: "1px solid black" }}>
                    {`${this.getAverageScore(this.state.currentMovie)}/10`}
                    <button type='button' className="btn" style={{ color: "blue", textDecoration: "underline" }}
                      onClick={() => this.setState({ showRatings: !this.state.showRatings })}
                    >
                      {`(${this.state.currentMovie.Ratings.split(' | ').length})`}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                    <label>{`Director${this.state.currentMovie.Directors.split(', ').length === 1 ? "" : "s"}:`}</label>
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    <label>{this.state.currentMovie.Directors}</label>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                    <label>{`Actor${this.state.currentMovie.Actors.split(', ').length === 1 ? "" : "s"}:`}</label>
                  </td>
                  <td style={{ border: "1px solid black" }}><label>{this.state.currentMovie.Actors}</label></td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                    <label>{`Studio${this.state.currentMovie.Studios.split(', ').length === 1 ? "" : "s"}:`}</label>
                  </td>
                  <td style={{ border: "1px solid black" }}><label>{this.state.currentMovie.Studios}</label></td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", fontWeight: "bold" }}><label>Showing In:</label></td>
                  <td style={{ border: "1px solid black" }}>
                    <button type='button' className="btn" style={{ color: "blue", textDecoration: "underline" }}
                      onClick={() => this.setState({ showTheaterInfo: !this.state.showTheaterInfo })}
                    >
                      {`(${this.state.currentMovie.Theaters.split(' ||| ').length})`}
                    </button>
                    {` Theater${this.state.currentMovie.Theaters.split('|||').length === 1 ? "" : "s"}`}
                  </td>
                </tr>
              </tbody>
            </table>

            // If no search results came up, then render this.          
          : "It looks like no results came up with your previous search, please try again."
        }
      </div>
    );
  }
}

export default SearchResults;
