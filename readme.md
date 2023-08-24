const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const moment = require('moment');

require('dotenv').config();
const pool = require('./config/db');

//const connection = require('./config/db.js');

const app = express();
const methodOverride = require('method-override');

app.use(methodOverride('_method'));


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));
//Alternative
app.use(express.static(path.join(__dirname, 'public')));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));



//File uploads

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = function (req, file, cb) {
  // Allowed file types
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname);
  if (!allowedFileTypes.includes(ext)) {
    return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed'), false);
  }
  cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });




// Define routes

// GET /
// Index route - display all farmers
app.get('/', (req, res) => {
  pool.query('SELECT * FROM res ORDER BY groupname', [], (err, results) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.render('index', { res: results });
    }
  });
});

//New
app.get('/', (req, res) => {
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 20); // Set minimum date to 20 years ago
  res.render('new', { minDate: minDate.toISOString().slice(0, 10) });
});



//New

// New route - display a form to add a new farmer
app.get('/res/new', (req, res) => {
  res.render('new');
});

// POST /

app.post('/submit', upload.single('photo'), (req, res) => {
  console.log(req.body); // log the entire request body
  const { groupname, firstname, middlename, lastname, dob, location, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop,animals, cropearnings, geoloc} = req.body;

  // Server-side validation for file type
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(req.file.originalname);
  if (!allowedFileTypes.includes(ext)) {
    return res.status(400).send('Only image files (jpg, jpeg, png, gif) are allowed');
  }

  // Create a comma-separated string of the selected farm animals
  console.log(animals); // check if animals is defined in the request body
  let farmanimals = ''; 
  if (animals && Array.isArray(animals)) {
    farmanimals = animals.join(',');
  }

  // Insert the survey data into the database
  pool.query('INSERT INTO res (groupname, firstname, middlename, lastname, dob, location, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop, animals,cropearnings, geoloc, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [groupname, firstname, middlename, lastname, dob, location, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop, farmanimals, cropearnings, geoloc, req.file.filename], (error, results, fields) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle MySQL error for duplicate entry
        return res.status(400).send('Phone or ID number already exists');
      }
      console.error(error.message);
      return res.status(500).send('Internal server error');
    }
    res.redirect('/success');
  });
});




// GET /edit/:id
app.get('/res/:id/edit', (req, res) => {
  const id = req.params.id;
  pool.query('SELECT * FROM res WHERE id = ?', [id], (error, results) => {
    if (error) throw error;
    res.render('edit', { survey: 'Edit Record', record: results[0] });
    //res.render('edit', { survey: results});
  });
});

// POST /update/:id
app.put('/res/:id', (req, res) => {
  const id = req.params.id;
  const { groupname, firstname, middlename, lastname, dob, location, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop, animals,cropearnings,geoloc } = req.body;

  // Create a comma-separated string of the selected farm animals
  console.log(animals); // check if animals is defined in the request body
  let farmanimals = ''; 
  if (animals && Array.isArray(animals)) {
    farmanimals = animals.join(',');
  }

  pool.query('UPDATE res SET groupname = ?, firstname = ?, middlename = ?, lastname = ?, dob = ?, location = ?, phone = ?, age = ?, maritalstatus = ?, idnumber = ?, occupation = ?, incomesource = ?, monthlyincome = ?, children = ?, under5 = ?, children6to11 = ?, children12to18 = ?, landstatus = ?, landsize = ?, cropgrown = ?, marketaccess = ?, wateraccess = ?, lastcrop = ?, animals=?, cropearnings = ? ,geoloc=? WHERE id = ?', [groupname, firstname, middlename, lastname, dob, location, phone, age, maritalstatus, idnumber, occupation, incomesource, monthlyincome, children, under5, children6to11, children12to18, landstatus, landsize, cropgrown, marketaccess, wateraccess, lastcrop,farmanimals, cropearnings, geoloc, id], (error, results) => {
    if (error) throw error;
    res.redirect('/success');
     console.log(results);

  });
});




// DELETE /delete/:id
app.delete('/res/:id', (req, res) => {
  const id = req.params.id;

  // Delete the survey data from the database
  pool.query('DELETE FROM res WHERE id=?', [id], (error, results) => {
    if (error) throw error;
    res.redirect('/');
  });
});


// GET /thank-you
app.get('/success', (req, res) => {
  res.render('success', { title: 'Thank You' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});