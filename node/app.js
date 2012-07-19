var express = require('express');
var mongoose = require('mongoose');
var jv = require('./config/config.js');
var util = require('util');

var app = module.exports = express.createServer();
app.enable("jsonp callback");

if (jv.conf.env == "PROD") {
	mongoose.connectSet(jv.conf.mongo_connect,
	function (err) {
	        if (err) {
	            util.log("could not connect to DB: " + err);
	        }
	});
} else {
	mongoose.connect(jv.conf.mongo_connect,
			function (err) {
        if (err) {
            util.log("could not connect to DB: " + err);
        }
	});
	util.log("Connected to mongo - " + jv.conf.mongo_connect)
}


app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});


var userService = require('./service/user');
app.get('/user/:id', userService.get);
app.post('/user/:id', userService.save);

var gameService = require('./service/game');
app.get('/game/:id', gameService.get);
app.get('/game/:id/all', gameService.getAll);
app.post('/game/:id', gameService.save);

var turnService = require('./service/turn');
app.get('/turn/:gid', turnService.getByGame);
app.post('/turn/:id', turnService.save);

process.addListener("uncaughtException", function (err) {
	util.log("Uncaught exception: " + err);
	util.log(err.stack);
});

app.listen(3000, function() {
	util.log('Game Server started');
});

