import React, { useEffect, useState } from 'react';

function Account() {
  useEffect( () => {
    fetchUserLoggedIn();
  }, []);

  const [currentUser, setUser] = useState([]);

  const fetchUserLoggedIn = async () => {
    const data = await fetch('/account');
    const userInfo = await data.json();
    setUser(userInfo);
  };

  return(
    <div>
      <h1 className="mt-5">WHYMDb</h1>
      { !currentUser.length
        ? <div>
            <h2 className='mt-3'>Please Log-In To Your Account</h2>
            <form method="POST" action="/login">
              <label>Username:</label>
              <input type="text" name="username" /><br/>
              <label>Password:</label>
              <input type="password" name="pass" /><br/>
              <input type="submit" value="Submit" className="btn btn-primary mb-2" /> 
            </form>
          </div>
        : <div>
            <p>You're Logged In...</p>
            <form method="POST" action="/logout">
              <input type="submit" value="Log Out" className="btn btn-primary mb-2" />
            </form>
          </div>
      }
    </div>
  );
}

export default Account;
