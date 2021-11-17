const express = require("express");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'ejs');

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/ask/register/address", async function(req, res) {
	res.setHeader('Content-Type','application/json');
    let result = false;
    let orgAddress = '';
    let plantAddress = '';
    try {
        let odata = await fs.readFileSync('./out/org.txt', 'utf-8')
                            .split('\n');
        orgAddress = odata[0];
        let pdatas = await fs.readFileSync('./out/plants.txt', 'utf-8')
                            .split('\n')
                            .filter(Boolean);
        plantAddress = pdatas[Math.floor(Math.random() * pdatas.length)];
        if (orgAddress && plantAddress) {
            result = true;
        } else {
            orgAddress = '';
            plantAddress = '';
        }
    } catch (error) {
        console.log("org.txt or plants.txt is not exist!!");
    }
    // return result
    res.json({
        'success': result,
        'orgAddress': orgAddress,
        'plantAddress': plantAddress
    });
});