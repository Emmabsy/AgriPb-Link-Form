const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const moment = require("moment");
const session = require("express-session");
require("dotenv").config();
const pool = require("./config/db");
//const connection = require('./config/db.js');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
// Set EJS as the view engine
app.set("view engine", "ejs");
// Serve static files from the public directory
app.use(express.static("public"));

const port = process.env.PORT || 3004;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Set up session middleware
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000000000000 },
  })
);

//File uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  // Allowed file types
  const allowedFileTypes = [".jpg", ".jpeg", ".png", ".gif"];
  const ext = path.extname(file.originalname);
  if (!allowedFileTypes.includes(ext)) {
    return cb(
      new Error("Only image files (jpg, jpeg, png, gif) are allowed"),
      false
    );
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
///Login

// Define routes

// Login route - display login page
app.get("/", (req, res) => {
  res.render("login");
});

// Login route - check user credentials
// Handle the login form submission
app.post("/", (req, res) => {
  const { email, password, usertype } = req.body;

  // Check if the user exists in the database
  let query = "";
  if (usertype === "admin") {
    query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}' AND usertype = 'admin'`;
  } else {
    query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}' AND usertype = 'user'`;
  }

  pool.query(query, (err, result) => {
    if (err) throw err;

    // If the user exists, store their data in the session and redirect to the appropriate page
    if (result.length > 0) {
      const user = result[0];
      req.session.user = user;

      if (user.usertype === "admin") {
        res.redirect("/index");
      } else {
        res.redirect("/new");
      }
    } else {
      // If the user does not exist, show an error message
      res.render("login", { error: "Invalid email or password." });
    }
  });
});

// Index route - display all farmers (for admins only)
app.get("/index", (req, res) => {
  const user = req.session.user;

  if (user && user.usertype === "admin") {
    pool.query("SELECT * FROM res ORDER BY groupname", [], (err, results) => {
      if (err) throw err;

      res.render("index", { res: results });
    });
  } else {
    res.redirect("/");
  }
});

// New route - display new farmer form (for users only)
app.get("/new", (req, res) => {
  const user = req.session.user;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 20); // Set minimum date to 20 years ago

  if (user && user.usertype === "user") {
    res.render("new", { minDate: minDate.toISOString().slice(0, 10) });
  } else {
    res.redirect("/");
  }
});

// New route - display a form to add a new farmer
app.get("/res/new", (req, res) => {
  res.render("new");
});

// POST /
app.post("/submit", upload.single("photo"), (req, res) => {
  console.log(req.body); // log the entire request body
  const {
    groupname,
    firstname,
    middlename,
    lastname,
    dob,
    village,
    phone,
    maritalstatus,
    idnumber,
    occupation,
    incomesource,
    monthlyincome,
    children,
    under5,
    children6to11,
    children12to18,
    landstatus,
    landsize,
    cropgrown,
    marketaccess,
    wateraccess,
    lastcrop,
    animals,
    cropearnings,
    projectland,
    pumpkin,
    projecttime,
    geoloc,
    othermarketaccess,
    terms,
  } = req.body;

  // Server-side validation for file type
  const allowedFileTypes = [".jpg", ".jpeg", ".png", ".gif"];
  const ext = path.extname(req.file.originalname);
  if (!allowedFileTypes.includes(ext)) {
    return res
      .status(400)
      .send("Only image files (jpg, jpeg, png, gif) are allowed");
  }

  // Create a comma-separated string of the selected farm animals
  console.log(animals); // check if animals is defined in the request body
  let farmanimals = "";
  if (animals && Array.isArray(animals)) {
    farmanimals = animals.join(",");
  }

  // Calculate age based on date of birth using Moment.js
  const dobFormatted = moment(dob).format("YYYY-MM-DD");
  const age = moment().diff(dobFormatted, "years");

  // Insert the survey data into the database
  let under5Value = under5 || 0; // set under5 to 0 if it is null or undefined
  let children6to11Value = children6to11 || 0; // set children6to11 to 0 if it is null or undefined
  let children12to18Value = children12to18 || 0; // set children12to18 to 0 if it is null or undefined
  if (children === "no") {
    under5Value = 0;
    children6to11Value = 0;
    children12to18Value = 0;
  }
  // Check if "Others" is selected in the "market-access" field
  const marketAccess =
    marketaccess === "Others" ? othermarketaccess : marketaccess;
  // Convert the value of terms to an integer
  const termsAccepted = terms === "on" ? "Yes" : "No";
  // Get the county, sub-county, and location based on the selected group
  // GET /location?group=baari
  // Get county, sub-county, and location based on the selected group name
  let county, subcounty, location;
  if (groupname === "Baari") {
    county = "Nyandarua";
    subcounty = "Ndaragwa";
    location = "Baari";
  } else if (groupname === "Mairo-inya") {
    county = "Nyeri";
    subcounty = "Mathira";
    location = "Mairo-inya";
  }

  // Insert the survey data into the database
  pool.query(
    "INSERT INTO res (groupname,county,subcounty,location, firstname, middlename, lastname, dob, village, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop, animals, cropearnings, projectland, pumpkin, projecttime, geoloc, photo, terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)",
    [
      groupname,
      county,
      subcounty,
      location,
      firstname,
      middlename,
      lastname,
      dobFormatted,
      village,
      phone,
      age,
      maritalstatus,
      idnumber,
      occupation,
      incomesource,
      monthlyincome,
      children,
      under5Value,
      children6to11Value,
      children12to18Value,
      landstatus,
      landsize,
      cropgrown,
      marketAccess,
      wateraccess,
      lastcrop,
      farmanimals,
      cropearnings,
      projectland,
      pumpkin,
      projecttime,
      geoloc,
      req.file.filename,
      termsAccepted,
    ],
    (error, results, fields) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          // Handle MySQL error for duplicate entry
          return res
            .status(400)
            .send(
              "The Phone number or ID number you entered already exists in the database please go back an edit"
            );
        }
        console.error(error.message);
        return res.status(500).send("Internal server error");
      }
      res.redirect("/success");
    }
  );
});

// GET /edit/:id
app.get("/res/:id/edit", (req, res) => {
  const id = req.params.id;
  const user = req.session.user;

  if (user && user.usertype === "admin") {
    const id = req.params.id;

    pool.query("SELECT * FROM res WHERE id = ?", [id], (error, results) => {
      if (error) throw error;
      res.render("edit", {
        survey: "Edit Record",
        record: results[0],
        photo: results[0].photo,
      });
      //res.render('edit', { survey: results});
    });
    //
  } else {
    res.redirect("/");
  }
});

// POST /update/:id
app.put("/res/:id", (req, res) => {
  const id = req.params.id;
  const {
    groupname,
    county,
    subcounty,
    location,
    firstname,
    middlename,
    lastname,
    dob,
    village,
    phone,
    maritalstatus,
    idnumber,
    occupation,
    incomesource,
    monthlyincome,
    children,
    under5,
    children6to11,
    children12to18,
    landstatus,
    landsize,
    cropgrown,
    marketaccess,
    wateraccess,
    lastcrop,
    animals,
    cropearnings,
    projectland,
    pumpkin,
    projecttime,
    geoloc,
    othermarketaccess,
    currentPhoto,
    terms,
  } = req.body;

  // Calculate the age based on the new date of birth
  const dobParts = dob.split("-");
  const dobDate = new Date(dobParts[0], dobParts[1] - 1, dobParts[2]);
  const ageDiffMs = Date.now() - dobDate.getTime();
  const ageDate = new Date(ageDiffMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  // Create a comma-separated string of the selected farm animals
  console.log(animals); // check if animals is defined in the request body
  let farmanimals = "";
  if (animals && Array.isArray(animals)) {
    farmanimals = animals.join(",");
  }
  // Handle disabled fields
  let under5Value = under5 || 0; // set under5 to 0 if it is null or undefined
  let children6to11Value = children6to11 || 0; // set children6to11 to 0 if it is null or undefined
  let children12to18Value = children12to18 || 0; // set children12to18 to 0 if it is null or undefined
  if (children === "no") {
    under5Value = 0;
    children6to11Value = 0;
    children12to18Value = 0;
  }
  // Check if "Others" is selected in the "market-access" field
  const marketAccess =
    marketaccess === "Others" ? othermarketaccess : marketaccess;
  // Check if a new photo was uploaded
  const termsAccepted = terms === "on" ? "Yes" : "No";
  // Use the photo filename if no new photo is uploaded
  const photo = req.file ? req.file.filename : currentPhoto;
  // Update the record in the database table, including the new age
  //

  pool.query(
    "UPDATE res SET groupname = ?, county=?, subcounty=?,location=?,firstname = ?, middlename = ?, lastname = ?, dob = ?, village = ?, phone = ?, age = ?, maritalstatus = ?, idnumber = ?, occupation = ?, incomesource = ?, monthlyincome = ?, children = ?, under5 = ?, children6to11 = ?, children12to18 = ?, landstatus = ?, landsize = ?, cropgrown = ?, marketaccess = ?, wateraccess = ?, lastcrop = ?, animals=?, cropearnings = ? ,projectland=?, pumpkin=?, projecttime=?,geoloc=?, photo = ?, terms=? WHERE id = ?",
    [
      groupname,
      county,
      subcounty,
      location,
      firstname,
      middlename,
      lastname,
      dob,
      village,
      phone,
      age,
      maritalstatus,
      idnumber,
      occupation,
      incomesource,
      monthlyincome,
      children,
      under5Value,
      children6to11Value,
      children12to18Value,
      landstatus,
      landsize,
      cropgrown,
      marketAccess,
      wateraccess,
      lastcrop,
      farmanimals,
      cropearnings,
      projectland,
      pumpkin,
      projecttime,
      geoloc,
      photo,
      termsAccepted,
      id,
    ],
    (error, results, fields) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          // Handle MySQL error for duplicate entry
          return res
            .status(400)
            .send(
              "The Phone number or ID number you entered already exists in the database please go back an edit"
            );
        }
        console.error(error.message);
        return res.status(500).send("Internal server error");
      }
      res.redirect("/success");
    }
  );
});

// DELETE /delete/:id
app.delete("/res/:id", (req, res) => {
  const id = req.params.id;
  const user = req.session.user;

  if (user && user.usertype === "admin") {
    const id = req.params.id;

    // Delete the survey data from the database
    pool.query("DELETE FROM res WHERE id=?", [id], (error, results) => {
      if (error) throw error;
      res.redirect("/index");
    });
  } else {
    res.redirect("/");
  }
});


// GET /thank-you
app.get("/success", (req, res) => {
  res.render("success", { title: "Thank You" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
