goog.provide('strikeout.DrawPath');

goog.require('goog.math.Size');
goog.require('goog.events');
goog.require('lime.Sprite');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn');
goog.require('lime.CanvasContext');

/**
 * DrawPath object. Draw a path on the screen. Return a list of objects that are on the path.
 * @constructor
 * @param {lime.Sprite} owner
 * @param {goog.math.Size} size
 */
strikeout.DrawPath = function(owner, size, selectHandler) {

    this.graphics = new lime.CanvasContext().setSize(size).setAnchorPoint(0,0).setQuality(.5);
    owner.appendChild(this.graphics);
    this.graphics.draw = goog.bind(this.draw, this);
    
    this.selectHandler = selectHandler;
    this.owner = owner;

    this.touches = [];
	
    //add some interaction
    goog.events.listen(owner,['mousedown','touchstart'], this.downHandler, false, this);
    
    lime.scheduleManager.schedule(function(){
        this.graphics.setDirty(lime.Dirty.CONTENT);
        }, this);

    //console.log('strikeout drawpath');
};

strikeout.DrawPath.prototype.downHandler = function(e) {

    console.log('down handler');

    var touch = {pos: e.position, screenPos : e.screenPosition, particles: [], moved: false, slope: 0, yintercept: 0, lineDetermined: false};
    this.touches[0] = touch;
	
    e.swallow(['mousemove', 'touchmove'], goog.bind(this.moveHandler, this, touch));
    e.swallow(['mouseup', 'touchend', 'touchcancel', 'keyup'], goog.bind(this.upHandler, this, touch));
};

strikeout.DrawPath.prototype.moveHandler = function(touch, e) {
	if (!goog.isDef(touch.pos)) {
        touch.pos = e.position;
        touch.screenPos = e.screenPosition;
        return;
    }
    touch.moved = true;
    

  	touch.particles[0] = new Particle(touch.pos.x, touch.pos.y, e.position.x, e.position.y);
};

strikeout.DrawPath.prototype.upHandler = function(touch,e) {
    if (e.type == 'keyup' && e.event.keyCode != 90) {
        return;
    }

    var ctx = this.owner.children_[this.owner.children_.length -1].domElement.getContext('2d');

    this.selectHandler(touch, e);
    
    var particles = touch.particles;
    for (i = 0; i < particles.length; i++) {
        p = particles[i];
        ctx.lineWidth = 14;

       ctx.strokeStyle = 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',' + (1) + ')';
       ctx.beginPath();
       ctx.moveTo(p.p0[0], p.p0[1]);
       ctx.lineTo(p.p1[0], p.p1[1]);
       ctx.stroke();
    }
    ctx.closePath();

    var touch = {pos: e.position, screenPos : e.screenPosition, particles: [], moved: false, slope: 0, yintercept: 0, lineDetermined: false};
    this.touches[0] = touch;
    
    touch.remove = 1;
};

strikeout.DrawPath.prototype.draw = function(ctx) {
    var now = goog.now();
    if(!this.lastRun_) this.lastRun_ = now;
    var dt = now-this.lastRun_,
        dt_ms = dt / 1000,
        t, i, p, particles;

        this.lastRun_ = now;

    if(goog.userAgent.MOBILE) {
       this.ctx.globalCompositeOperation = 'copy';
    }
    else {
        ctx.clearRect(0,0,strikeout.director.getSize().width,strikeout.director.getSize().height);
    }

    
    // style for clear. clearRect is very slow on ios
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 17;
    ctx.shadowBlur = 0;
    ctx.shadowColor = '#fff';
   
   var yellow = [0xf1, 0xf9, 0x39];
   for (t = 0; t < this.touches.length; t++) {

       particles = this.touches[t].particles;
       for (i = 0; i < particles.length; i++) {
           p = particles[i];
           ctx.lineWidth = 14;

           ctx.strokeStyle = 'rgba(' + 227 + ',' + 227 + ',' + 91 + ',' + (1) + ')';
           ctx.beginPath();
           ctx.moveTo(p.p0[0], p.p0[1]);
           ctx.lineTo(p.p1[0], p.p1[1]);
           ctx.stroke();
       }
   }
   
   ctx.closePath();
};

function Particle(x0, y0, x1, y1) {
    this.p0 = [x0, y0];
    this.p1 = [x1, y1];
    this.life = 0;
};
