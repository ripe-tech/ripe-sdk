if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base"); // eslint-disable-line no-redeclare
    var ripe = base.ripe; // eslint-disable-line no-redeclare
}

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = this._buildRules(rules);
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

ripe.Ripe.plugins.SyncPlugin.prototype._buildRules = function(rules) {
    var _rules = {};
    for (var ruleName in rules) {
        var rule = rules[ruleName];
        for (var index = 0; index < rule.length; index++) {
            var part = rule[index];
            if (typeof part === "string") {
                part = {
                    part: part
                };
                rule[index] = part;
            }
        }
        _rules[ruleName] = rule;
    }
    return _rules;
};

ripe.Ripe.plugins.SyncPlugin.prototype._applySync = function(name, value) {
    for (var key in this.rules) {
        // if a part was selected and it is part of
        // the rule then its value is used otherwise
        // the first part of the rule is used
        var rule = this.rules[key];
        var firstPart = rule[0];
        name = name || firstPart.part;
        value = value || this.owner.parts[name];

        // checks if the part triggers the sync rule
        // and skips to the next rule if it doesn't
        if (this._shouldSync(rule, name, value) === false) {
            continue;
        }

        // iterates through the parts of the rule and
        // sets their material and color according to
        // the sync rule
        for (var index = 0; index < rule.length; index++) {
            var _part = rule[index];
            if (_part.part === name) {
                continue;
            }
            if (_part.color === undefined) {
                this.owner.parts[_part.part].material = _part.material ? _part.material : value.material;
            }
            this.owner.parts[_part.part].color = _part.color ? _part.color : value.color;
        }
    }
};

ripe.Ripe.plugins.SyncPlugin.prototype._shouldSync = function(rule, name, value) {
    for (var index = 0; index < rule.length; index++) {
        var rulePart = rule[index];
        var part = rulePart.part;
        var material = rulePart.material;
        var color = rulePart.color;
        var materialSync = !material || material === value.material;
        var colorSync = !color || color === value.color;
        if (part === name && materialSync && colorSync) {
            return true;
        }
    }
    return false;
};
