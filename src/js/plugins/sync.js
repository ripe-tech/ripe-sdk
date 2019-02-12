if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    ripe.Ripe.plugins.Plugin.call(this);

    options = options || {};
    this.rules = this._normalizeRules(rules);
    this.manual = options.manual || false;
};

ripe.Ripe.plugins.SyncPlugin.prototype = ripe.build(ripe.Ripe.plugins.Plugin.prototype);
ripe.Ripe.plugins.SyncPlugin.prototype.constructor = ripe.Ripe.plugins.SyncPlugin;

ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // listens for model changes and if the loadConfig option is
    // set then retrieves the new model's config, otherwise
    // unregisters itself as its rules are no longer valid
    this.configBind = this.manual ? null : this.owner.bind("config", async () => {
        this.rules = this._normalizeRules(null);
        const { result } = await this.owner.getConfigP();
        this.rules = this._normalizeRules(result.sync);
        this.trigger("config");
    });

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this._partBind = this.owner.bind("part", this._applySync.bind(this));
};

ripe.Ripe.plugins.SyncPlugin.prototype.unregister = function(owner) {
    this.owner && this.owner.unbind("part", this._partBind);
    this.owner && this.owner.unbind("config", this._configBind);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

/**
 * Traverses the provided rules and transforms string rules
 * into object rules to keep the internal representation
 * of the rules consistent.
 *
 * @param {Array} rules The rules that will be normalized
 * into object rules.
 */
ripe.Ripe.plugins.SyncPlugin.prototype._normalizeRules = function(rules) {
    const _rules = {};

    if (!rules) {
        return _rules;
    }

    for (const ruleName in rules) {
        const rule = rules[ruleName];
        for (let index = 0; index < rule.length; index++) {
            let part = rule[index];
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

/**
 * Checks if any of the sync rules contain the provided part
 * meaning that the other parts of the rule have to
 * be changed accordingly.
 *
 * @param {String} name The name of the part that may be
 * affected by a rule.
 * @param {Object} value The material and color of the part.
 */
ripe.Ripe.plugins.SyncPlugin.prototype._applySync = function(name, value) {
    for (const key in this.rules) {
        // if a part was selected and it is part of
        // the rule then its value is used otherwise
        // the first part of the rule is used
        const rule = this.rules[key];
        const firstPart = rule[0];
        name = name || firstPart.part;
        value = value || this.owner.parts[name];

        // checks if the part triggers the sync rule
        // and skips to the next rule if it doesn't
        if (this._shouldSync(rule, name, value) === false) {
            continue;
        }

        // iterates through the parts of the rule and
        // sets their material and color according to
        // the sync rule in case there's a match
        for (let index = 0; index < rule.length; index++) {
            const _part = rule[index];

            // in case the current rule definition references the current
            // part in rule deinition, ignores the current loop
            if (_part.part === name) {
                continue;
            }

            // tries to find the target part configuration an in case
            // no such part is found throws an error
            const target = this.owner.parts[_part.part];
            if (!target) {
               throw new Error(`Target part for rule not found '${_part.part}'`);
            }

            if (_part.color === undefined) {
                target.material = _part.material
                    ? _part.material
                    : value.material;
            }

            target.color = _part.color ? _part.color : value.color;
        }
    }
};

/**
 * Checks if the sync rule contains the provided part
 * meaning that the other parts of the rule have to
 * be changed accordingly.
 *
 * @param {Object} rule The sync rule that will be checked.
 * @param {String} name The name of the part that may be
 * affected by the rule.
 * @param {Object} value The material and color of the part.
 */
ripe.Ripe.plugins.SyncPlugin.prototype._shouldSync = function(rule, name, value) {
    for (let index = 0; index < rule.length; index++) {
        const rulePart = rule[index];
        const part = rulePart.part;
        const material = rulePart.material;
        const color = rulePart.color;
        const materialSync = !material || material === value.material;
        const colorSync = !color || color === value.color;
        if (part === name && materialSync && colorSync) {
            return true;
        }
    }
    return false;
};
