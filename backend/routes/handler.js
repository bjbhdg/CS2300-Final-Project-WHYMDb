const express = require('express');
const router = express.Router();
const pool = require('../config/db.js');

// Doesn't work, but should search the database for movies and return a movie matching
// the passed in parameters.
router.get('/movieSearch', async (req, res) => {
    const movieTitle = req.body.movieTitleInput;
    const releaseDate = req.body.movieReleaseDateInput;
    pool.getConnection( (err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * FROM Movie WHERE Title=? AND Release_Date=?';
            conn.query(qry, [movieTitle, releaseDate], (err, result) => {
                conn.release();
                if(err) throw err;
                res.send(JSON.stringify(result));
            });
        } catch (err) {
            console.log(err);
            res.end();
        };
   });
});

/*
router.post('/searchMovie', async (req, res) => {
    const movieTitle = req.body.movieTitleInput;
    const releaseDate = req.body.movieReleaseDateInput;
    pool.getConnection( (err, conn) => {
        if (err) throw err;



        const qry = 'SELECT * FROM Movie WHERE Title=? OR Release_Date=?';
        conn.query(qry, [movieTitle, releaseDate], (err, result) => {
            conn.release();
            if (err) throw err;
            console.log("Movie Searched!");
        });
        res.redirect('/searchMovie');
        res.end();
    })
});
*/

module.exports = router;
