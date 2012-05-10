var mongoose = require('mongoose'),
Schema = mongoose.Schema;


var turnSchema = new Schema({
	number: 	{ type: Number },
	playerId:	{ type: String },
	gameId:		{ type: Schema.ObjectId },
	removeList: { type: Schema.Types.Mixed },
	date:   	{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Trun', turnSchema);

