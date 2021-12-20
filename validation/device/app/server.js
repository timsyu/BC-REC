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

app.get("/out/recordtime", async function(req, res) {
	res.setHeader('Content-Type','application/json');
    let number = req.query.number;
    let result = false;
    let content = '';
    try {
        // let data = await fs.readFileSync(`${__dirname}/out/time.txt`, 'utf-8')
        //                     .split('\n');
        let data = getFirstLine(`${__dirname}/out/time.txt`, number);
        data  = data.toString()
            // .replace(/[“”‘’]/g,'');
        let base64data = new Buffer.from(data).toString('base64');
        if (base64data) {
            result = true;
            content = base64data;
        } else {
            content = '';
        }
    } catch (error) {
        console.log("time.txt is not exist!!");
    }
    // return result
    res.json({
        'success': result,
        'content': content
    });
});

const fs = require('fs');
const readline = require('readline');

async function getFirstLine(pathToFile, number) {
    const readable = fs.createReadStream(pathToFile);
    const reader = readline.createInterface({ input: readable });
    let count = 0;
    let array = [];
    const line = await new Promise((resolve) => {
        reader.on('line', (line) => {
            count++;
            if (number >= count) {
                reader.close();
                array.push(line)
                resolve(line);
            }
        });
    });
    readable.close();
    return array;
}