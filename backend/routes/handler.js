const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');

// When on the 'search' page (URL: localhost:3000/search), the page will retrieve the matching movies that the
// "POST" function below added into the "Search_Results" table.
router.get('/search', async (req, res) => {
  // Establish connection to the MySQL database.
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {
      // Query the database for the movie titles of the searched movie results.
      const grabSearchResults = `SELECT Searched_Movie_Title FROM Search_Results`
      conn.query(grabSearchResults, (err, result) => {
        if (err) console.log(err)
        // Send that data to SearchResults.js page for further processing.
        res.send(JSON.stringify(result));
        conn.release();
      });
    } catch (err) {
      console.log(err);
      res.end();
    }
  });
});

// When pressing 'Search' on the homepage of the app, express will route the data submitted via the HTML
// form to here.
router.post('/searchSubmitted', async (req, res) => {
  // Houses user-entered data from the HTML form data of "SearchPage.js".
  const movieTitle = req.body.title;
  const dateRangeStart = (req.body.releaseDateStart ? req.body.releaseDateStart : null);
  const dateRangeEnd = (req.body.releaseDateEnd ? req.body.releaseDateEnd : null);
  const aFirstName = req.body.actorFirstName;
  const aLastName = req.body.actorLastName;
  const dFirstName = req.body.directorFirstName;
  const dLastName = req.body.directorLastName;
  const stuName = req.body.studioName;
  const theatLoc = req.body.theaterLocation;
  const minRate = req.body.minScore;
  const maxRate = req.body.maxScore;
  const genres = req.body.genreList.split(', '); //Stored as a comma delimited string, so split that up here.

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    // This query will be used to reset the search table in our database schema imported from `whymdb_sql_database.sql`.
    const RESET_SEARCH = `DROP TABLE IF EXISTS Search_Results`

    conn.query(RESET_SEARCH, (err, result) => {
      if (err) console.log("Failed to Reset Search.");
      else console.log("Search Successfully Reset.")
    });

    // Creates a table to store movie titles that match up with the passed in search fields.
    const CREATE_SEARCH = `
      CREATE TABLE Search_Results (
        Search_ID INT NOT NULL AUTO_INCREMENT,
        Searched_Movie_Title VARCHAR(200) NOT NULL,
        PRIMARY KEY(Search_ID)
    )`;

    // Recreates search table to insert search results in.
    conn.query(CREATE_SEARCH, (err, result) => {
      if (err) console.log("Search Init Failed.");
      else console.log("Search Initialized.");
    });

    // This query will match any movies that pass any passed in filters.
    const searchForMovies = `
    INSERT INTO Search_Results(Searched_Movie_Title)
      SELECT M.Title

      FROM Movie AS M

      WHERE M.Title = ?

        OR M.Release_Date BETWEEN ? AND ?

        OR M.Movie_ID IN (
          SELECT W.Movie_ID
          FROM Worked_On as W
          WHERE W.Film_Worker_ID IN (
            SELECT Film_Worker_ID
            FROM Film_Workers
            INNER JOIN actor_actress ON Film_Worker_ID = ID
            WHERE First_Name = ? OR Last_Name = ?))

        OR M.Movie_ID IN (
          SELECT W.Movie_ID
          FROM Worked_On as W
          WHERE W.Film_Worker_ID IN (
            SELECT Film_Worker_ID
            FROM Film_Workers
            INNER JOIN Director ON Film_Worker_ID = ID
            WHERE First_Name = ? OR Last_Name = ?))

        OR M.Movie_ID IN (SELECT P.Movie_ID
          FROM PRODUCED_BY AS P
          WHERE P.Studio_Name = ?)

        OR M.Movie_ID IN (SELECT SH.Movie_ID
          FROM SHOWING_IN AS SH
          WHERE SH.Theater_Location = ?)

        OR M.Movie_ID IN (SELECT SC.Rated_Movie_ID
          FROM (SELECT R.Movie_ID AS Rated_Movie_ID, (SUM(R.Score) / COUNT(R.Score)) AS Average_Score
            FROM Rating AS R
            GROUP BY R.Movie_ID) AS SC
          WHERE SC.Average_Score BETWEEN ? AND ?)

        OR M.Movie_ID IN (SELECT G.Movie_ID
          FROM Movie_Genres AS G
          WHERE Genre IN ?)
    `;

    conn.query(searchForMovies,
        [movieTitle, dateRangeStart, dateRangeEnd, aFirstName, aLastName,
          dFirstName, dLastName, stuName, theatLoc, minRate, maxRate, [genres]
        ],
          (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log('Search Processed Successfully!!!');
    });

    // After this route is over, redirect the user to the "/search" page to view their search's results.
    res.redirect('/search');
    res.end();
  });
});

// When on the Account page after clicking the link on the navigation bar, the page will
// request user login data that we have stored as a table. It does this so it can determine whether
// or not to display the log in page or the user account page.
router.get('/account', async (req, res) => {
// Establish connection to the MySQL database.
pool.getConnection( (err, conn) => {
  if (err) console.log(err);

  // A MySQL table is created, to store the username of the logged in user and whether or
  // not they have mod privileges.
  const CREATE_USER_LOGGED_IN = `
    CREATE TABLE IF NOT EXISTS User_Logged_In (
      Logged_In_Username VARCHAR(20) NOT NULL,
      Is_Moderator BOOLEAN,
      FOREIGN KEY(Logged_In_Username) REFERENCES DB_User(Username) ON DELETE CASCADE
  )`;

  conn.query(CREATE_USER_LOGGED_IN, (err, result) => {
    if (err) console.log(err);
    else console.log("Log-In Set Up.");
  });


  try {
    //The query below actually sends the data for the frontend to process.
    const sendUserLoginInfo = `SELECT * FROM User_Logged_In`;

    conn.query(sendUserLoginInfo, (err, result) => {
      if (err) console.log(err);
      res.send(JSON.stringify(result));
      conn.release();
    });
    } catch (err) {
      console.log(err);
      res.end();
    }
  });
});

// Also, when on the '/account' page in the frontend, the page will request
// the ratings that the logged in user has written, for their own viewing's sake.
router.get('/getUserRatings', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
      // Returns all of the Rating table except 'Movie_ID' (Which is just replaced with the movie's name)/
      const obtainLoggedInUserRatings = `
        SELECT (Select Title FROM Movie WHERE Movie_ID = R.Movie_ID) as Rated_Movie,
          R.Score, R.Date_Last_Updated, R.Title, R.Rating_Description
        FROM Rating AS R, User_Logged_In AS U
        WHERE R.Users_Username = U.Logged_In_Username
      `;

      conn.query(obtainLoggedInUserRatings, (err, result) => {
        if (err) console.log(err);
        res.send(JSON.stringify(result));
        conn.release();
      });
    } catch (err) {
      console.log(err);
      res.end();
    }
  });
});

// The log in form on the '/account' page will be routed to here upon completion.
router.post('/login', async (req, res) => {
  // The user's username and password is transferred over.
  const username = req.body.username;
  const password = req.body.pass;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const usernameOfLoggedInUser = `
      INSERT INTO User_Logged_In(Logged_In_Username) (SELECT Username FROM DB_User WHERE Username=? AND User_Password=?)
    `;

    const isLoggedInUserMod = `
      UPDATE User_Logged_In
      SET Is_Moderator = (SELECT (A.Username = B.Mod_Username) FROM DB_User AS A, Moderator AS B WHERE A.Username=?)
      WHERE Logged_In_Username=?
    `;

    // Will insert into the User_Logged_In table the username of the passed in data.
    conn.query(usernameOfLoggedInUser, [username, password], (err, result) => {
      if (err) console.log(err);
      else console.log("Account Info Entered.");
    });

    // This will update the logged in username tuple with whether or not that username has moderator privileges.
    conn.query(isLoggedInUserMod, [username, username], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("Moderator Status Determined.");
    });

    // express will redirect the route back to /account for the logged in user to view.
    res.redirect('/account');
    res.end();
  });
});

// Below the log in form, there is a create account form for users to fill in if they do
// not have an account already.
router.post('/createAccount', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const newUsername = req.body.newUser;
    const newPassword = req.body.newPass;

    const newUser =  `INSERT INTO DB_User VALUES(?, ?)`

    // Simply inserts a new user tuple into DB_User.
    conn.query(newUser, [newUsername, newPassword], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("Successfully added user!");
    });

    // The user will now need to log in with their newly added account credentials.
    res.redirect('/account');
    res.end();
  });
});

// When pressing the 'logout' button on the '/account' page, we simply drop the User_Logged_In
// table, since we recreate it every time we enter back into the '/account' page.
router.post('/logout', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const RESET_LOGGED_IN_USER = `DROP TABLE IF EXISTS User_Logged_In`;

    // Drop the User_Logged_In table.
    conn.query(RESET_LOGGED_IN_USER, (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("Successfully logged out.");
    });

    // Send the user back to the home (search) page.
    res.redirect('/');
    res.end();
  });
});

// When deleting an account, the user account's deletion will cascade throughout the schema.
// The user's ratings and logged_in status will be deleted, alongside their DB_User information.
router.post('/deleteAccount', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const deleteUser = `DELETE FROM DB_User WHERE Username = (SELECT Logged_In_Username FROM User_Logged_In)`;

    // The logged in user's account on DB_User will be deleted.
    conn.query(deleteUser, (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log("User successfully deleted.")
    });
  });
  
  // The user will be sent to the log in page.
  res.redirect('/account');
  res.end();
});

module.exports = router;
