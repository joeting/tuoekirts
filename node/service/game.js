var mongoose = require('mongoose');
var GameModel = require('../data/model/Game.js');

exports.get = function(req, res) {
	var query = {
		_id : req.params.id,
	};
	GameModel.find(query, function(err, doc) {
		res.json(doc);
	});
};

exports.save = function(req, res) {
	new GameModel({
		player1 : req.body.player1,
		player2 : req.body.player2,
		boardType : req.body.boardType,
		board : req.body.board
//		status: req.body.status,
//		date : req.body.date
	}).save(function(err, doc) {
		if (!err) {
			res.json({'game': doc._id});
		} else {
			res.json(['BAD']);
		}
	});
}

exports.getAll = function(req, res) {
	var query = {
		status : "start"
	};

	GameModel.find(query, function(err, doc){
		res.json(doc);
	}).or([{player1 : req.params.id},{player2 : req.params.id}]);
}