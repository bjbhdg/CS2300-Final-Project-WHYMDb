#!/bin/bash

# This script was written in VSCode using the Git Bash terminal.

# Installations made to root.
npm install mysql;
npm link --force mysql;

# Relevant packages are installed in the backend folder.
cd backend;
  npm install;
  npm install mysql express webpack concurrently body-parser;

# Relevant packages are installed in the frontend folder.
cd ../frontend;
  npm install;

  # This command may not be necessary, so if it fails here, you should be good to go executing
  # 'npm run dev' in the backend folder.
  export NODE_OPTIONS=--openssl-legacy-provider;

# "npm run dev" will run both the server and the frontend concurrently (thanks to a script in package.json in the backend),
# if you 'CTRL + C' your terminal after running this script, then simply type 'npm run dev' in the backend folder
# to start the app back up again.
cd ../backend;
npm run dev;