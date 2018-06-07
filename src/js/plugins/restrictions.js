if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base"); // eslint-disable-line no-redeclare
    var ripe = base.ripe; // eslint-disable-line no-redeclare
}

ripe.Ripe.plugins.RestrictionsPlugin = function(restrictions, options) {
    options = options || {};
    this.token = options.token || ":";
    this.restrictions = restrictions;
    this.restrictionsMap = this._buildRestrictionsMap(restrictions);
    this.partCallback = this._applyRestrictions.bind(this);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.RestrictionsPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    this.owner.getConfig({}, function(config) {
        this.partsOptions = config.parts;
        var optionals = [];
        for (var name in config.defaults) {
            var part = config.defaults[name];
            part.optional && optionals.push(name);
        }
        this.optionals = optionals;

        // binds to the pre parts event so that the parts can be
        // changed so that they comply with the product's restrictions
        this.owner.bind("part", this.partCallback);

        // resets the current selection to trigger
        // the restrictions operation
        var initialParts = ripe.clone(this.owner.parts);
        this.owner.setParts(initialParts);
    }.bind(this));

    this.owner.bind("config", function() {
        this.unregister(this.owner);
    }.bind(this));
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype.unregister = function(owner) {
    this.partsOptions = null;
    this.options = null;
    this.owner.unbind("part", this.partCallback);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._applyRestrictions = function(name, value) {
    // creates an array with the customization. If a new
    // part is set it is added at the end so that it has
    // priority when solving the restrictions
    var partsOptions = ripe.clone(this.partsOptions);
    var customization = [];
    for (var partName in this.owner.parts) {
        if (name !== undefined && name === partName) {
            continue;
        }
        var part = this.owner.parts[partName];
        customization.push({
            name: partName,
            material: part.material,
            color: part.color
        });
    }
    name !== undefined && customization.push({
        name: name,
        material: value.material,
        color: value.color
    });

    // obtains the new parts and mutates the original
    // parts map to apply the necessary changes
    var newParts = this._solveRestrictions(
        partsOptions,
        this.restrictionsMap,
        customization
    );
    for (var index = 0; index < newParts.length; index++) {
        var newPart = newParts[index];
        this.owner.parts[newPart.name].material = newPart.material;
        this.owner.parts[newPart.name].color = newPart.color;
    }
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._solveRestrictions = function(
    availableParts,
    restrictions,
    customization,
    solution
) {
    // if all the parts are set then a solution has been found
    // and it is returned
    solution = solution || [];
    if (customization.length === 0 && this._isComplete(solution)) {
        return solution;
    }

    // retrieves a part from the customization and checks if it is
    // being restricted by any of the validated parts, if there is
    // no restriction then adds the part to the solution array and
    // proceeds to the next part
    var newPart = customization.pop();
    if (this._isRestricted(newPart, restrictions, solution) === false) {
        solution.push(newPart);
        return this._solveRestrictions(availableParts, restrictions, customization, solution);
    }

    // if the part is restricted then tries to retrieve an alternative option,
    // if an alternative is found then adds it to the customization and proceeds
    // with it, otherwise an invalid state was reached and an empty solution
    // is returned, meaning that there is no option for the current customization
    // that would comply with the restrictions
    var newPartOption = this._alternativeFor(newPart, availableParts, true);
    if (newPartOption === null) {
        return [];
    }
    customization.push(newPartOption);
    return this._solveRestrictions(availableParts, restrictions, customization, solution);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._getRestrictionKey = function(
    part,
    material,
    color,
    token
) {
    token = token || this.token;
    part = part || "";
    material = material || "";
    color = color || "";
    return part + token + material + token + color;
};

/**
 * Maps the restrictions array into a dictionary where restrictions
 * are associated by key with eachother for easier use.
 * For example, '[[{ material: "nappa"}, { material: "suede"}]]'
 * turns into '{ "nappa": ["suede"], "suede": ["nappa"] }'.
 *
 * @param {Array} restrictions The array of restrictions defined by an
 * object of incompatible materials/colors.
 * @return {Object} A map that associates the restricted keys with the
 * array of associated restrictions.
 */
ripe.Ripe.plugins.RestrictionsPlugin.prototype._buildRestrictionsMap = function(restrictions) {
    var restrictionsMap = {};

    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    for (var index = 0; index < restrictions.length; index++) {
        // in case the restriction is considered to be a single one
        // then this is a special (all cases excluded one) and must
        // be treated as such (true value set in the map value)
        var restriction = restrictions[index];
        if (restriction.length === 1) {
            var _restriction = restriction[0];
            var key = this._getRestrictionKey(
                _restriction.part,
                _restriction.material,
                _restriction.color
            );
            restrictionsMap[key] = true;
            continue;
        }

        // iterates over all the items in the restriction to correctly
        // populate the restrictions map with the restrictive values
        for (var _index = 0; _index < restriction.length; _index++) {
            var item = restriction[_index];

            var material = item.material;
            var color = item.color;
            var materialColorKey = this._getRestrictionKey(
                null,
                material,
                color
            );

            for (var __index = 0; __index < restriction.length; __index++) {
                var _item = restriction[__index];
                var _material = _item.material;
                var _color = _item.color;
                var _key = this._getRestrictionKey(null, _material, _color);

                if (_key === materialColorKey) {
                    continue;
                }

                var sequence = restrictionsMap[materialColorKey] || [];
                sequence.push(_key);
                restrictionsMap[materialColorKey] = sequence;
            }
        }
    }

    return restrictionsMap;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._isRestricted = function(newPart, restrictions, parts) {
    var name = newPart.name;
    var material = newPart.material;
    var color = newPart.color;
    var partKey = this._getRestrictionKey(name);
    var materialKey = this._getRestrictionKey(null, material, null);
    var colorKey = this._getRestrictionKey(null, null, color);
    var materialColorKey = this._getRestrictionKey(null, material, color);
    var materialRestrictions = restrictions[materialKey];
    var colorRestrictions = restrictions[colorKey];
    var keyRestrictions = restrictions[materialColorKey] || [];
    var restricted = restrictions[partKey] !== undefined;
    restricted |= materialRestrictions === true;
    restricted |= colorRestrictions === true;
    restricted |= keyRestrictions === true;
    if (restricted) {
        return true;
    }

    keyRestrictions =
        materialRestrictions instanceof Array ? keyRestrictions.concat(materialRestrictions) : keyRestrictions;
    keyRestrictions =
        colorRestrictions instanceof Array ? keyRestrictions.concat(colorRestrictions) : keyRestrictions;

    for (var index = 0; index < keyRestrictions.length; index++) {
        var restriction = keyRestrictions[index];
        for (var _index = 0; _index < parts.length; _index++) {
            var part = parts[_index];
            if (part.name === name) {
                continue;
            }

            var restrictionKeys = [
                this._getRestrictionKey(null, part.material),
                this._getRestrictionKey(null, null, part.color),
                this._getRestrictionKey(null, part.material, part.color)
            ];
            if (restrictionKeys.indexOf(restriction) !== -1) {
                return true;
            }
        }
    }

    return false;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._isComplete = function(parts) {
    // iterates through the parts array and creates
    // an array with the names of the parts for
    // easier searching
    var part = null;
    var partsS = [];
    for (var index = 0; index < parts.length; index++) {
        part = parts[index];
        partsS.push(part.name);
    }

    // iterates through the part options and checks
    // if all of them are set
    for (index = 0; index < this.partsOptions.length; index++) {
        part = this.partsOptions[index];
        if (partsS.indexOf(part.name) === -1) {
            return false;
        }
    }

    return true;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._alternativeFor = function(
    newPart,
    availableParts,
    pop
) {
    pop = pop || false;
    var part = null;
    var color = null;
    var colors = null;
    var materialsIndex = null;

    // finds the index of the part to use it as the starting
    // point of the search for an alternative
    for (var index = 0; index < availableParts.length; index++) {
        var _part = availableParts[index];
        if (_part.name !== newPart.name) {
            continue;
        }
        part = _part;
        var materials = part.materials;
        for (var _index = 0; _index < materials.length; _index++) {
            var material = materials[_index];
            if (material.name !== newPart.material) {
                continue;
            }

            materialsIndex = _index;
            colors = material.colors;
            break;
        }
        break;
    }

    // tries to retrieve an alternative option, giving
    // priority to the colors of its material
    var indexM = null;
    while (indexM !== materialsIndex) {
        indexM = indexM === null ? materialsIndex : indexM;

        material = part.materials[indexM];
        colors = material.colors;
        for (index = 0; index < colors.length; index++) {
            color = colors[index];
            if (indexM === materialsIndex && color === newPart.color) {
                continue;
            }

            // if pop is set to true then removes the alternative
            // from the available parts list so that it is not
            // used again to avoid infinite loops
            if (pop) {
                colors.splice(index, 1);
            }
            var alternative = {
                name: newPart.name,
                material: material.name,
                color: color
            };
            return alternative;
        }
        indexM = (indexM + 1) % part.materials.length;
    }

    // if no alternative is found and this part is
    // optional then the part is removed
    if (this.optionals.indexOf(newPart.name) !== -1) {
        return {
            name: newPart.name,
            material: null,
            color: null
        };
    }

    return null;
};
