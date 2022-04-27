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
      const qry = `SELECT Searched_Movie_Title FROM Search_Results`
      conn.query(qry, (err, result) => {
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
  // Houses user-entered data from the HTML form data of "Home.js".
  const movieTitle = req.body.title;
  const releaseDate = (req.body.releaseDate ? req.body.releaseDate : null);
  const aFirstName = req.body.actorFirstName;
  const aLastName = req.body.actorLastName;
  const dFirstName = req.body.directorFirstName;
  const dLastName = req.body.directorLastName;
  const stuName = req.body.studioName;
  const theatLoc = req.body.theaterLocation;
  const minRate = req.body.minScore;
  const maxRate = req.body.maxScore;
  const genres = req.body.genreList.split(', ');

  console.log(genres);

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    // This query will be used to reset the search table in our database schema imported from `whymdb_sql_database.sql`.
    const RESET_SEARCH = `DROP TABLE IF EXISTS Search_Results`

    // Resets search table using the RESET_SEARCH query instantiated at the top of "handler.js".
    conn.query(RESET_SEARCH, (err, result) => {
      if (err) console.log("Failed to Reset Search.");
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
    });

    // qry will insert any movie titles that match with the entered in filters.
    const searchForMovies = `
    INSERT INTO Search_Results(Searched_Movie_Title)
      SELECT M.Title
      FROM Movie AS M
      WHERE (M.Title = ? OR M.Release_Date = ?)
        OR M.Movie_ID = ANY (
          SELECT W.Movie_ID
          FROM Worked_On as W
          WHERE W.Film_Worker_ID = (
            SELECT Film_Worker_ID
            FROM Film_Workers
            INNER JOIN actor_actress ON Film_Worker_ID = ID
            WHERE First_Name = ? OR Last_Name = ?))
        OR M.Movie_ID = ANY (
          SELECT W.Movie_ID
          FROM Worked_On as W
          WHERE W.Film_Worker_ID = (
            SELECT Film_Worker_ID
            FROM Film_Workers
            INNER JOIN Director ON Film_Worker_ID = ID
            WHERE First_Name = ? OR Last_Name = ?))
        OR M.Movie_ID = ANY (SELECT P.Movie_ID
          FROM PRODUCED_BY AS P
          WHERE P.Studio_Name = ?)
        OR M.Movie_ID = ANY (SELECT SH.Movie_ID
          FROM SHOWING_IN AS SH
          WHERE SH.Theater_Location = ?)
        OR M.Movie_ID = ANY (SELECT SC.Rated_Movie_ID
          FROM (SELECT R.Movie_ID AS Rated_Movie_ID, (SUM(R.Score) / COUNT(R.Score)) AS Average_Score
            FROM Rating AS R
            GROUP BY R.Movie_ID) AS SC
          WHERE SC.Average_Score BETWEEN ? AND ?)
        OR M.Movie_ID = ANY (SELECT G.Movie_ID
          FROM Movie_Genres AS G
          WHERE Genre IN ?)
    `;

    conn.query(searchForMovies,
        [movieTitle, releaseDate, aFirstName, aLastName, dFirstName, dLastName, stuName, theatLoc, minRate, maxRate, [genres]],
          (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log('Search Processed Successfully.');
    });

    // After this route is over, redirect the user to the "/search" page to view their search's results.
    res.redirect('/search');
    res.end();
  });
});

router.get('/account', async (req, res) => {
// Establish connection to the MySQL database.
pool.getConnection( (err, conn) => {
  if (err) console.log(err);

  const CREATE_USER_LOGGED_IN = `
    CREATE TABLE IF NOT EXISTS User_Logged_In (
      Logged_In_Username VARCHAR(20) NOT NULL,
      Is_Moderator BOOLEAN,
      FOREIGN KEY(Logged_In_Username) REFERENCES DB_User(Username) ON DELETE CASCADE
  )`;

  conn.query(CREATE_USER_LOGGED_IN, (err, result) => {
    if (err) console.log(err);
    console.log("Log-In Set Up.");
  });

    try {
      const qry = `SELECT * FROM User_Logged_In`;
      conn.query(qry, (err, result) => {
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

router.get('/getUserRatings', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
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

router.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.pass;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const usrnameOfLoggedInUser = `
      INSERT INTO User_Logged_In(Logged_In_Username) (SELECT Username FROM DB_User WHERE Username=? AND User_Password=?)
    `;
    const isLoggedInUserMod = `
      UPDATE User_Logged_In
      SET Is_Moderator = (SELECT (A.Username = B.Mod_Username) FROM DB_User AS A, Moderator AS B WHERE A.Username=?)
      WHERE Logged_In_Username=?
    `;

    conn.query(usrnameOfLoggedInUser, [username, password], (err, result) => {
      if (err) console.log(err);
      else console.log("Account Info Entered.");
    });

    conn.query(isLoggedInUserMod, [username, username], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("Moderator Status Obtained.");
    });

    res.redirect('/account');
    res.end();
  });
});

router.post('/createAccount', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const newUsername = req.body.newUser;
    const newPassword = req.body.newPass;

    const newUser =  `INSERT INTO DB_User VALUES(?, ?)`

    conn.query(newUser, [newUsername, newPassword], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("Successfully added user!");
    });

    res.redirect('/account');
    res.end();
  });
});

router.post('/logout', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const RESET_LOGGED_IN_USER = `DROP TABLE IF EXISTS User_Logged_In`;

    conn.query(RESET_LOGGED_IN_USER, (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log("Successfully logged out.");
    });

    res.redirect('/');
    res.end();
  });
});

router.post('/deleteAccount', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const deleteUser = `DELETE FROM DB_User WHERE Username = (SELECT Logged_In_Username FROM User_Logged_In)`;
    conn.query(deleteUser, (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log("User successfully deleted.")
    });
  });
  
  res.redirect('/account');
  res.end();
});

module.exports = router;
