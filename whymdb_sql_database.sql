-- Authors: Bryan Besselman, Zachary Lovelady, Jacob VanDoren
-- Class: CS 2300

-- This SQL script is intended to be run through MySQL in conjunction with the
-- "CS2300-Final-Project-WHYMDb" repository on GitHub.

-- Creates database
DROP DATABASE IF EXISTS WHYMDb;
CREATE DATABASE IF NOT EXISTS WHYMDb;
USE WHYMDb;

-- Connects the SQL connection instance with the database application in
-- "CS2300-Final-Project-WHYMDb".

-- Fill in with YOUR MySQL connection information.
-- "_user" = mysql user name
-- "_hostname" = mysql connection instance hostname
-- "_password" = your mysql user password.
ALTER USER "_user"@"_hostname" IDENTIFIED WITH mysql_native_password BY "_password";
FLUSH PRIVILEGES;

-- Creates each table for our database Schema.
CREATE TABLE Theater (
	Location VARCHAR(300) UNIQUE NOT NULL,
    Theater_Owner VARCHAR(100) NOT NULL,
    
    PRIMARY KEY(Location)
);

CREATE TABLE Theater_Operating_Hours (
	Theater_Location VARCHAR(300) NOT NULL,
    Day_Of_Operation VARCHAR(2) NOT NULL CHECK(
		Day_Of_Operation = "M"
        OR Day_Of_Operation = "Tu"
        OR Day_Of_Operation = "W"
        OR Day_Of_Operation = "Th"
        OR Day_Of_Operation = "F"
        OR Day_Of_Operation = "Sa"
        OR Day_Of_Operation = "Su"
	),
    Opening_Time TIME NOT NULL,
    Closing_Time TIME NOT NULL,
    
    FOREIGN KEY(Theater_Location) REFERENCES Theater(Location) ON DELETE CASCADE
);

CREATE TABLE Movie (
	Movie_ID INT NOT NULL AUTO_INCREMENT,
	Title VARCHAR(200) NOT NULL,
    Release_Date DATE NOT NULL,
    
    PRIMARY KEY(Movie_ID)
);

CREATE TABLE Movie_Genres (
	Movie_ID INT NOT NULL,
    Genre VARCHAR(50) NOT NULL,
    
    FOREIGN KEY(Movie_ID) REFERENCES Movie(Movie_ID) ON DELETE CASCADE
);

CREATE TABLE SHOWING_IN (
	Theater_Location VARCHAR(300) NOT NULL,
    Movie_ID INT NOT NULL,
    
    FOREIGN KEY(Theater_Location) REFERENCES Theater(Location) ON DELETE CASCADE,
    FOREIGN KEY(Movie_ID) REFERENCES Movie(Movie_ID) ON DELETE CASCADE
);

CREATE TABLE Film_Workers (
	Film_Worker_ID INT NOT NULL AUTO_INCREMENT,
    
    First_Name VARCHAR(25) NOT NULL,
    Last_Name VARCHAR(25) NOT NULL,
    
    PRIMARY KEY(Film_Worker_ID)
);

CREATE TABLE Actor_Actress (
	ID INT NOT NULL,
    
    FOREIGN KEY(ID) REFERENCES Film_Workers(Film_Worker_ID) ON DELETE CASCADE
);

CREATE TABLE Director (
	ID INT NOT NULL,
    
    FOREIGN KEY(ID) REFERENCES Film_Workers(Film_Worker_ID) ON DELETE CASCADE
);

CREATE TABLE WORKED_ON (
	Movie_ID INT NOT NULL,
    Film_Worker_ID INT NOT NULL,
    
    FOREIGN KEY(Movie_ID) REFERENCES Movie(Movie_ID) ON DELETE CASCADE,
    FOREIGN KEY(Film_Worker_ID) REFERENCES Film_Workers(Film_Worker_ID)
		ON DELETE CASCADE
);

CREATE TABLE Studio (
	Studio_Name VARCHAR(25) NOT NULL UNIQUE,
    
    PRIMARY KEY(Studio_Name)
);

CREATE TABLE PRODUCED_BY (
    Movie_ID INT NOT NULL,
    Studio_Name VARCHAR(25) NOT NULL,
    
    FOREIGN KEY(Movie_ID) REFERENCES Movie(Movie_ID),
    FOREIGN KEY(Studio_Name) REFERENCES Studio(Studio_Name)
);

CREATE TABLE DB_User (
	Username VARCHAR(20) NOT NULL UNIQUE,
    User_Password VARCHAR(25) NOT NULL CHECK(
		LENGTH(User_Password) >= 8 AND
        LENGTH(User_Password) <= 25
    ),
    
    PRIMARY KEY(Username)
);

CREATE TABLE Moderator (
	Mod_Username VARCHAR(20),
    
    FOREIGN KEY(Mod_Username) REFERENCES DB_User(Username) ON DELETE CASCADE
);

CREATE TABLE Rating (
	Movie_ID INT NOT NULL,
    Users_Username VARCHAR(25) NOT NULL,
    Score INT NOT NULL CHECK(Score >= 0 AND Score <= 10),
    Date_Last_Updated TIMESTAMP
		DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Title VARCHAR(50),
    Rating_Description VARCHAR(500),
    
    FOREIGN KEY(Movie_ID) REFERENCES Movie(Movie_ID) ON DELETE CASCADE,
    FOREIGN KEY(Users_Username) REFERENCES DB_User(Username) ON DELETE CASCADE
);

-- Sample data to be inserted into each table of the schema.
INSERT INTO Theater VALUES
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "B&B Theaters"),
("1101 E. 18th St., Rolla, MO 65401", "Regal Forum");


INSERT INTO Theater_Operating_Hours VALUES
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "M", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "Tu", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "W", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "Th", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "F", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "Sa", "10:30:00", "01:15:00"),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", "Su", "10:30:00", "01:15:00"),

("1101 E. 18th St., Rolla, MO 65401", "M", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "Tu", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "W", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "Th", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "F", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "Sa", "11:00:00", "23:30:00"),
("1101 E. 18th St., Rolla, MO 65401", "Su", "11:00:00", "23:30:00");

INSERT INTO Movie(title, release_date) VALUES
("The Bad Guys", "2022-04-22"),
("Sonic the Hedgehog 2", "2022-04-08"),
("Jurassic World Dominion", "2022-06-10"),
("Memory", "2022-04-29"),
("The Northman", "2022-04-22"),
("Doctor Strange in the Multiverse of Madness", "2022-05-06"),
("Everything Everywhere All at Once", "2022-03-25");

INSERT INTO Movie_Genres VALUES
(1, "Action"),
(1, "Comedy"),

(2, "Action"),
(2, "Adventure"),

(3, "Action"),
(3, "Adventure"),
(3, "Sci-Fi"),
(3, "Fantasy"),

(4, "Action"),
(4, "Adventure"),
(4, "Suspense"),
(4, "Thriller"),

(5, "Action"),
(5, "Adventure"),
(5, "Drama"),

(6, "Action"),
(6, "Adventure"),

(7, "Action"),
(7, "Adventure");

INSERT INTO SHOWING_IN VALUES
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 1),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 2),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 3),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 4),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 5),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 6),
("100 Wentzville Bluffs Dr, Wentzville, MO 63385", 7),

("1101 E. 18th St., Rolla, MO 65401", 1),
("1101 E. 18th St., Rolla, MO 65401", 2),
("1101 E. 18th St., Rolla, MO 65401", 3),
("1101 E. 18th St., Rolla, MO 65401", 4),
("1101 E. 18th St., Rolla, MO 65401", 5),
("1101 E. 18th St., Rolla, MO 65401", 6),
("1101 E. 18th St., Rolla, MO 65401", 7);

INSERT INTO Film_Workers(First_Name, Last_Name) VALUES
("Pierre", "Perifel"),
("Sam", "Rockwell"),
("Anthony", "Ramos"),
("Marc", "Maron"),

("Jeff", "Fowler"),
("James", "Marsden"),
("Jim", "Carrey"),
("Ben", "Schwartz"),

("Colin", "Trevorrow"),
("Chris", "Pratt"),
("Bryce", "Howard"),
("B.D.", "Wong"),

("Martin", "Campbell"),
("Liam", "Neeson"),
("Monica", "Bellucci"),
("Guy", "Pearce"),

("Robert", "Eggers"),
("Alexander", "Skarsgard"),
("Nicole", "Kidman"),
("Claes", "Bang"),

("Sam", "Raimi"),
("Benedict", "Cumberbatch"),
("Elizabeth", "Olsen"),
("Benedict", "Wong"),

("Daniel", "Kwan"),
("Daniel", "Scheinert"),
("Michelle", "Yeoh"),
("Stephanie", "Hsu");

INSERT INTO Actor_Actress VALUES
(2), (3), (4),
(6), (7), (8),
(10), (11), (12),
(14), (15), (16),
(18), (19), (20),
(22), (23), (24),
(26), (27), (28);

INSERT INTO Director VALUES
(1), (5), (9), (13), (17), (21), (25);

INSERT INTO Worked_On VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 5), (2, 6), (2, 7), (2, 8),
(3, 9), (3, 10), (3, 11), (3, 12),
(4, 13), (4, 14), (4, 15), (4, 16),
(5, 17), (5, 18), (5, 19), (5, 20),
(6, 21), (6, 22), (6, 23), (6, 24),
(7, 25), (7, 26), (7, 27), (7, 28);

INSERT INTO Studio VALUES
("Dreamworks"),
("Paramount Pictures"),
("Universal Studios"),
("Black Bear Pictures"),
("Regency Enterprises"),
("Walt Disney Studios"),
("AGBO");

INSERT INTO Produced_By VALUES
(1, "DreamWorks"),
(2, "Paramount Pictures"),
(3, "Universal Studios"),
(4, "Black Bear Pictures"),
(5, "Regency Enterprises"),
(6, "Walt Disney Studios"),
(7, "AGBO");

INSERT INTO DB_User VALUES
("The Man", "123456789"),
("A Man", "jdsfjo23j2"),
("Me", "jsdfwefqkmef2"),
("That One Guy", "kikikekekpw");

INSERT INTO Moderator VALUES ("The Man");

INSERT INTO Rating(Movie_ID,
	Users_Username, Score, Title, Rating_Description)
VALUES
(1, "The Man", 10, "Pretty Good", NULL),
(1, "A Man", 10, ":)", ":)"),
(1, "Me", 10, "Haven't Seen It", "no comment"),
(1, "That One Guy", 0, "Bad", "I'm that one guy!"),
(2, "The Man", 8, "SONIIICC YEAHH!!!", "WOOOOOOOOOOH"),
(3, "Me", 6, "Ehhh...", "Just not as good as the old ones!"),
(5, "Me", 7, "Not bad", "Worth the watch if you have nothing else to do"),
(2, "That One Guy", 9, "Watch It!", "So good!"),
(6, "That One Guy", 9, "Go see it", "Really Good"),
(4, "The Man", 8, "8", "Go see it"),
(7, "Me", 7, "OK", "Pretty Good"),
(5, "A Man", 10, "Watch it!", "So good!!"),
(7, "A Man", 4, "Don't go", "I fell asleep");