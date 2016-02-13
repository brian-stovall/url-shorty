var express = require('express');
var path = require('path');

var app = express();

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

