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

app.get("/ask/contract/address", async function(req, res) {
	res.setHeader('Content-Type','application/json');
    let result = false;
    let orgManager = '';
    let issuer = '';
    let nft = '';
    try {
        let data = await fs.readFileSync('./out/contractAddress.json', 'utf-8');
        let contractAddress = JSON.parse(data);
        orgManager = contractAddress.orgManager;
        issuer = contractAddress.issuer;
        nft = contractAddress.nft;
        if (orgManager && issuer && nft) {
            result = true;
        } else {
            orgManager = '';
            issuer = '';
            nft = '';
        }
    } catch (error) {
        console.log("contractAddress.json is not exist!!");
    }
    // return result
    res.json({
        'success': result,
        'orgManager': orgManager,
        'issuer': issuer,
        'nft': nft
    });
});