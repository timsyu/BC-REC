const fs = require('fs')
const express = require("express");
const cors = require('cors');
const path = require('path');
// const fileupload = require('express-fileupload');
const ipfsClient = require("ipfs-http-client");

const app = express();

// app.use(fileupload());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'public')));
app.set('views', './views');
app.set('view engine', 'ejs');

app.listen(3000, () => {
	console.log("Application started and Listening on port 3000");
});
  
app.get("/", (req, res) => {
	res.render("home");
});