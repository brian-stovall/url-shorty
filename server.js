var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;

//a module that provides the commands 'make' and 'fetch' 
var dbDo = require('./dbDo');

//the url of the service
var appDir = 'https://shorty.herokuapp.com/';

var app = express();

//helper to serve as callback to dbDo methods
function writeJSON (stream, data) {
	stream.setHeader('Content-Type', 'application/json');
	stream.write( JSON.stringify(data),
			(err) => {if (err) console.log(err); stream.send()});
}

function writeString (stream, data) {
	stream.setHeader('Content-Type', 'application/json');
	stream.write( data,
			(err) => {if (err) console.log(err); stream.send()});
}
	
app.use('/', express.static(path.join(__dirname, 'public')));

//handle calls to /new with good urls (per spec: http(s):// at least one char
//followed by at least one dot, followed by at least one char
app.get(/\/new\/(http[s]?:\/\/.+\..+)/, (request, response) => {
	var newWrite = writeJSON.bind(null, response);
	dbDo.make(request.params[0].toString(), newWrite);
});

//handle calls to /new with bad urls
app.get(/\/new\/(?!http[s]?:\/\/.+\..+)/, (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	response.write(JSON.stringify({'error': 'url invalid'}),
		(err) => {if (err) console.log(err); response.send()});
});


//handle calls to /list by displaying the db contents
app.get('/list', (request, response) => {
	mongo.connect ('mongodb://localhost:27017/urlShortener', function (err, db) {
		var collection = db.collection('urls');
		collection.find({}, {'original_url':1, 'short_url':1, _id:1}).
			toArray( (err, docs) => {
			response.setHeader('Content-Type', 'application/json');
			for (var i = 0; i < docs.length; i++)
				response.write(JSON.stringify(docs[i]) + '\n\n');
			response.send();
			db.close();
		});
	});
});

//handle shortened url requests
app.get('/:num', (request, response) => {
	var shortWrite = writeString.bind(null, response);
	dbDo.fetch(request.params.num, shortWrite);
});

//catch-all for bad addresses that redirects to instruction page
app.use(/.+/, express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || '8080');
console.log('URL shortener service listening on port 8080');

