goog.provide('pl.Stats');

goog.require('goog.dom');
/**
 @param {!string} account_key
 */
pl.Stats.addGoogleAnalytics = function(account_key) {
  // TODO: support SSH
  pl.Stats._addScript('http://www.google-analytics.com/ga.js');
  pl.Stats.gaqPush(['_setAccount', account_key]);
  pl.Stats.gaqPush(['_trackPageview']);
};

/**
 * @param {Array.<Object>|function()} commandArray
 */
pl.Stats.gaqPush = function(commandArray) {
  var gaq = goog.object.get(goog.global, '_gaq', null);
  if (!gaq) {
      goog.object.add(goog.global, '_gaq', gaq = []);
  }
  gaq.push(commandArray);
};

/**
 * @param {string} category
 * @param {string} action
 * @param {string=} opt_label
 * @param {number=} opt_value
 * @return {undefined}
 */
pl.Stats.gaqTrackEvent = function(category, action, opt_label, opt_value) {
  pl.Stats.gaqPush(['_trackEvent', category, action, opt_label, opt_value]);
};

/**
 @param {number} projectId
 @param {!string} securityId
 */
pl.Stats.addStatCounter = function(projectId, securityId) {
  goog.global['sc_project'] = projectId;
  goog.global['sc_security'] = securityId;
  goog.global['sc_invisible'] = 1;

  pl.Stats._addScript('http://www.statcounter.com/counter/counter_xhtml.js');
};

/**
 @private
 @param {!string} script_uri
 */
pl.Stats._addScript = function(script_uri) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = script_uri;

  var heads = document.getElementsByTagName('head');
  if (heads.length != 1) {
      throw Error("Couldn't find a single head tag.");
  }

  var head = heads[0];

  var headScripts = head.getElementsByTagName('script');
  if (headScripts.length == 0) {
      goog.dom.appendChild(head, script);
  } else {
      goog.dom.insertSiblingBefore(script, headScripts[0]);
  }
};
