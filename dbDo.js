//in the "urls" collection, the _id field is the original url
//and the short_url field is a unique number associated with the url

var mongo = require('mongodb').MongoClient;
var appDir = 'https://shorty.herokuapp.com/';
var connectData = 'mongodb://localhost:27017/urlShortener';

//accepts a number and returns a url if one exists, or false if not
exports.fetch = function(num, callback) {
	return mongo.connect ('mongodb://localhost:27017/urlShortener', function (err, db) {
		var retval;
		var collection = db.collection('urls');
		collection.find({'short_url': appDir + num}).toArray( (err, docs) => {
			console.log('looking for ' + appDir + num + ', counted ' + docs.length);
			if (docs.length) retval = docs[0]._id;
			else retval = 'Error: No shortened URL found at ' + num + '.';
			callback(retval);
			db.close();
		});
	});
};

//makes a new entry for a url if it doesn't already exist
exports.make = function(url, callback) {
	mongo.connect ('mongodb://localhost:27017/urlShortener', function (err, db) {
		var collection = db.collection('urls');
		var retval;
		return collection.count( {}, (err, count) => {
			return collection.find({'_id': url}).toArray( (err, docs) => {
				//console.log('in make -> tried to find matching url, found :' +  docs.length);
				if (!docs.length) {
					//get the number of items in the collection and use it to 
					//make the short_url
						var doc = {'_id': url,
											 'short_url':appDir + count};
						collection.insert(doc);
						retval = doc;
				} else retval = {'error' : 'duplicate url'};
				db.close();
				//console.log('fn make in dbDo is returning ' + JSON.stringify(retval));
				callback(retval);
			});
		});
	});
};
