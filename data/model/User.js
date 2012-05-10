var mongoose = require('mongoose'),
Schema = mongoose.Schema;


var userSchema = new Schema({
	alias: 		{ type: String, index: { unique: true } },
	fbid: 		{ type: String, index: { unique: true } },
	fbprofile:  { type: Schema.Types.Mixed },
	wins:		{ type: Number },
	loss:		{ type: Number },
	rating:		{ type: Number },
	date:   	{ type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

