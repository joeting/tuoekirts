//set main namespace
goog.provide('strikeout');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Button');
goog.require('lime.RoundedRect');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('strikeout.Button');
goog.require('strikeout.Gem');
goog.require('strikeout.DrawPath');



var _layer;
var _gems;
var _turnNumber = 0;
var _selected = new Array();
var _playerLbl;
var _playerNumber = 1;
var _button;
var _scene;

// entrypoint
strikeout.start = function(lines, playerId, gameId){

	var director = new lime.Director(document.body,1280,768);
    strikeout.director = director;

	_scene = new lime.Scene();
	_gems = new Array(lines);
	 // label for score message
    _playerLbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#fffff').setFontSize(48).
        setPosition(375, 600).setText('Player: ' + _playerNumber);

    _button = new makeButton('STRIKEOUT').setPosition(375, 700);
    goog.events.listen(_button, ['mousedown', 'touchstart'], goHandler_);
    drawBoard();
    _scene.appendChild(_playerLbl);
    _scene.appendChild(_layer);
	_scene.appendChild(_button);
    director.makeMobileWebAppCapable();

// set current scene active
    director.replaceScene(_scene);
};

drawBoard = function() {
	// static background bubbles for baord. try dfkit.Renderer.CANVAS for this one as it is quite static
	var SIZE = 690;
	var GAP = Math.round(SIZE / lines);
	var OFFSET = GAP/2;
	_layer = new lime.Layer();
    var back = new lime.RoundedRect().setSize(690, 690).setAnchorPoint(0, 0).setPosition(0,0).setRadius(30);
    var lines = _gems.length;
    var allGems = [];
    for (var r = 0; r < lines; r++) {
    	if (!_gems[r]){
    		_gems[r] = [];
    	}
    	for (var c = 0; c <= r; c++) {
        	var o = (SIZE/2)-(60*r)+(120*c);
        	var b = new lime.Sprite().setFill('strikeout/assets/shadow.png').setAnchorPoint(0, 0).setSize(90, 90).setPosition(o, r * 90 );
        	b.qualityRenderer = true;
        	back.appendChild(b);
        	var gem = strikeout.Gem.random();
            gem.r = r;
            gem.c = c;
            gem.setPosition(o + 45, (r * 90) + 45);
            gem.setSize(90, 90);
            _gems[r].push(gem);
//            goog.events.listen(gem, ['mousedown', 'touchstart'], pressHandler_);
            _layer.appendChild(gem);
            allGems.push(gem);
        }
    }

    _layer.appendChild(back);

    // Draw path, pass in a selectHandler which get's call once the line is drawn.
    this.drawpath = new strikeout.DrawPath(back, strikeout.director.getSize().clone(), function(touch, e) {

    	var distanceSeg = 25;

    	// Reset the previously selected gems.
    	for (var j = 0; j < allGems.length; j++) {

    		if (allGems[j].deleted_) {
    			continue;
    		}

    		if (allGems[j].selected_) {
    			allGems[j].deselect();
    		}
    	}
    	_selected = new Array();

    	// get the line.
    	var line = new goog.math.Line(touch.screenPos.x, touch.screenPos.y, e.screenPosition.x, e.screenPosition.y);

    	// Back fill points along the line.
    	var distance = line.getSegmentLength();
    	var numOfSeg = distance / distanceSeg;
    	numOfSeg = (numOfSeg < 1)? 1 : numOfSeg;

    	for (var i = 0; i <= numOfSeg; i++) {

    		var t = i / numOfSeg;
    		var cord = line.getInterpolatedPoint(t);

    		// Loop through all gems and see if the cord is on the line.
    		for (var j = 0; j < allGems.length; j++) {

    			if (allGems[j].deleted_ || allGems[j].selected_) {
    				continue;
    			}

    			if (allGems[j].hitTest({screenPosition: cord})) {
    				pressHandler_({target: allGems[j]});
    			}
    		}

    	}

    });
}

getIndexByElement = function (array , element) {
	 for (var i=0; i<array.length;i++ ) {
		 if(array[i]===element)
			 return i;
	 }
}

goHandler_ = function(e) {
	var turn = {};
	var gemCount = 0;
	turn.removeList = [];

	for (var r = 0; r<_gems.length; r++) {
		for (var c = 0; c<=r; c++ ) {
			gemCount++;
			if (_gems[r][c].selected_) {
				_gems[r][c].deleted_ = true;
				var fade = new lime.animation.FadeTo(0).setDuration(1);
				_gems[r][c].runAction(fade);
				var remove = [];
				remove.push(r);
				remove.push(c);
				turn.removeList.push(remove);
				gemCount--;
			}
		}
	}

	var data = {
		number : _turnNumber,
		removeList : turn.removeList,
		gameId : game.Model.get()._id,
		playerId : fbAPI.getUserId()
	};
	console.log(data);
	saveTurn(data);

	_selected = new Array();
	turn.number = _turnNumber++;
	if (gemCount == 1) {
		_scene.removeChild(_button);
		_playerLbl.setText('Player: ' +  _playerNumber + " Victory!!!");

	} else {
		_playerNumber = _turnNumber%2 + 1;
		_playerLbl.setText('Player: ' +  _playerNumber );
	}

	console.log(turn);
	console.log(gemCount);
}

makeButton = function(text) {
    var btn = new strikeout.Button(text).setSize(300, 90);
    return btn;
};

moveHandler_ = function(e){
	var gem = e.target;
	gem.select();
}


pressHandler_ = function(e) {
	// console.log(e.target.getPosition());
	var gem = e.target;
	if (gem.selected_) {
		if (_selected.length==3) {
			if (getIndexByElement(_selected, gem)===1) {
				return;
			}
		}
		e.target.deselect();
		removeByElement(_selected, gem);
		_selected.sort(sortFn);
	} else {
		if (_selected.length>=3) {
			return;
		}

		if (_selected.length > 0) {
			var x_distance = Math.abs(gem.position_.x - _selected[_selected.length-1].position_.x);
			var y_distance = Math.abs(gem.position_.y - _selected[_selected.length-1].position_.y);
			if (x_distance >= 150 && y_distance ===0 || x_distance >= 120 && y_distance >0 || y_distance >= 150) {
				return;
			}
		}
		var prevSlope = -1;
		for (var i = 0; i<_selected.length; i++) {
			x_distance = gem.position_.x - _selected[i].position_.x;
			slope = (gem.position_.y - _selected[i].position_.y) / x_distance ;
			if (prevSlope !== -1  && prevSlope !== slope) {
				return;
			}
			prevSlope = slope;
		}
		e.target.select();
		_selected.push(gem);
		_selected.sort(sortFn);
	}
};

removeByElement = function (array , element) {
	 for (var i=0; i<array.length;i++ ) {
		 if(array[i]===element)
			 array.splice(i,1);
	 }
}

sortFn = function(a, b) {
	return (a.position_.x - b.position_.x) + (a.position_.y - b.position_y);
}


unPressHandler_ = function(e){
	e.target.select();
	console.log(e.target.getPosition());
};

setGame = function(){

};

saveTurn = function(data){
	turn.Model.save(data);
};

displayCurrentTurn = function(resp){
	res =resp[resp.length-1];

	for(var i=0; i<res.removeList.length; i++)
	{
		var obj = res.removeList[i];
		_gems[obj[0]][obj[1]].selected_ = true;
	}

	for (var r = 0; r<_gems.length; r++) {
		for (var c = 0; c<=r; c++ ) {
			if (_gems[r][c].selected_) {
				_gems[r][c].deleted_ = true;
				var fade = new lime.animation.FadeTo(0).setDuration(1);
				_gems[r][c].runAction(fade);
			}
		}
	}
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('strikeout', strikeout);