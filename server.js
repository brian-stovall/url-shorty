var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;

var app = express();

mongo.connect ('mongodb://localhost:27017/urlShortener', function (err, db) {
	var collection = db.collection('urls');
	//collection.insert({'original_url': 'http://www.xkcd.com', 
										 //'short_url': 'https://shorty.herokuapp.com/2'});
collection.find().toArray( (err, docs) => {
	console.log(docs.length + ' length')
	for (var i = 0; i < docs.length; i ++)
		console.log(docs[i]);
	db.close();
});

});
	
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/new/:data', (request, response) => {
	//set up response header
	response.setHeader('Content-Type', 'application/json');

	response.write(JSON.stringify({'unix'   : null,
																 'natural': null}),
								 (err) => {response.send();});
});

app.use( (request, response) => {
		response.sendFile(__dirname + '/public/index.html');
});


app.listen(process.env.PORT || '8080');
console.log('URL shortener service listening on port 8080');

