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

goog.require('strikeout.Gem');



var _layer;
var _gems;
var _turnNumber = 0;
var _selected = new Array();

// entrypoint
strikeout.start = function(lines, playerId, gameId){

	var director = new lime.Director(document.body,1024,768);
	var scene = new lime.Scene();
	_gems = new Array(lines);
	var menuLayer = new lime.Layer();
    var button = new lime.Label().setText('GO').setFontColor('#000').setFontSize(48).setPosition(50, 700);
    goog.events.listen(button, ['mousedown', 'touchstart'], goHandler_);
    menuLayer.appendChild(button);
    drawBoard();
    scene.appendChild(_layer);
	scene.appendChild(menuLayer);
    director.makeMobileWebAppCapable();

// set current scene active
    director.replaceScene(scene);
};

drawBoard = function() {
	// static background bubbles for baord. try dfkit.Renderer.CANVAS for this one as it is quite static
	var SIZE = 690;
	var GAP = Math.round(SIZE / lines);
	var OFFSET = GAP/2;
	_layer = new lime.Layer();
    var back = new lime.RoundedRect().setSize(690, 690).setAnchorPoint(0, 0).setPosition(0,0).setRadius(30);
    var lines = _gems.length;
    for (var r = 0; r < lines; r++) {
    	if (!_gems[r]){
    		_gems[r] = [];
    	}
    	for (var c = 0; c <= r; c++) {
        	var o = (SIZE/2)-(60*r)+(120*c);
        	var b = new lime.Sprite().setFill('assets/shadow.png').setAnchorPoint(0, 0).setSize(90, 90).setPosition(o, r * 90 );
        	b.qualityRenderer = true;
        	back.appendChild(b);
        	var gem = strikeout.Gem.random();
            gem.r = r;
            gem.c = c;
            gem.setPosition(o + 45, (r * 90) + 45);
            gem.setSize(90, 90);
            _gems[r].push(gem);
            goog.events.listen(gem, ['mousedown', 'touchstart'], pressHandler_);
            _layer.appendChild(gem);
        }
    }
    _layer.appendChild(back);
}

getIndexByElement = function (array , element) {
	 for (var i=0; i<array.length;i++ ) { 
		 if(array[i]===element)
			 return i;
	 } 
}

goHandler_ = function(e) {
	var turn = {};
	turn.removeList = [];
	
	for (var r = 0; r<_gems.length; r++) {
		for (var c = 0; c<=r; c++ ) {
			if (_gems[r][c].selected_) {
				_gems[r][c].deleted_ = true;
				var fade = new lime.animation.FadeTo(0).setDuration(1);
				_gems[r][c].runAction(fade);
				var remove = [];
				remove.push(r);
				remove.push(c);
				turn.removeList.push(remove);
			}
		}
	}
	_selected = new Array();
	turn.number = turnNumber++;
	
}

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


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('strikeout.start', strikeout.start);