const { fileLoader } = require('ejs');
const mysql = require('mysql2');

const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  //development:process.env.NODE_ENV,


  
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database.');
});

module.exports = pool;



/*for the .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Peachblack
DB_DATABASE=survey
*/


/*

const mysql = require("mysql2");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database.");
});

const sessionStore = new MySQLStore(
  {
    expiration: 600000,
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  pool
);

module.exports = { pool, sessionStore };

*/
