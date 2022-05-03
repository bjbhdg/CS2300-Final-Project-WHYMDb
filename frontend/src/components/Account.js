import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';

function Account() {
  // Upon rerender of the Account page, the user log-in information is grabbed, along with
  // any ratings the logged in user has made.
  useEffect( () => {
    fetchUserLoggedIn();
    fetchUserRatings();
  }, []);

  const [currentUser, setUser] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [confirmDelete, setDelete] = useState([]);

  // Grabs log in information.
  const fetchUserLoggedIn = async () => {
    const data = await fetch('/account');
    const userInfo = await data.json();
    setDelete(false);
    setUser(userInfo);
  };

  // Grabs user created ratings to display.
  const fetchUserRatings = async () => {
    const rawData = await fetch('/getUserRatings');
    const ratings = await rawData.json();
    setUserRatings(ratings);
  };

  return (
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      { // If the user has not logged in yet, render this.
        !currentUser.length
        ? <div>
            {/* Login Form */}
            <h2 className='mt-3'>Please Log In To Your Account</h2>
            <form method="POST" action="/login">
              <table className="mt-3" style={{ marginLeft: "auto", marginRight: "auto", width: "30%" }}>
                <tbody>
                  <tr>
                    <td>
                      <label>Username:</label>
                    </td>
                    <td>
                      <input type="text" name="username" className="form-control" style={{ width: "auto" }} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Password:</label>
                    </td>
                    <td>
                      <input type="password" name="pass" className="form-control" style={{ width: "auto" }} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <input type="submit" value="Log In" className="btn btn-primary mb-2" style={{ marginTop: "5px" }} /> 
            </form>

            <p className='mt-1'>If You Do Not Have An Account, Then You Can Create One Below.</p>
            <p style={{ fontSize: "12px" }}>
              Ensure Your Password is Between 8 to 25 Characters Long and Your Username is Within 20 Characters in Length Too.
            </p>

            {/* Create Account Form */}
            <form method="POST" action="/createAccount">
              <table className="mt-3" style={{ marginLeft: "auto", marginRight: "auto", width: "30%" }}>
                <tbody>
                  <tr>
                    <td>
                      <label>Username:</label>
                    </td>
                    <td>
                      <input type="text" name="newUser" className="form-control" style={{ width: "auto" }} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Password:</label>
                    </td>
                    <td>
                      <input type="password" name="newPass" className="form-control" style={{ width: "auto" }} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <input type="submit" value="Create Account" className="btn btn-primary mb-2" style={{ marginTop: "5px" }} /> 
            </form>
          </div>

          // If the user is logged in, render this.
        : <div>
            { // If the logged in user is a moderator, then render a link to the '/editDatabase' page.
              currentUser[0].Is_Moderator
              ? <div>
                  <p>Since You're a Moderator:</p>
                  <Link to={{ pathname: "/editDatabase", state: { isMod: currentUser[0].Is_Moderator }}}
                    className="btn btn-primary mb-2"
                  >
                    Open Edit
                  </Link>
                </div>
              : null
            }
            {/* Greeting at the top of a user's account page. */}
            <h2 className='mt-3'>
              {`Welcome "${currentUser[0].Logged_In_Username}"!`}
            </h2>
            <div>
              <p>Your Movie Ratings:</p>
              {/* Prints out a small table showcasing all of the logged in user's movie ratings. */}
              {userRatings.map(rating => (
                <table key={rating.Rated_Movie}
                  style={{ border: "1px solid black", marginLeft: "auto", marginRight: "auto",
                    width: "25%", marginBottom: "5px" }}
                >
                  <tbody>
                    {/* Title of Rating */}
                    <tr style={{ border: "1px solid black" }}>
                      <td style={{ border: "1px solid black", width: "35%" }}>Title:</td>
                      <td style={{ border: "1px solid black" }}>{rating.Rated_Movie}</td>
                    </tr>
                    {/* Score the logged in user gave the movie. */}
                    <tr style={{ border: "1px solid black" }}>
                      <td style={{ border: "1px solid black", width: "35%" }}>Your Score:</td>
                      <td style={{ border: "1px solid black" }}>{rating.Score}/10</td>
                    </tr>
                  </tbody>
                </table>
              ))
              }
            </div>
            <div>
              {/* Route to the POST method for /logout in 'handler.js' to drop the logged in user. */}
              <form method="POST" action="/logout">
                <input type="submit" value="Log Out" className="btn btn-primary mb-2" />
              </form>
            
              <form id="Account Delete" method="POST" action="/deleteAccount">
                {
                  confirmDelete ? null
                  : <button type="button" className="btn btn-primary mb-2" onClick={() => setDelete(true)}>
                      Delete Account
                    </button>
                }
                { // A "Yes" and "No" button is rendered when a user attempts to delete their account, to ensure that
                  // the user wants to follow through with this action.
                  confirmDelete 
                  ? <div>
                      <p>Are you sure you want to delete your account?</p>
                      <input type="submit" value="Yes" className="btn btn-primary mb-2"
                        style={{ marginInline: "5px" }}
                      />
                      <button type="button" className="btn btn-primary mb-2" 
                        style={{ marginInline: "5px" }} onClick={() => setDelete(false)}
                      >
                        No
                      </button>
                    </div>
                    // Don't render anything if the user hasn't pressed the "Delete Account" button.
                  : null
                }
              </form>
            </div>
          </div>
      }
    </div>
  );
}

export default Account;
