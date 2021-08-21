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

app.listen(3000, () => {
	console.log("Application started and Listening on port 3000");
});
  
app.get("/", (req, res) => {
	res.render("home");
});

const ipfs = ipfsClient({host:'127.0.0.1',port:5001,protocol:'http'});

app.get("/ipfs/:hashcode", async function(req, res) {
	const hashcode = req.params.hashcode;
	res.setHeader('Content-Type','application/json');
	let result = false;
	if (hashcode) {
		const stream = ipfs.cat(hashcode);
		let data = ''

		for await (const chunk of stream) {
		// chunks of data are returned as a Buffer, convert it back to a string
		data += chunk.toString()
		}
		// console.log(data);
		result = true;
		res.json({
			'success': result,
			'data': data
		});

			
		
	} else {
		res.json({
			'success': result,
			'data': ''
		});
	}
  
});
// const util = require('util');

// upload file to ipfs
app.post("/ipfs", (req, res) => {
	
	const file = req.files.filetoupload;
	const filename = req.files.filetoupload.name;
	// const dir = 'files';
	// const makeDir = util.promisify(fs.mkdir);

	// makeDir(dir)
	// .then( r => {

	const filepath = 'files/' + filename;

	file.mv(filepath, async(err) => {
		if(err){
			console.log("ERROR: Upload File Error!");
			return res.status(500).send(err);
		}
		const hashcode = await addFile(filepath);
		console.log(hashcode);
		fs.unlink(filepath, (err  => {
			if(err) console.log(err);
		}))
		res.render("upload",{filename, hashcode});
	})
	// });
	
	
});
// ipfs api: https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
const addFile = async(filepath) => {

	try {
		const file = fs.readFileSync(filepath);
		const added = await ipfs.add(file);
		return added.cid.toString();
	} catch (err){
		console.log(err);
	}
	
}