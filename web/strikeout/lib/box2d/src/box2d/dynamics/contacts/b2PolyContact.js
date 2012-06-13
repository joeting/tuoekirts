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

goog.provide('box2d.PolyContact');

goog.require('box2d.ContactNode');
goog.require('box2d.Manifold');
goog.require('box2d.Math');
goog.require('box2d.PolyShape');

/**
  @constructor
  @extends {box2d.Contact}
  @param {!box2d.PolyShape} s1
  @param {!box2d.PolyShape} s2
*/
box2d.PolyContact = function(s1, s2) {
  // The constructor for box2d.Contact
  // initialize instance variables for references
  this.m_node1 = new box2d.ContactNode();
  this.m_node2 = new box2d.ContactNode();
  //
  this.m_flags = 0;

  if (!s1 || !s2) {
    this.m_shape1 = null;
    this.m_shape2 = null;
    return;
  }

  this.m_shape1 = s1;
  this.m_shape2 = s2;

  this.m_manifoldCount = 0;

  this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
  this.m_restitution = Math.max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

  this.m_prev = null;
  this.m_next = null;

  this.m_node1.contact = null;
  this.m_node1.prev = null;
  this.m_node1.next = null;
  this.m_node1.other = null;

  this.m_node2.contact = null;
  this.m_node2.prev = null;
  this.m_node2.next = null;
  this.m_node2.other = null;
  //
  // initialize instance variables for references
  this.m0 = new box2d.Manifold();
  this.m_manifold = [new box2d.Manifold()];

  this.m_manifold[0].pointCount = 0;
};
goog.inherits(box2d.PolyContact, box2d.Contact);

box2d.PolyContact.prototype.Evaluate = function() {
  var tMani = this.m_manifold[0];
  // replace memcpy
  // memcpy(&this.m0, &this.m_manifold, sizeof(b2Manifold));
  //this.m0.points = new Array(tMani.pointCount);
  var tPoints = this.m0.points;

  for (var k = 0; k < tMani.pointCount; k++) {
    var tPoint = tPoints[k];
    var tPoint0 = tMani.points[k];
    //tPoint.separation = tPoint0.separation;
    tPoint.normalImpulse = tPoint0.normalImpulse;
    tPoint.tangentImpulse = tPoint0.tangentImpulse;
    //tPoint.position.SetV( tPoint0.position );
    tPoint.id = tPoint0.id.Copy();

    /*this.m0.points[k].id.features = new Features();
      this.m0.points[k].id.features.referenceFace = this.m_manifold[0].points[k].id.features.referenceFace;
      this.m0.points[k].id.features.incidentEdge = this.m_manifold[0].points[k].id.features.incidentEdge;
      this.m0.points[k].id.features.incidentVertex = this.m_manifold[0].points[k].id.features.incidentVertex;
      this.m0.points[k].id.features.flip = this.m_manifold[0].points[k].id.features.flip;*/
  }
  //this.m0.normal.SetV( tMani.normal );
  this.m0.pointCount = tMani.pointCount;

  box2d.Collision.b2CollidePoly(tMani, this.m_shape1, this.m_shape2, false);

  // Match contact ids to facilitate warm starting.
  if (tMani.pointCount > 0) {
    var match = [false, false];

    // Match old contact ids to new contact ids and copy the
    // stored impulses to warm start the solver.
    for (var i = 0; i < tMani.pointCount; ++i) {
      var cp = tMani.points[i];

      cp.normalImpulse = 0.0;
      cp.tangentImpulse = 0.0;
      var idKey = cp.id.key;

      for (var j = 0; j < this.m0.pointCount; ++j) {

        if (match[j] == true) continue;

        var cp0 = this.m0.points[j];
        var id0 = cp0.id;

        if (id0.key == idKey) {
          match[j] = true;
          cp.normalImpulse = cp0.normalImpulse;
          cp.tangentImpulse = cp0.tangentImpulse;
          break;
        }
      }
    }

    this.m_manifoldCount = 1;
  } else {
    this.m_manifoldCount = 0;
  }
};

box2d.PolyContact.prototype.GetManifolds = function() {
  return this.m_manifold;
};

box2d.PolyContact.Create = function(shape1, shape2) {
  return new box2d.PolyContact(shape1, shape2);
};
