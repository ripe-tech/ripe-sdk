var ripesdk = ripesdk || {}; //namespace

ripesdk.Interactive = function() {
    // ...
};

//methods
ripesdk.Interactive.prototype.highlightPart = function(element, options) {
    this.element = element;
    this.options = options || {};
};

ripesdk.Interactive.prototype.changeFrame = function(element, options) {
    // ..
};

ripesdk.Interactive.prototype.enterFullscreen = function(element, options) {
    // ..
};

ripesdk.Interactive.prototype.exitFullscreen = function(element, options) {
    // ..
};

// ...
// other methods implementation

ripesdk.Image = function() {
    //...
};

ripesdk.Image.prototype = new ripesdk.Interactive();
ripesdk.Image.constructor = ripesdk.Interactive;
