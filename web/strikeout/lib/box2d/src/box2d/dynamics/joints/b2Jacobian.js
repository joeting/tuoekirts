/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

goog.provide('box2d.Jacobian');

goog.require('box2d.Vec2');

/**
 @constructor
 */
box2d.Jacobian = function() {
  // initialize instance variables for references
  this.linear1 = new box2d.Vec2();
  this.linear2 = new box2d.Vec2();
  //
};

box2d.Jacobian.prototype = {
  angular1: null,
  angular2: null,

  SetZero: function() {
    this.linear1.SetZero();
    this.angular1 = 0.0;
    this.linear2.SetZero();
    this.angular2 = 0.0;
  },
  Set: function(x1, a1, x2, a2) {
    this.linear1.SetV(x1);
    this.angular1 = a1;
    this.linear2.SetV(x2);
    this.angular2 = a2;
  },
  Compute: function(x1, a1, x2, a2) {

    //return goog.math.Vec2.dot(this.linear1, x1) + this.angular1 * a1 + goog.math.Vec2.dot(this.linear2, x2) + this.angular2 * a2;
    return (this.linear1.x * x1.x + this.linear1.y * x1.y) + this.angular1 * a1 + (this.linear2.x * x2.x + this.linear2.y * x2.y) + this.angular2 * a2;
  }
};
