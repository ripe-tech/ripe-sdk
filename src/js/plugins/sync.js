ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = rules;
}

ripe.Ripe.plugins.SyncPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.SyncPlugin.prototype.setOwner = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.setOwner.call(this, owner);

    // binds to the pre parts event so the parts can be changed
    // so that they comply with the product's sync rules
    this.owner.bind("pre_parts", function(parts, newPart) {
        for (var key in this.rules) {
            // if a part was selected and it is part of
            // the rule then its value is used otherwise
            // the first part of the rule is used
            var rule = this.rules[key];
            var part = newPart && rule.indexOf(newPart.name) !== -1 ? newPart.name : rule[0];
            var value = parts[part];

            // iterates through the parts of the rule and
            // sets their material and color to be the same
            // of the reference part
            for (var index = 0; index < rule.length; index++) {
                var _part = rule[index];
                parts[_part].material = value.material;
                parts[_part].color = value.color;
            }
        }
    }.bind(this));
}
