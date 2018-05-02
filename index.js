require('dotenv').config();
require('pug');
const express = require('express');
const app = express();
const scrapeData = require('./scrapeData');
const MongoClient = require('mongodb').MongoClient;
const login = require('./login');
const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'switch2';



MongoClient.connect(url, function(err, client) {
	console.log("Connected to mongoDB...");
	const db = client.db(dbName);
	// Login to the page
	login((err, jar) => {
		if(err) console.error(err);
		scrapeData(db, jar);
		// once an hour
		setInterval(function () {
			scrapeData(db, jar);
		}, 3600000);
	});
});

// app.set('view engine', 'pug')
// app.get('/', (req, res) => {
// 	res.render('index')
// });
//
// app.listen(3000, () => {
// 	console.log('app listening on 3000');
// })
