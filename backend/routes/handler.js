const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');

// This query will be used to reset the search table in our database schema imported from `whymdb_sql_database.sql`.
const RESET_SEARCH = `DROP TABLE IF EXISTS Search_Results`

// Creates a table to store movie titles that match up with the passed in search fields.
const CREATE_SEARCH = `
  CREATE TABLE Search_Results (
    Search_ID INT NOT NULL AUTO_INCREMENT,
    Searched_Movie_Title VARCHAR(200) NOT NULL,
    PRIMARY KEY(Search_ID)
  )`;

const RESET_USER = `DROP TABLE IF EXISTS User_Logged_In`
const CREATE_USER_LOGGED_IN = `
  CREATE TABLE IF NOT EXISTS User_Logged_In (
    Logged_In_Username VARCHAR(20) NOT NULL,
    Is_Moderator BOOLEAN,
    PRIMARY KEY(Logged_In_Username)
)`;

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

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    // Resets search table using the RESET_SEARCH query instantiated at the top of "handler.js".
    conn.query(RESET_SEARCH, (err, result) => {
      if (err) console.log("Failed to Reset Search.");
      console.log(result);
    });

    // Recreates search table to insert search results in.
    conn.query(CREATE_SEARCH, (err, result) => {
      if (err) console.log("Search Init Failed.");
      console.log(result);
    });

    // qry will insert any movie titles that match with the entered in filters.
    const qry = `INSERT INTO Search_Results(Searched_Movie_Title) (SELECT Title FROM Movie WHERE Title=? OR Release_Date=?)`;

    conn.query(qry, [movieTitle, releaseDate], (err, result) => {
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

  conn.query(CREATE_USER_LOGGED_IN, (err, result) => {
    if (err) console.log(err);
    console.log("Log-In Set Up.");
  });

    try {
      const qry = `SELECT * FROM User_Logged_In`;
      conn.query(qry, (err, result) => {
        if (err) console.log(err);
        res.send(JSON.stringify(result));
      });
      //const userRatingQry = `SELECT * FROM Rating WHERE Users_Username = (SELECT Logged_In_Username FROM User_Logged_IN)`;
      //conn.query(userRatingQry, (err, conn) => {
      //  if (err) console.log(err);
      //  res.send(JSON.stringify(result));
      //});
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

    const qry1 = `INSERT INTO User_Logged_In(Logged_In_Username) (SELECT Username FROM DB_User WHERE Username=? AND User_Password=?)`;
    const qry2 = `UPDATE User_Logged_In
      SET Is_Moderator = (SELECT (A.Username = B.Mod_Username) FROM DB_User AS A, Moderator AS B WHERE A.Username=?)
      WHERE Logged_In_Username=?
    `;

    conn.query(qry1, [username, password], (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log("Account Info Entered.");
    });
    conn.query(qry2, [username, username], (err, result) => {
      if (err) console.log(err);
      console.log("Moderator Status Obtained.");
    });

    res.redirect('/account');
    res.end();
  });
});

router.post('/logout', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    conn.query(RESET_USER, (err, result) => {
      conn.release();
      if (err) console.log(err);
      console.log("Successfully logged out.");
    });

    res.redirect('/');
    res.end();
  });
});

module.exports = router;
