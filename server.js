var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;

//a module that provides the commands 'make' and 'fetch' 
var dbDo = require('./dbDo');

//the url of the service
var appDir = 'https://urlsmall.herokuapp.com/';
var connectData = 'mongodb://shorty:dreamtime3@ds035735.mongolab.com:35735/shorty';

var app = express();

//helper to serve as callback to dbDo methods
function writeJSON (stream, data) {
	stream.setHeader('Content-Type', 'application/json');
	stream.write( JSON.stringify(data),
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
	mongo.connect (connectData, function (err, db) {
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
	//function that handles responses from dbDo.fetch
	function shortRedirect(data) {
		//try to redirect if data is a valid url
		if (data.match(/http[s]?:\/\/.+\..+/)) {
			//response.statusCode = 302;
			//response.setHeader("Location", data);
			response.redirect(data);
		} else //otherwise send the data (error message)
			response.send(data);
	}
	dbDo.fetch(request.params.num, shortRedirect);
});

//catch-all for bad addresses that redirects to instruction page
app.use(/.+/, express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || '8080');
console.log('URL shortener service listening on port 8080');

