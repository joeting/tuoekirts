goog.provide('strikeout.Gem');

goog.require('lime.Circle');

/**
 * Single bubble object
 * @constructor
 * @extends lime.Sprite
 */
strikeout.Gem = function() {
    goog.base(this);

    // grphical body obejct
    this.circle = new lime.Sprite();
    this.appendChild(this.circle);
    this.selected_ = false;
    this.crossedOut_ = false;
    this.index = -1;
    this.qualityRenderer = true;

};
goog.inherits(strikeout.Gem, lime.Sprite);

// not used any more. only length is important
// strikeout.Gem.colors = ['#F00', '#F90', '#0C0', '#0CC', '#00C', '#96F'];
strikeout.Gem.colors = ['#0C0'];

/**
 * Generate bubble with random color
 * @return {strikeout.Gem} New bubble.
 */
strikeout.Gem.random = function() {
    var id = Math.floor(Math.random() * strikeout.Gem.colors.length);
    //var color = strikeout.Gem.colors[id];
    var gem = new strikeout.Gem();
    gem.index = id;
    gem.circle.setFill('strikeout/assets/ball_' + id + '.png');
    return gem;
};

/**
 * Select bubble. Show highlight
 */
strikeout.Gem.prototype.select = function() {
    if (this.selected_) return;
    var size = this.getSize().clone();
    this.highlight = new lime.Sprite().setSize(size).setFill('strikeout/assets/selection.png');
    this.appendChild(this.highlight, 0);

    this.selected_ = true;
};

/**
 * Remove selection highlight form bubble.
 */
strikeout.Gem.prototype.deselect = function() {
    if (!this.selected_) return;
    this.removeChild(this.highlight);
    this.selected_ = false;
};

/**
 * @inheritDoc
 */
strikeout.Gem.prototype.update = function() {

    // make circle size relative form bubble size
    // todo: replace with AutoResize mask
    var size = this.getSize();
    this.circle.setSize(size.width * .75, size.height * .75);

    lime.Node.prototype.update.call(this);
};
