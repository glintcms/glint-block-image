/**
 * Module dependencies.
 */
var debug = require('debug')('glint-block-image');
var fs = require('fs');
var merge = require('utils-merge');

var dot = require('dot');

var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');

var loadScript = require('load-script');
var loadStyle = require('load-style');

var c = require('./config');
var template = fs.readFileSync(__dirname + '/index.dot', 'utf-8');

var compiled = dot.template(template);


/**
 * Expose ImageBlock element.
 */
exports = module.exports = ImageBlock;

/**
 * Initialize a new `ImageBlock` element.
 * @param {Object} options object
 */
function ImageBlock(options) {
  if (!(this instanceof ImageBlock)) return new ImageBlock(options);

  merge(this, c);
  merge(this, options);
}

/**
 * API functions.
 */
ImageBlock.prototype.api = ImageBlock.api = 'block-provider';

ImageBlock.prototype.place = function() {
  return 'wherever';
};

ImageBlock.prototype.load = function(content) {
  var self = this;
  debug('load', self.style, self.scriptFabric, self.scriptDarkroom);
  if (typeof content === 'undefined' || typeof content === 'null') return;
  this.content = content;
  this.setContent(this.content);
  return this.content;
};

ImageBlock.prototype.edit = function() {
  var self = this;
  debug('edit', self.style, self.scriptFabric, self.scriptDarkroom);

  var el = self.el;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  function initDarkroom() {

    debug('load darkroom');

    var dkrm = new Darkroom(self.el, {
      // Size options
      minWidth: width,
      minHeight: height,
      maxWidth: width,
      maxHeight: height,
      ratio: width / height,
      backgroundColor: 'transparent',
      // Plugins options
      plugins: {
        //save: false,
        crop: {
          quickCropKey: 67, //key "c"
          minHeight: 50,
          maxHeight: 50,
          minWidth: 50,
          maxWidth: 50,

          //ratio: width / height
        }
      },
      // Post initialize script
      initialize: function() {
        var cropPlugin = this.plugins['crop'];
        // cropPlugin.selectZone(170, 25, 300, 300);
        cropPlugin.requireFocus();
      }
    });

  }

  loadScript(self.scriptFabric, {async: false}, function(err, result) {
    debug('loaded fabric', err, result);
    loadScript(self.scriptDarkroom, {async: false}, function(err, result) {
      debug('loaded darkroom', err, result);
      loadStyle(self.style);
      initDarkroom();
    })
  })

};

ImageBlock.prototype.save = function() {
  // save all nested blocks
  this.content = this.getContent();
  return this.content;
};

/**
 * Base functions.
 */

ImageBlock.prototype.getContent = function() {
  return this.el.getAttribute('src');
};

ImageBlock.prototype.setContent = function(content) {
  this.el.setAttribute('src', content);
};
