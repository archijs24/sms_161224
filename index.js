// Import necessary modules
require('dotenv').config();  // This loads environment variables from .env file
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Using environment variables for sensitive info
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// POST endpoint to save data
app.post("/save", upload.single('file'), (req, res) => {
  let data = [req.body.rno, req.body.name, req.body.marks, req.file.filename];
  console.log(data);
  let sql = "insert into student values(?,?,?,?)";
  con.query(sql, data, (err, result) => {
    if (err) res.send(err);
    else res.send(result);
  });
});

// GET endpoint to fetch all records
app.get("/gs", (req, res) => {
  let sql = "select * from student";
  con.query(sql, (err, result) => {
    if (err) res.send(err);
    else res.send(result);
  });
});

// DELETE endpoint to delete a student record
app.delete("/ds", (req, res) => {
  console.log(req.body.rno, req.body.image);
  let data = [req.body.rno];
  fs.unlink("./uploads/" + req.body.image, () => {});
  let sql = "delete from student where rno=?";
  con.query(sql, data, (err, result) => {
    if (err) res.send(err);
    else res.send(result);
  });
});

// Start the server using port from environment variable
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Server is ready on port ${port}`); });
