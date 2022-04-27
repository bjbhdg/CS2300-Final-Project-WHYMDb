import React, { useEffect, useState } from 'react';

function Account() {
  useEffect( () => {
    fetchUserLoggedIn();
    fetchUserRatings();
  }, []);

  const [currentUser, setUser] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [confirmDelete, setDelete] = useState([]);

  const fetchUserLoggedIn = async () => {
    const data = await fetch('/account');
    const userInfo = await data.json();
    console.log(userInfo);
    setDelete(false);
    setUser(userInfo);
  };

  const fetchUserRatings = async () => {
    const rawData = await fetch('/getUserRatings');
    const ratings = await rawData.json();
    console.log(ratings);
    setUserRatings(ratings);
  };

  return(
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      { // If the user has not logged in yet, render this.
        !currentUser.length
        ? <div>
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
            <h2 className='mt-3'>
              {`Welcome "${currentUser[0].Logged_In_Username}"!`}
            </h2>
            <div>
              <p>Your Movie Ratings:</p>
              {/* Update in the future, make it look prettier. */}
              {userRatings.map(rating => (
                <table style={{ marginLeft: "auto", marginRight: "auto", width: "auto", marginBottom: "5px" }}
                  key={rating.Rated_Movie}
                >
                  <tbody>
                    <tr>
                      <td>Title:</td>
                      <td>{rating.Rated_Movie}</td>
                    </tr>
                    <tr>
                      <td>Score:</td>
                      <td>{rating.Score}/10</td>
                    </tr>
                  </tbody>
                </table>
              ))
              }
            </div>
            <div> 
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
                {confirmDelete 
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
