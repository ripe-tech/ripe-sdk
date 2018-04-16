if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = rules;
};

ripe.Ripe.plugins.SyncPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this.owner.bind("part", function(newPart) {
        for (var key in this.rules) {
            // if a part was selected and it is part of
            // the rule then its value is used otherwise
            // the first part of the rule is used
            var rule = this.rules[key];
            var part = newPart && rule.indexOf(newPart.name) !== -1 ? newPart.name : rule[0];
            var value = this.owner.parts[part];

            // iterates through the parts of the rule and
            // sets their material and color to be the same
            // of the reference part
            for (var index = 0; index < rule.length; index++) {
                var _part = rule[index];
                this.owner.parts[_part].material = value.material;
                this.owner.parts[_part].color = value.color;
            }
        }
    }.bind(this));

    // resets the current selection to trigger the sync operation
    var initialParts = ripe.clone(this.owner.parts);
    this.owner.setParts(initialParts);
};
