if (typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = rules;
    this.partCallback = this._applySync.bind(this);
};

ripe.Ripe.plugins.SyncPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this.owner.bind("part", this.partCallback);

    // resets the current selection to trigger the sync operation
    var initialParts = ripe.clone(this.owner.parts);
    this.owner.setParts(initialParts);
};

ripe.Ripe.plugins.SyncPlugin.prototype.unregister = function(owner) {
    this.owner.unbind("part", this.partCallback);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.SyncPlugin.prototype._applySync = function(name, value) {
    for (var key in this.rules) {
        // if a part was selected and it is part of
        // the rule then its value is used otherwise
        // the first part of the rule is used
        var rule = this.rules[key];
        var part = name && rule.indexOf(name) !== -1 ? name : rule[0];
        var partValue = this.owner.parts[part];

        // iterates through the parts of the rule and
        // sets their material and color to be the same
        // of the reference part
        for (var index = 0; index < rule.length; index++) {
            var _part = rule[index];
            this.owner.parts[_part].material = partValue.material;
            this.owner.parts[_part].color = partValue.color;
        }
    }
};
