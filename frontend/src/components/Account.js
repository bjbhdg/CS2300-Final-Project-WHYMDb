import React, { useEffect, useState } from 'react';

function Account() {
  useEffect( () => {
    fetchUserLoggedIn();
    fetchUserRatings();
  }, []);

  const [currentUser, setUser] = useState([]);
  const [userRatings, setUserRatings] = useState([]);

  const fetchUserLoggedIn = async () => {
    const data = await fetch('/account');
    const userInfo = await data.json();
    console.log(userInfo);
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
      { !currentUser.length
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
              <input type="submit" value="Submit" className="btn btn-primary mb-2" /> 
            </form>
          </div>
        : <div>
            <h2 className='mt-3'>
              {`"${currentUser[0].Logged_In_Username}'s" Account Page`}
            </h2>
            <div>
              <p>My Ratings:</p>
              {userRatings.map(rating => (
                <table>
                  <tbody>
                    <tr>
                      <td><p>Title:</p></td>
                      <td><p>{rating.Rated_Movie}</p></td>
                      <td><p>Score:</p></td>
                      <td><p>{rating.Score}/10</p></td>
                    </tr>
                  </tbody>
                </table>
              ))
              }
            </div>
            <form method="POST" action="/logout">
              <input type="submit" value="Log Out" className="btn btn-primary mb-2" />
            </form>
          </div>
      }
    </div>
  );
}

export default Account;
