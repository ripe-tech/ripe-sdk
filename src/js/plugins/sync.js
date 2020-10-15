if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @augments Plugin
 * @classdesc Plugin responsible for applying synchronization rules.
 *
 * @param {Object} rules A Map with synchronization rules to be applied.
 * If defined, overrides the rules defined on the model's config.
 * @param {Object} options An object with options to configure the plugin.
 */
ripe.Ripe.plugins.SyncPlugin = function(rules, options = {}) {
    ripe.Ripe.plugins.Plugin.call(this);

    this.rules = this._normalizeRules(rules);
    this.manual = Boolean(options.manual || rules);
    this.auto = !this.manual;
};

ripe.Ripe.plugins.SyncPlugin.prototype = ripe.build(ripe.Ripe.plugins.Plugin.prototype);
ripe.Ripe.plugins.SyncPlugin.prototype.constructor = ripe.Ripe.plugins.SyncPlugin;

/**
 * The Sync Plugin binds the 'post_config' and 'part' events,
 * in order to:
 * - retrieve the model's configuration.
 * - change the necessary parts making them comply with the syncing rules.
 *
 * @param {Ripe} The Ripe instance in use.
 */
ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // sets the initial set of rules from the owner, in case the
    // auto mode is enabled for the current instance
    this.rules =
        this.auto && owner.loadedConfig
            ? this._normalizeRules(owner.loadedConfig.sync)
            : this.rules;

    // listens for model changes and if the load config option is
    // set then retrieves the new model's post config, otherwise
    // unregisters itself as its rules are no longer valid
    this._postConfigBind = this.manual
        ? null
        : this.owner.bind("post_config", config => {
              this.rules = config ? this._normalizeRules(config.sync) : {};
          });

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this._partBind = this.owner.bind("part", this._applySync.bind(this));
};

/**
 * The unregister to be called (by the owner)
 * the plugins unbinds events and executes
 * any necessary cleanup operation.
 *
 * @param {Ripe} The Ripe instance in use.
 */
ripe.Ripe.plugins.SyncPlugin.prototype.unregister = function(owner) {
    this.owner && this.owner.unbind("part", this._partBind);
    this.owner && this.owner.unbind("post_config", this._postConfigBind);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

/**
 * Traverses the provided rules and transforms string rules
 * into object rules to keep the internal representation
 * of the rules consistent.
 *
 * @param {Array} rules The rules that will be normalized
 * into object rules.
 * @returns {Object} The normalized version of the rules.
 *
 * @ignore
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
 * Checks if any of the sync rules should apply to the
 * provided part, meaning that the other parts of the rule
 * have to be changed accordingly.
 *
 * @param {String} name The name of the part that may be
 * affected by a rule.
 * @param {Object} value The material and color of the part
 * as a object map.
 *
 * @ignore
 */
ripe.Ripe.plugins.SyncPlugin.prototype._applySync = function(name, value) {
    // iterates over the complete set of rules to determine
    // if any of them should apply to the provided part
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
                target.material = _part.material ? _part.material : value.material;
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
 * @returns {Boolean} If the provided rule is valid for the provided
 * part and value (material and color).
 *
 * @ignore
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
