var mongoose = require('mongoose');
var UserModel = require('../data/model/User.js');

exports.get = function(req, res) {
	var query = {
		fbid : req.params.id
	};
	UserModel.findOne(query, function(err, doc) {
		res.json(doc);
	});
};


exports.save = function(req, res) {
	new UserModel({
		alias : req.body.alias,
		fbid : req.body.fbid,
		fbprofile : req.body.fbprofile,
		wins : req.body.wins,
		loss: req.body.loss,
		rating: req.body.rating
	}).save(function(err) {
		if (!err) {
			res.json([ 'OK' ]);
		} else {
			res.json([ 'BAD' ]);
		}
	});
}