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

// The pair manager is used by the broad-phase to quickly add/remove/find pairs
// of overlapping proxies. It is based closely on code provided by Pierre Terdiman.
// http:
goog.provide('box2d.PairManager');

goog.require('box2d.BufferedPair');
goog.require('box2d.Pair');

/**
 @constructor
 */
box2d.PairManager = function() {
  var i = 0;
  this.m_hashTable = new Array(box2d.Pair.b2_tableCapacity);
  for (i = 0; i < box2d.Pair.b2_tableCapacity; ++i) {
    this.m_hashTable[i] = box2d.Pair.b2_nullPair;
  }
  /**
   @private
   @type {!Array.<box2d.Pair>}
   */
  this.m_pairs = new Array(box2d.Settings.b2_maxPairs);
  for (i = 0; i < box2d.Settings.b2_maxPairs; ++i) {
    this.m_pairs[i] = new box2d.Pair();
  }
  this.m_pairBuffer = new Array(box2d.Settings.b2_maxPairs);
  for (i = 0; i < box2d.Settings.b2_maxPairs; ++i) {
    this.m_pairBuffer[i] = new box2d.BufferedPair();
  }

  for (i = 0; i < box2d.Settings.b2_maxPairs; ++i) {
    this.m_pairs[i].proxyId1 = box2d.Pair.b2_nullProxy;
    this.m_pairs[i].proxyId2 = box2d.Pair.b2_nullProxy;
    this.m_pairs[i].userData = null;
    this.m_pairs[i].status = 0;
    this.m_pairs[i].next = (i + 1);
  }
  this.m_pairs[box2d.Settings.b2_maxPairs - 1].next = box2d.Pair.b2_nullPair;
  this.m_pairCount = 0;
};

box2d.PairManager.prototype = {
  //~box2d.PairManager();
  Initialize: function(broadPhase, callback) {
    this.m_broadPhase = broadPhase;
    this.m_callback = callback;
  },

  /*
  As proxies are created and moved, many pairs are created and destroyed. Even worse, the same
  pair may be added and removed multiple times in a single time step of the physics engine. To reduce
  traffic in the pair manager, we try to avoid destroying pairs in the pair manager until the
  end of the physics step. This is done by buffering all the this.RemovePair requests. this.AddPair
  requests are processed immediately because we need the hash table entry for quick lookup.

  All user user callbacks are delayed until the buffered pairs are confirmed in this.Commit.
  This is very important because the user callbacks may be very expensive and client logic
  may be harmed if pairs are added and removed within the same time step.

  Buffer a pair for addition.
  We may add a pair that is not in the pair manager or pair buffer.
  We may add a pair that is already in the pair manager and pair buffer.
  If the added pair is not a new pair, then it must be in the pair buffer (because this.RemovePair was called).
  */
  AddBufferedPair: function(proxyId1, proxyId2) {
    //box2d.Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
    //box2d.Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);
    var pair = this.AddPair(proxyId1, proxyId2);

    // If this pair is not in the pair buffer ...
    if (pair.IsBuffered() == false) {
      // This must be a newly added pair.
      //box2d.Settings.b2Assert(pair.IsFinal() == false);
      // Add it to the pair buffer.
      pair.SetBuffered();
      this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
      this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
      ++this.m_pairBufferCount;

      //box2d.Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
    }

    // Confirm this pair for the subsequent call to this.Commit.
    pair.ClearRemoved();

    if (box2d.BroadPhase.s_validate) {
      this.ValidateBuffer();
    }
  },

  // Buffer a pair for removal.
  RemoveBufferedPair: function(proxyId1, proxyId2) {
    //box2d.Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
    //box2d.Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);
    var pair = this._find(proxyId1, proxyId2);

    if (pair == null) {
      // The pair never existed. This is legal (due to collision filtering).
      return;
    }

    // If this pair is not in the pair buffer ...
    if (pair.IsBuffered() == false) {
      // This must be an old pair.
      //box2d.Settings.b2Assert(pair.IsFinal() == true);
      pair.SetBuffered();
      this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
      this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
      ++this.m_pairBufferCount;

      //box2d.Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
    }

    pair.SetRemoved();

    if (box2d.BroadPhase.s_validate) {
      this.ValidateBuffer();
    }
  },

  //private:
  // Add a pair and return the new pair. If the pair already exists,
  // no new pair is created and the old one is returned.
  AddPair: function(proxyId1, proxyId2) {

    if (proxyId1 > proxyId2) {
      var temp = proxyId1;
      proxyId1 = proxyId2;
      proxyId2 = temp;
    }

    var hash = box2d.PairManager.Hash(proxyId1, proxyId2) & box2d.Pair.b2_tableMask;

    //var pairIndex = this._findHash(proxyId1, proxyId2, hash);
    var pair = this._findHash(proxyId1, proxyId2, hash);

    if (pair != null) {
      return pair;
    }

    //box2d.Settings.b2Assert(this.m_pairCount < box2d.Settings.b2_maxPairs && this.m_freePair != b2_nullPair);
    var pIndex = this.m_freePair;
    pair = this.m_pairs[pIndex];
    this.m_freePair = pair.next;

    pair.proxyId1 = proxyId1;
    pair.proxyId2 = proxyId2;
    pair.status = 0;
    pair.userData = null;
    pair.next = this.m_hashTable[hash];

    this.m_hashTable[hash] = pIndex;

    ++this.m_pairCount;

    return pair;
  },

  // Remove a pair, return the pair's userData.
  RemovePair: function(proxyId1, proxyId2) {

    //box2d.Settings.b2Assert(this.m_pairCount > 0);
    if (proxyId1 > proxyId2) {
      var temp = proxyId1;
      proxyId1 = proxyId2;
      proxyId2 = temp;
    }

    var hash = box2d.PairManager.Hash(proxyId1, proxyId2) & box2d.Pair.b2_tableMask;

    var node = this.m_hashTable[hash];
    var pNode = null;

    while (node != box2d.Pair.b2_nullPair) {
      if (box2d.PairManager.Equals(this.m_pairs[node], proxyId1, proxyId2)) {
        var index = node;

        //*node = this.m_pairs[*node].next;
        if (pNode) {
          pNode.next = this.m_pairs[node].next;
        } else {
          this.m_hashTable[hash] = this.m_pairs[node].next;
        }

        var pair = this.m_pairs[index];
        var userData = pair.userData;

        // Scrub
        pair.next = this.m_freePair;
        pair.proxyId1 = box2d.Pair.b2_nullProxy;
        pair.proxyId2 = box2d.Pair.b2_nullProxy;
        pair.userData = null;
        pair.status = 0;

        this.m_freePair = index;
        --this.m_pairCount;
        return userData;
      } else {
        //node = &this.m_pairs[*node].next;
        pNode = this.m_pairs[node];
        node = pNode.next;
      }
    }

    //box2d.Settings.b2Assert(false);
    return null;
  },

  ValidateBuffer: function() {
    // DEBUG
  },

  ValidateTable: function() {
    // DEBUG
  },

  //public:
  m_broadPhase: null,
  m_callback: null,
  m_freePair: 0,
  m_pairCount: 0,

  m_pairBuffer: null,
  m_pairBufferCount: 0,

  m_hashTable: null

  // static
  // Thomas Wang's hash, see: http:
};

/**
 @private
 @param {number} proxyId1
 @param {number} proxyId2
 @return {box2d.Pair}
 */
box2d.PairManager.prototype._find = function(proxyId1, proxyId2) {

  if (proxyId1 > proxyId2) {
    var temp = proxyId1;
    proxyId1 = proxyId2;
    proxyId2 = temp;
  }

  var hash = box2d.PairManager.Hash(proxyId1, proxyId2) & box2d.Pair.b2_tableMask;

  return this._findHash(proxyId1, proxyId2, hash);
};

/**
 @private
 @param {number} proxyId1
 @param {number} proxyId2
 @param {number} hash
 @return {box2d.Pair}
 */
box2d.PairManager.prototype._findHash = function(proxyId1, proxyId2, hash) {
  var index = this.m_hashTable[hash];

  while (index != box2d.Pair.b2_nullPair && box2d.PairManager.Equals(this.m_pairs[index], proxyId1, proxyId2) == false) {
    index = this.m_pairs[index].next;
  }

  if (index == box2d.Pair.b2_nullPair) {
    return null;
  }

  //box2d.Settings.b2Assert(index < b2_maxPairs);
  return this.m_pairs[index];
};

/**
  @return {!Array.<box2d.Pair>}
*/
box2d.PairManager.prototype.Commit = function() {
  var i = 0;

  var removeCount = 0;

  var proxies = this.m_broadPhase.proxyPool;

  var contactPairs = [];

  for (i = 0; i < this.m_pairBufferCount; ++i) {
    var pair = this._find(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
    //box2d.Settings.b2Assert(pair.IsBuffered());
    pair.ClearBuffered();

    //box2d.Settings.b2Assert(pair.proxyId1 < box2d.Settings.b2_maxProxies && pair.proxyId2 < box2d.Settings.b2_maxProxies);
    var proxy1 = proxies[pair.proxyId1];
    var proxy2 = proxies[pair.proxyId2];

    //box2d.Settings.b2Assert(proxy1.IsValid());
    //box2d.Settings.b2Assert(proxy2.IsValid());
    if (pair.IsRemoved()) {
      // It is possible a pair was added then removed before a commit. Therefore,
      // we should be careful not to tell the user the pair was removed when the
      // the user didn't receive a matching add.
      if (pair.IsFinal() == true) {
        this.m_callback.PairRemoved(proxy1.userData, proxy2.userData, pair.userData);
      }

      // Store the ids so we can actually remove the pair below.
      this.m_pairBuffer[removeCount].proxyId1 = pair.proxyId1;
      this.m_pairBuffer[removeCount].proxyId2 = pair.proxyId2;
      ++removeCount;
    } else {
      //box2d.Settings.b2Assert(this.m_broadPhase.TestOverlap(proxy1, proxy2) == true);
      if (pair.IsFinal() == false) {
        pair.contactData = this.m_callback.PairAdded(proxy1.userData, proxy2.userData);
        contactPairs.push(pair.contactData);
        pair.SetFinal();
      }
    }
  }

  for (i = 0; i < removeCount; ++i) {
    this.RemovePair(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
  }

  this.m_pairBufferCount = 0;

  if (box2d.BroadPhase.s_validate) {
    this.ValidateTable();
  }

  return contactPairs;
};

box2d.PairManager.Hash = function(proxyId1, proxyId2) {
  var key = ((proxyId2 << 16) & 0xffff0000) | proxyId1;
  key = ~key + ((key << 15) & 0xFFFF8000);
  key = key ^ ((key >> 12) & 0x000fffff);
  key = key + ((key << 2) & 0xFFFFFFFC);
  key = key ^ ((key >> 4) & 0x0fffffff);
  key = key * 2057;
  key = key ^ ((key >> 16) & 0x0000ffff);
  return key;
};
box2d.PairManager.Equals = function(pair, proxyId1, proxyId2) {
  return (pair.proxyId1 == proxyId1 && pair.proxyId2 == proxyId2);
};
box2d.PairManager.EqualsPair = function(pair1, pair2) {
  return pair1.proxyId1 == pair2.proxyId1 && pair1.proxyId2 == pair2.proxyId2;
};
