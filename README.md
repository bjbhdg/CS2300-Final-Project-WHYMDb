# CS2300-Final-Project-WHYMDb

# Installation Process:
## Step 1: Install MySQL
### Run `npm install mysql` in the root directory in a terminal, followed by `npm link --force mysql`.

## Step 2: Editing `backend`:
### Run `npm install`.
### Similar to Step 1, we will now run `npm install mysql` in the `backend` folder.
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