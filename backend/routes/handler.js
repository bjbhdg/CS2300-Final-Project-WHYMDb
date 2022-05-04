const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');

// When on the 'search' page (URL: localhost:3000/search), the page will retrieve the matching movies that the
// "POST" function below added into the "Search_Results" table.
router.get('/search', async (req, res) => {
  // Establish connection to the MySQL database.
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    // Due to the nature of searching our database, some queries will have a large
    // amount of data to be transferred, so we must increase the max limit size
    // (specifically for retrieving theater information and user ratings for outputting).
    conn.query(`SET @@group_concat_max_len = 1048576`, (err, result) => {
      if (err) console.log(err);
      else console.log("Group Concat size limit increased.");
    });

    try {
      // Query the database for the movie titles of the searched movie results.
      const grabSearchResults = `
      SELECT Res.Search_ID, M.Movie_ID, M.Title, M.Release_Date,
        group_concat(DISTINCT G.Genre SEPARATOR ', ') AS Genres,
        group_concat(DISTINCT P.Studio_Name SEPARATOR ', ') AS Studios,
        group_concat(DISTINCT A.Actors SEPARATOR ', ') AS Actors,
        group_concat(DISTINCT D.Directors SEPARATOR ', ') AS Directors,
        group_concat(DISTINCT R.Rating SEPARATOR ' | ') AS Ratings,
        group_concat(DISTINCT T.Theater_Times SEPARATOR ' ||| ') AS Theaters
        
      FROM (SELECT W.Movie_ID, CONCAT(First_Name, ' ', Last_Name) AS Actors
            FROM Film_Workers AS F, Actor_Actress, Movie AS M, WORKED_ON AS W
            WHERE F.Film_Worker_ID = ID AND M.Movie_ID = W.Movie_ID AND W.Film_Worker_ID = ID
            ORDER BY W.Movie_ID ASC) AS A,
         
           (SELECT W.Movie_ID, CONCAT(First_Name, ' ', Last_Name) AS Directors
            FROM Film_Workers AS F, Director, Movie AS M, WORKED_ON AS W
            WHERE F.Film_Worker_ID = ID AND M.Movie_ID = W.Movie_ID AND W.Film_Worker_ID = ID
            ORDER BY W.Movie_ID ASC) AS D,
         
           (SELECT R2.Movie_ID,
            CONCAT(R2.Users_Username, ', ', R2.Score, ', ', R2.Date_Last_Updated, ', ',
            COALESCE(R2.Title, "[No Title Provided]"), ', ',
            COALESCE(R2.Rating_Description, "[No Description Provided]")) AS Rating
            FROM Rating AS R2, Movie AS M2
            WHERE R2.Movie_ID = M2.Movie_ID) AS R,
         
           (SELECT Location, Theater_Owner, GROUP_CONCAT(
           (CONCAT(O.Theater_Location, ' | ', Theater_Owner, ' | ', O.Day_Of_Operation, ' | ',
            O.Opening_Time, ' | ', O.Closing_Time)) SEPARATOR ' || ') AS Theater_Times
            FROM Theater, Theater_Operating_Hours AS O
            WHERE Location = O.Theater_Location GROUP BY Location) AS T,
         
            Search_Results AS Res, Movie AS M, Movie_Genres AS G,
            WORKED_ON AS W, SHOWING_IN AS S, PRODUCED_BY AS P
         
      WHERE Searched_Movie_Title = M.Title AND M.Movie_ID = G.Movie_ID
            AND M.Movie_ID = W.Movie_ID AND M.Movie_ID = R.Movie_ID AND
            T.Location = S.Theater_Location AND M.Movie_ID = S.Movie_ID
            AND M.Movie_ID = P.Movie_ID AND
            (A.Movie_ID = M.Movie_ID) AND (D.Movie_ID = M.Movie_ID)
        
      GROUP BY M.Movie_ID
      ORDER BY Res.Search_ID ASC`;

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
          dFirstName, dLastName, stuName, theatLoc, minRate, maxRate, [genres]], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log('Search Processed Successfully!!!');
    });

    // After this route is over, redirect the user to the "/search" page to view their search's results.
    res.redirect('/search');
    res.end();
  });
});

// This processes the user information entered when adding a rating via the '/search' page.
router.post('/addMovieRating', async (req, res) => {
  const movieID = req.body.theMovieID;
  const username = req.body.myUsername;
  const score = req.body.myRating;
  const title = req.body.myTitle;
  const descript = req.body.myDescription;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const userRatingInsertQry = `INSERT INTO
      Rating(Movie_ID, Users_Username, Score, Title, Rating_Description) 
      VALUES(?, ?, ?, ?, ?)`;

    conn.query(userRatingInsertQry, [movieID, username, score, title, descript], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log("User rating successfully added.");
    });
  });

  res.redirect('/search');
  res.end();
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
      FOREIGN KEY(Logged_In_Username) REFERENCES DB_User(Username) ON DELETE CASCADE ON UPDATE CASCADE
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

// ================================================
// ====== GET RELATION CONTENTS CONNECTIONS =======
// ================================================

// Below is an array of 'get' functions that will retrieve the data currently inside each relation.
// Only moderators will be able to see these get accessed.
router.get('/getTheaterRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {
      const getTheaterRows = `
        SELECT T.Location, T.Theater_Owner, O.Day_Of_Operation, O.Opening_Time, O.Closing_Time
        FROM Theater AS T
        LEFT OUTER JOIN Theater_Operating_Hours AS O
          ON T.Location = O.Theater_Location
        `;

        conn.query(getTheaterRows, (err, result) => {
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

router.get('/getMovieRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {
      const getMovieRows = `SELECT M.Movie_ID, M.Title, M.Release_Date, GROUP_CONCAT(DISTINCT G.Genre SEPARATOR ', ') AS Genre
        FROM Movie AS M LEFT OUTER JOIN Movie_Genres AS G ON M.Movie_ID = G.Movie_ID GROUP BY M.Movie_ID`;
      conn.query(getMovieRows, (err, result) => {
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

router.get('/getSHOWING_INRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {
      const getShowingInRows = `SELECT M.Movie_ID, M.Title, S.Theater_Location
        FROM SHOWING_IN AS S INNER JOIN Movie AS M, Theater AS T
        WHERE M.Movie_ID = S.Movie_ID AND T.Location = S.Theater_Location
        ORDER BY M.Movie_ID ASC`;

      conn.query(getShowingInRows, (err, result) => {
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

router.get('/getFilm_WorkersRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {

      const getFilmWorkerRows = `
      SELECT Film_Worker_ID, First_Name, Last_Name,
        (Film_Worker_ID = A.ID) AS Is_Actor, (0) AS Is_Director
      FROM Film_Workers, Actor_Actress AS A
      WHERE Film_Worker_ID = A.ID
      UNION ALL
        (SELECT Film_Worker_ID, First_Name, Last_Name,
          (0) AS Is_Actor, (Film_Worker_ID = D.ID) AS Is_Director
        FROM Film_Workers, Director AS D
        WHERE Film_Worker_ID = D.ID)
      ORDER BY Film_Worker_ID ASC`;

      conn.query(getFilmWorkerRows, (err, result) => {
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

router.get('/getWORKED_ONRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    try {

      const getWorkedOnRows = `SELECT W.Film_Worker_ID, F.First_Name, F.Last_Name, W.Movie_ID, M.Title
        FROM WORKED_ON AS W, Film_Workers AS F, Movie AS M
        WHERE W.Film_Worker_ID = F.Film_Worker_ID AND W.Movie_ID = M.Movie_ID
        ORDER BY W.Movie_ID ASC, W.Film_Worker_ID ASC`;

      conn.query(getWorkedOnRows, (err, result) => {
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

router.get('/getStudioRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
      const getStudioRows = `SELECT Studio_Name FROM Studio`

      conn.query(getStudioRows, (err, result) => {
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

router.get('/getPRODUCED_BYRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
      const getProducedByRows = `SELECT M.Movie_ID, M.Title, Studio_Name
        FROM PRODUCED_BY AS P, Movie AS M WHERE P.Movie_ID = M.Movie_ID
        ORDER BY M.Movie_ID ASC`;

        conn.query(getProducedByRows, (err, result) => {
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

router.get('/getDB_UserRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
      const getUserRows = `SELECT Username, User_Password, IFNULL((Username = Mod_Username), 0) AS Is_Moderator
        FROM DB_User LEFT OUTER JOIN Moderator ON Username = Mod_Username`;

      conn.query(getUserRows, (err, result) => {
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

router.get('/getRatingRows', async (req, res) => {
  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    try {
      const getRatingRows = `SELECT R.Movie_ID, M.Title AS Movie_Title, R.Users_Username,
        R.Score, R.Date_Last_Updated, R.Title, R.Rating_Description
      FROM Rating AS R, Movie AS M
      WHERE R.Movie_ID = M.Movie_ID
      ORDER BY R.Movie_ID ASC, R.Users_Username ASC`;

      conn.query(getRatingRows, (err, result) => {
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
// ================================================

// ================================================
// ============   EDIT CONNECTIONS   ==============
// ================================================

// This is the DEFAULT route that the edit function will be sent to. It does not actually do anything, it
// is simply a placeholder to be replaced by the plethora of other connections below.
router.post('/editDatabaseDefault', async (req, res) => {
  console.log("Nothing was changed, make sure to fill out all fields.", req.body);
  res.redirect('/editDatabase');
  res.end();
});

// ================================
// ======== THEATER EDITS =========
// ================================
router.post('/updateTheater', async (req, res) => {
  const theatLoc = (req.body.theaterLocation !== "" ? req.body.theaterLocation : req.body.preExistTheater);
  const existingTheater = req.body.preExistTheater;
  const newOwner = req.body.newOwner;
  const day = req.body.dayOfWeek;
  const openTime = req.body.openingTime;
  const closeTime = req.body.closingTime;

  pool.getConnection( (err, conn) => {
    if (req.body.opHourEditEnable === "on") {
      

      const theatOpHourEditQuery = `UPDATE Theater_Operating_Hours SET Opening_Time=?, Closing_Time=?
        WHERE Theater_Location=? AND Day_Of_Operation=?`;

      conn.query(theatOpHourEditQuery, [openTime, closeTime, existingTheater, day], (err, res) => {
        conn.release();
        if (err) console.log(err)
        else console.log(`Operating Hours for ${existingTheater} on ${day} has been updated.`)
      });
    } else {
      const editTheatInfo = `UPDATE Theater SET Location=?, Theater_Owner=? WHERE Location=?`;

      conn.query(editTheatInfo, [theatLoc, newOwner, existingTheater], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Theater Info for ${existingTheater} successfully updated.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteTheater', async (req, res) => {
  const theatLoc = req.body.theaterLocation;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const deleteTheatQry = `DELETE FROM Theater WHERE Location=?`;

    conn.query(deleteTheatQry, [theatLoc], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Theater at ${theatLoc} successfully removed from the database.`)
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertTheater', async (req, res) => {
  const newTheat = req.body.theaterLocation;
  const owner = req.body.theaterOwner;

  const preExistTheat = req.body.preExistingTheater;
  const day = req.body.dayOfWeek;
  const openTime = req.body.openingTime;
  const closeTime = req.body.closingTime;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(req.body.opHourInsertEnable === "on") {
      insertOpTimeQry = `INSERT INTO Theater_Operating_Hours VALUES(?, ?, ?, ?)`;

      conn.query(insertOpTimeQry, [preExistTheat, day, openTime, closeTime], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Operating Hours for ${preExistTheat} on ${day} has been added.`);
      });
    } else {
      insertTheatQry = `INSERT INTO Theater VALUES(?, ?)`

      conn.query(insertTheatQry, [newTheat, owner], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Theater at ${newTheat} successfully added to the database.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});
// ================================

// ================================
// ========= MOVIE EDITS ==========
// ================================
router.post('/updateMovie', async (req, res) => {
  const currMovieID = req.body.preExistID;
  const newTitle = req.body.newTitle;
  const newReleaseDate = req.body.newDate;
  const genres = (req.body.genres === "" ? "" : req.body.genres.split(', '));

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if (newTitle !== "" && newReleaseDate !== "") {
      const updateQuery = `UPDATE Movie SET Title=?, Release_Date=? WHERE Movie_ID=?`;
      conn.query(updateQuery, [newTitle, newReleaseDate, currMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Movie ID #${currMovieID} Title and Release Data updated.`);
      });
    }
    else if (newTitle !== "" && newReleaseDate === "") {
      const updateQuery = `UPDATE Movie SET Title=? WHERE Movie_ID=?`;
      conn.query(updateQuery, [newTitle, currMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Movie ID #${currMovieID}'s title updated.`);
      });
    }
    else if (newTitle === "" && newReleaseDate !== "") {
      const updateQuery = `UPDATE Movie SET Release_Date=? WHERE Movie_ID=?`;
      conn.query(updateQuery, [newReleaseDate, currMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Movie ID #${currMovieID}'s release date updated.`);
      });
    }

    if(genres !== "" && genres.length === 2) {
      const updateGenres = `UPDATE Movie_Genres SET Genre=? WHERE Movie_ID=? AND Genre=?`
      conn.query(updateGenres, [genres[1], currMovieID, genres[0]], (err, result) => {
        if (err) console.log(err);
        else console.log(`${genres[0]} updated to ${genres[1]} for Movie ID #${currMovieID}`);
      });
    }

    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteMovie', async (req, res) => {
  const movieIDToDelete = req.body.movieIDToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const deleteQuery = `DELETE FROM Movie WHERE Movie_ID = ?`;

    conn.query(deleteQuery, [movieIDToDelete], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Movie ID #${movieIDToDelete} successfully deleted.`);
    });
  });
  
  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertMovie', async (req, res) => {
  const movieTitleToAdd = req.body.titleToAdd;
  const releaseDate = req.body.releaseDate;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if (req.body.genreInsertEnable === "on" && req.body.genres !== "") {
      const preExistMovieID = req.body.preExistingMovieID;
      const genres = req.body.genres.split(', ');

      const genreInsertQry = `INSERT INTO Movie_Genres VALUES(?, ?)`;
      genres.forEach((genre) => {
        conn.query(genreInsertQry, [preExistMovieID, genre], (err, result) => {
          if (err) console.log(err);
          else console.log(`Genre ${genre} added for Movie ID #${preExistMovieID}.`);
        });
      });
    } else {
      const movieInsertQry = `INSERT INTO Movie(Title, Release_Date) VALUES (?, ?)`;
      conn.query(movieInsertQry, [movieTitleToAdd, releaseDate], (err, result) => {
        if (err) console.log(err);
        else console.log(`${movieTitleToAdd} successfully added as a movie.`);
      });
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ====== SHOWING IN EDITS =======
// ===============================
router.post('/updateSHOWING_IN', async (req, res) => {
  const originalMovie = req.body.origMovieID;
  const originalTheatLoc = req.body.origTheaterLocation;
  const newMovie = req.body.newMovieID;
  const newTheatLoc = req.body.newTheaterLocation;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const updateQry = `UPDATE SHOWING_IN SET Movie_ID=?, Theater_Location=? WHERE Movie_ID=? AND Theater_Location=?`;

    if (newMovie !== "" && newTheatLoc !== "") {
      conn.query(updateQry, [newMovie, newTheatLoc, originalMovie, originalTheatLoc], (err, result) => {
        if (err) console.log(err);
        else console.log(`Showing In For Movie ID #${originalMovie} at ${originalTheatLoc} successfully updated.`);
      });
    } else if (newMovie !== "" && newTheatLoc === "") {
      conn.query(updateQry, [newMovie, originalTheatLoc, originalMovie, originalTheatLoc], (err, result) => {
        if (err) console.log(err);
        else console.log(`Showing In For Movie ID #${originalMovie} at ${originalTheatLoc} successfully updated.`);
      });
    } else if (newMovie === "" && newTheatLoc !== "") {
      conn.query(updateQry, [originalMovie, newTheatLoc, originalMovie, originalTheatLoc], (err, result) => {
        if (err) console.log(err);
        else console.log(`Showing In For Movie ID #${originalMovie} at ${originalTheatLoc} successfully updated.`);
      })
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteSHOWING_IN', async (req, res) => {
  const movieToDelete = req.body.movieIDToDelete;
  const theatToDelete = req.body.theaterToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const deleteQry = `DELETE FROM SHOWING_IN WHERE Movie_ID=? AND Theater_Location=?`
    conn.query(deleteQry, [movieToDelete, theatToDelete], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Movie ID #${movieToDelete} showing in ${theatToDelete} has been successfully deleted.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertSHOWING_IN', async (req, res) => {
  const movieToAdd = req.body.movieToAdd;
  const theatToAdd = req.body.theaterToAdd;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const insertQry = `INSERT INTO SHOWING_IN VALUES(?, ?)`;
    conn.query(insertQry, [theatToAdd, movieToAdd], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`New Showing added for Movie ID #${movieToAdd} at ${theatToAdd}.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ===== ACTOR/ACTRESS EDITS =====
// ===============================
router.post('/updateActor_Actress', async (req, res) => {
  const idToUpdate = req.body.filmWorkerID;
  const updateToActorActress = req.body.specifyFWType;
  const newFName = req.body.newFirstName;
  const newLName = req.body.newLastName;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(updateToActorActress === "on") {
      const updateActTypeQry = `INSERT INTO Actor_Actress VALUES(?)`

      conn.query(updateActTypeQry, [idToUpdate], (err, result) => {
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToUpdate} is now an Actor/Actress.`);
      });
    }

    if(newFName !== "" && newLName !== "") {
      const updateActQry = `UPDATE Film_Workers SET First_Name=?, Last_Name=? WHERE Film_Worker_ID=?`;

      conn.query(updateActQry, [newFName, newLName, idToUpdate], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToUpdate} has been updated.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteActor_Actress', async (req, res) => {
  console.log(req.body);
  const idToRemove = req.body.filmWorkerID;
  const removeFromActorActressSpecifically = req.body.specifyFWType;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(removeFromActorActressSpecifically === "on") {
      conn.query(`DELETE FROM Actor_Actress WHERE ID=${idToRemove}`, (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToRemove} is no longer an Actor/Actress.`);
      });
    } else {
      conn.query(`DELETE FROM Film_Workers WHERE Film_Worker_ID=${idToRemove}`, (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToRemove} is removed from the database.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertActor_Actress', async (req, res) => {
  const actorToAddFName = req.body.firstName;
  const actorToAddLName = req.body.lastName;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const actorInsertQuery = `INSERT INTO Film_Workers(First_Name, Last_Name) VALUES(?, ?)`;

    conn.query(actorInsertQuery, [actorToAddFName, actorToAddLName], (err, result) => {
      if (err) console.log(err);
      else console.log("Actor/Actress Inserted!");
    });

    // Due to the "auto_increment" property of Film_Worker_ID, any newly inserted tuple into the table will
    // always have the largest key value of any other keys.
    const quickUpdate = `INSERT INTO Actor_Actress SELECT MAX(Film_Worker_ID) FROM Film_Workers`;
    conn.query(quickUpdate, (err, result) => {
      if (err) console.log(err);
      else console.log("Actor/Actress Insertion Fully Completed!");
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ======== DIRECTOR EDITS =======
// ===============================
router.post('/updateDirector', async (req, res) => {
  const idToUpdate = req.body.filmWorkerID;
  const updateToDirector = req.body.specifyFWType;
  const newFName = req.body.newFirstName;
  const newLName = req.body.newLastName;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(updateToDirector === "on") {
      const updateDirTypeQry = `INSERT INTO Director VALUES(?)`;

      conn.query(updateDirTypeQry, [idToUpdate], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToUpdate} is now a Director.`);
      });
    }

    if(newFName !== "" && newLName !== "") {
      const updateDirQry = `UPDATE Film_Workers SET First_Name=?, Last_Name=? WHERE Film_Worker_ID=?`;

      conn.query(updateDirQry, [newFName, newLName, idToUpdate], (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToUpdate} has been updated.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteDirector', async (req, res) => {
  console.log(req.body);
  const idToRemove = req.body.filmWorkerID;
  const removeFromDirectorSpecifically = req.body.specifyFWType;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(removeFromDirectorSpecifically === "on") {
      conn.query(`DELETE FROM Director WHERE ID=${idToRemove}`, (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToRemove} is no longer a Director.`);
      });
    } else {
      conn.query(`DELETE FROM Film_Workers WHERE Film_Worker_ID=${idToRemove}`, (err, result) => {
        conn.release();
        if (err) console.log(err);
        else console.log(`Film Worker ID #${idToRemove} is removed from the database.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertDirector', async (req, res) => {
  const directorToAddFName = req.body.firstName;
  const directorToAddLName = req.body.lastName;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const actorInsertQuery = `INSERT INTO Film_Workers(First_Name, Last_Name) VALUES(?, ?)`;

    conn.query(actorInsertQuery, [directorToAddFName, directorToAddLName], (err, result) => {
      if (err) console.log(err);
      else console.log("Director Inserted!");
    });

    // Due to the "auto_increment" property of Film_Worker_ID, any newly inserted tuple into the table will
    // always have the largest key value of any other keys.
    const quickUpdate = `INSERT INTO Director SELECT MAX(Film_Worker_ID) FROM Film_Workers`;
    conn.query(quickUpdate, (err, result) => {
      if (err) console.log(err);
      else console.log("Director Insertion Fully Completed!");
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ======== WORKED_ON EDITS ======
// ===============================
router.post('/updateWORKED_ON', async (req, res) => {
  const originalMovie = req.body.origMovieID;
  const originalFilmWorker = req.body.origFWorker;
  const newMovie = req.body.newMovieID;
  const newFilmWorker = req.body.newFWorker;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const updateQry = `UPDATE WORKED_ON SET Movie_ID=?, Film_Worker_ID=? WHERE Movie_ID=? AND Film_Worker_ID=?`;

    if (newMovie !== "" && newFilmWorker !== "") {
      conn.query(updateQry, [newMovie, newFilmWorker, originalMovie, originalFilmWorker], (err, result) => {
        if (err) console.log(err);
        else console.log(`Worked On For Movie ID #${originalMovie} with ${originalFilmWorker} successfully updated.`);
      });
    } else if (newMovie !== "" && newFilmWorker === "") {
      conn.query(updateQry, [newMovie, originalFilmWorker, originalMovie, originalFilmWorker], (err, result) => {
        if (err) console.log(err);
        else console.log(`Worked On For Movie ID #${originalMovie} with ${originalFilmWorker} successfully updated.`);
      });
    } else if (newMovie === "" && newFilmWorker !== "") {
      conn.query(updateQry, [originalMovie, newFilmWorker, originalMovie, originalFilmWorker], (err, result) => {
        if (err) console.log(err);
        else console.log(`Worked On For Movie ID #${originalMovie} with ${originalFilmWorker} successfully updated.`);
      })
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteWORKED_ON', async (req, res) => {
  const movieToDelete = req.body.movieIDToDelete;
  const filmWorkerToDelete = req.body.fWToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const deleteQry = `DELETE FROM WORKED_ON WHERE Movie_ID=? AND Film_Worker_ID=?`
    conn.query(deleteQry, [movieToDelete, filmWorkerToDelete], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Movie ID #${movieToDelete} worked on by ${filmWorkerToDelete} has been successfully deleted.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertWORKED_ON', async (req, res) => {
  const movieToAdd = req.body.movieToAdd;
  const filmWorkerToAdd = req.body.fWToAdd;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const insertQry = `INSERT INTO WORKED_ON VALUES(?, ?)`;
    conn.query(insertQry, [movieToAdd, filmWorkerToAdd], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Film worker #${filmWorkerToAdd} has worked on Movie ID #${movieToAdd}.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ========= STUDIO EDITS ========
// ===============================
router.post('/updateStudio', async (req, res) => {
  const origStudio = req.body.origStudio;
  const newStudio = req.body.newStudio;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const updateStudioQry = `UPDATE Studio SET Studio_Name=? WHERE Studio_Name=?`;

    conn.query(updateStudioQry, [newStudio, origStudio], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Studio ${origStudio} has been updated to ${newStudio}.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteStudio', async (req, res) => {
  const studioToRemove = req.body.studioToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const deleteStudioQry = `DELETE FROM Studio Where Studio_Name=?`;

    conn.query(deleteStudioQry, [studioToRemove], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Studio ${studioToRemove} has been removed successfully.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertStudio', async (req, res) => {
  const studioToAdd = req.body.studioToAdd;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const studioInsertQry = `INSERT INTO Studio VALUES(?)`;

    conn.query(studioInsertQry, [studioToAdd], (err, result) => {
      if (err) console.log(err);
      else console.log(`Studio ${studioToAdd} has been successfully added.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ====== PRODUCED_BY EDITS ======
// ===============================
router.post('/updatePRODUCED_BY', async (req, res) => {
  const originalStudio = req.body.origStudio
  const originalMovie = req.body.origMovie;
  const newStudio = req.body.newStudio;
  const newMovie = req.body.newMovie;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const updateQry = `UPDATE PRODUCED_BY SET Studio_Name=?, Movie_ID=? WHERE Studio_Name=? AND Movie_ID=?`;

    if (newStudio !== "" && newMovie !== "") {
      conn.query(updateQry, [newStudio, newMovie, originalStudio, originalMovie], (err, result) => {
        if (err) console.log(err);
        else console.log(`Produced By For Movie ID #${originalMovie} with ${originalStudio} successfully updated.`);
      });
    } else if (newStudio !== "" && newMovie === "") {
      conn.query(updateQry, [newStudio, originalMovie, originalStudio, originalMovie], (err, result) => {
        if (err) console.log(err);
        else console.log(`Produced By For Movie ID #${originalMovie} with ${originalStudio} successfully updated.`);
      });
    } else if (newStudio === "" && newMovie !== "") {
      conn.query(updateQry, [originalStudio, newMovie, originalStudio, originalMovie], (err, result) => {
        if (err) console.log(err);
        else console.log(`Produced By For Movie ID #${originalMovie} with ${originalStudio} successfully updated.`);
      })
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deletePRODUCED_BY', async (req, res) => {
  const studioToDelete = req.body.studioToDelete;
  const movieToDelete = req.body.movieToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const deleteQry = `DELETE FROM PRODUCED_BY WHERE Studio_Name=? AND Movie_ID=?`
    conn.query(deleteQry, [studioToDelete, movieToDelete], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Movie ID #${movieToDelete} produced by ${studioToDelete} has been successfully deleted.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertPRODUCED_BY', async (req, res) => {
  const studioToAdd = req.body.studioToAdd;
  const movieToAdd = req.body.movieToAdd;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const insertQry = `INSERT INTO PRODUCED_BY VALUES(?, ?)`;
    conn.query(insertQry, [movieToAdd, studioToAdd], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Movie ID #${movieToAdd} was produced by studio ${studioToAdd}.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ========== USER EDITS =========
// ===============================
router.post('/updateDB_User', async (req, res) => {
  const origUsername = req.body.origUsername;
  const newUsername = req.body.newUsername;
  const newPass = req.body.newPassword;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if (newUsername !== "" && newPass !== "") {
      const updateUserQry = `UPDATE DB_User SET Username=?, User_Password=? WHERE Username=?`;
      conn.query(updateUserQry, [newUsername, newPass, origUsername], (err, result) => {
        if (err) console.log(err);
        else console.log(`Username ${origUsername} reset to ${newUsername} with different password.`);
      });
    } else if (newUsername !== "" && newPass === "") {
      const updateUserQry = `UPDATE DB_User SET Username=? WHERE Username=?`;
      conn.query(updateUserQry, [newUsername, origUsername], (err, result) => {
        if (err) console.log(err);
        else console.log(`Username ${origUsername} has been updated to ${newUsername}`);
      });
    } else if (newUsername === "" && newPass !== "") {
      const updateUserQry = `UPDATE DB_User SET User_Password=? WHERE Username=?`;
      conn.query(updateUserQry, [newPass, origUsername], (err, result) => {
        if (err) console.log(err);
        else console.log(`${origUsername} had their password reset.`);
      });
    }    

    if (req.body.makeMod === "on") {
      const updateModQry = `INSERT INTO Moderator VALUES (?)`;
      if (newUsername !== "") {
        conn.query(updateModQry, [newUsername], (err, result) => {
          if (err) console.log(err);
          else console.log(`${origUsername} updated to ${newUsername} is now a moderator.`);
        });
      } else {
        conn.query(updateModQry, [origUsername], (err, result) => {
          if (err) console.log(err);
          else console.log(`${origUsername} is now a moderator.`);
        });
      }
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteDB_User', async (req, res) => {
  const userToRemove = req.body.usernameToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if(req.body.deleteMod === "on") {
      const deleteModQry = `DELETE FROM Moderator WHERE Mod_Username=?`
      conn.query(deleteModQry, [userToRemove], (err, result) => {
        if (err) console.log(err);
        else console.log(`${userToRemove} has had their mod privileges successfully taken away.`);
      });
    } else {
      const deleteUserQry = `DELETE FROM DB_User Where Username=?`;
      conn.query(deleteUserQry, [userToRemove], (err, result) => {
        if (err) console.log(err);
        else console.log(`User ${userToRemove} has been removed successfully.`);
      });
    }
    conn.release();    
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertDB_User', async (req, res) => {
  const userToAdd = req.body.usernameToAdd;
  const passToAdd = req.body.passwordToAdd;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const userInsertQry = `INSERT INTO DB_User VALUES(?, ?)`;

    conn.query(userInsertQry, [userToAdd, passToAdd], (err, result) => {
      if (err) console.log(err);
      else console.log(`User ${userToAdd} has been successfully added.`);
    });

    if (req.body.makeMod === "on") {
      const makeModeQry = `INSERT INTO Moderator VALUES (?)`;
      conn.query(makeModeQry, [userToAdd], (err, result) => {
        if (err) console.log(err);
        else console.log(`${userToAdd} has successfully been made into a moderator.`);
      });
    }
  });

  res.redirect('/editDatabase');
  res.end();
});
// ===============================

// ===============================
// ======== RATING EDITS =========
// ===============================
router.post('/updateRating', async (req, res) => {
  const origUsername = req.body.origUser;
  const origMovieID = req.body.origMovie;

  const updatedUsername = req.body.updatedUser;
  const updatedMovieID = req.body.updatedMovie;

  const updatedScore = req.body.updatedScore;
  const updatedTitle = req.body.updatedTitle;
  const updatedDesc = req.body.updatedDescription;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    if (req.body.updateRatingContent === "on") {
      const ratingContentUpdateQry = `UPDATE Rating SET Score=?, Title=?, Rating_Description=? WHERE Users_Username=? AND Movie_ID=?`;
      conn.query(ratingContentUpdateQry, [updatedScore, updatedTitle, updatedDesc, origUsername, origMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Rating contents from user ${origUsername} for Movie ID #${origMovieID} has been updated.`);
      });
    }

    const updateRatingQry = `UPDATE Rating SET Users_Username=?, Movie_ID=? WHERE Users_Username=? AND Movie_ID=?`;

    if (updatedUsername !== "" && updatedMovieID !== "") {
      conn.query(updateRatingQry, [updatedUsername, updatedMovieID, origUsername, origMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Rating written by ${origUsername} for Movie ID #${origMovieID} is now written 
          by ${updatedUsername} for Movie ID #${updatedMovieID}.`);
      });
    } else if (updatedUsername !== "" && updatedMovieID === "") {
      conn.query(updateRatingQry, [updatedUsername, origMovieID, origUsername, origMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Rating for Movie ID #${origMovieID} is now written by ${updatedUsername}.`);
      });
    } else if (updatedUsername === "" && updatedMovieID !== "") {
      conn.query(updateRatingQry, [origUsername, updatedMovieID, origUsername, origMovieID], (err, result) => {
        if (err) console.log(err);
        else console.log(`Rating written by ${origUsername} for Movie ID #${origMovieID} is 
          now written for Movie ID#${updatedMovieID}.`);
      });
    }
    conn.release();
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/deleteRating', async (req, res) => {
  const usernameToDelete = req.body.authorToDelete;
  const movieToDelete = req.body.ratedMovieToDelete;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);

    const deleteRatingQry = `DELETE FROM Rating WHERE Users_Username=? AND Movie_ID=?`;

    conn.query(deleteRatingQry, [usernameToDelete, movieToDelete], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Rating written by ${usernameToDelete} for Movie ID #${movieToDelete} has been removed.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});

router.post('/insertRating', async (req, res) => {
  const userToAdd = req.body.authorToAdd;
  const movieToRate = req.body.movieToRate;
  const ratingScore = req.body.score;
  const ratingTitle = req.body.title;
  const ratingDesc = req.body.description;

  pool.getConnection( (err, conn) => {
    if (err) console.log(err);
    const insertRatingQry = `INSERT INTO Rating(Movie_ID, Users_Username, Score, Title, Rating_Description) VALUES (?, ?, ?, ?, ?)`;
    conn.query(insertRatingQry, [movieToRate, userToAdd, ratingScore, ratingTitle, ratingDesc], (err, result) => {
      conn.release();
      if (err) console.log(err);
      else console.log(`Rating for Movie ID #${movieToRate} written by ${userToAdd} has been added.`);
    });
  });

  res.redirect('/editDatabase');
  res.end();
});
// ==============================

module.exports = router;
