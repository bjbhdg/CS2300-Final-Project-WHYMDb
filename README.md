# CS2300-Final-Project-WHYMDb

# Note:
## You will need to have `node.js` and `npm` installed on your device in order to install this application correctly.

# Installation Process:
## Step 1: Install MySQL
### Run `npm install mysql` in the root directory in a terminal, followed by `npm link --force mysql`.

## Step 2: Editing `backend`:
### Run `npm install`.
### Now, we will run `npm install mysql express webpack concurrently body-parser` in the `backend` folder to install all of the necessary files.
### Open the `whymdb_sql_database.sql` script in MySQL and perform the necessary edits. Then, run the script in the shell/workbench.
### In the `.env` file, fill in the empty `DB_` variables with your own MySQL Connection information on your device.
### 

## Step 3: Editing `frontend`:
### After `cd`ing into the `frontend` folder, run `npm install`.
### Then, while still in `frontend`, you would want to run `export NODE_OPTIONS=--openssl-legacy-provider`.


# Running the Application:
## Step 1: Starting the Server:
### After `cd`ing into the `backend` folder, run `npm run server` to start the server.
## Step 2: Running the Frontend:
### In a **new** terminal, `cd` into the `frontend` folder and run `npm start` to run the GUI.

# Notes Before Using the Bash Script.
## Before using the bash script, you ***MUST*** edit `whymdb_sql_database.sql` with ***YOUR*** information on your local MySQL instance, as well as running the SQL script in said instance, ***AND*** the `.env` file in the `backend` folder, or else the app will not start up correctly on running the script. Also, you can ***ONLY*** use the bash script when in the ***ROOT*** folder of the project. So do not move the script to a different folder/director.
