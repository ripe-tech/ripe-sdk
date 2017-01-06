var Ripe = function(url, options) {
    this.init(url, options);
};

Ripe.prototype.init = function(url, options) {
    this.url = url;
    this.options = options;
};

Ripe.prototype.render = function(frame, model, config, target) {
    var frame = frame || 0;
    var model = model || this.options.model;
    var config = config || this.options.config;
    var target = target || this.options.target;
    var element = document.getElementById(id);
    //element.url = // todo must create the proper url
};
