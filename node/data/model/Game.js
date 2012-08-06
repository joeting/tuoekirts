var mongoose = require('mongoose'),
Schema = mongoose.Schema;


var gameSchema = new Schema({
	player1: 	{ type: String },
	player2:  	{ type: String },
	boardType:  { type: String },
	board : 	{ type: Schema.Types.Mixed },
	status: 	{ type: String, default: "start", enum: ["start", "forfeit", "end"] },
	winner:		{ type:	String },
	loser:		{ type:	String },
	date:   	{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);