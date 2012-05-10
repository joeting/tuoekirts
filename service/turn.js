var mongoose = require('mongoose');
var TurnModel = require('../data/model/Turn.js');

exports.get = function(req, res) {
	var query = {
		fbid : req.params.id
	};
	TurnModel.find(query, function(err, doc) {
		res.json(doc);
	});
};


exports.save = function(req, res) {
	new TurnModel({
		number : req.body.number,
		playerId : req.body.playerId,
		gameId : req.body.gameId,
		removeList : req.body.removeList,
	}).save(function(err) {
		if (!err) {
			res.json([ 'OK' ]);
		} else {
			res.json([ 'BAD' ]);
		}
	});
}