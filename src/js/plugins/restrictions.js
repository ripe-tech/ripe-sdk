ripe.plugins = ripe.plugins || {};

ripe.plugins.Restrictions = function(owner, restrictions, partsOptions, options) {
    options = options || {};
    this.token = options.token || ":";
    this.owner = owner;
    this.restrictions = restrictions;
    this.restrictionsMap = this._buildRestrictionsMap(restrictions);
    this.partsOptions = partsOptions;

    // binds to the pre parts event so that the parts can be
    // changed so that they comply with the product's restrictions
    this.owner.bind("pre_parts", function(parts, newPart) {
        // creates an array with the customization. If a new
        // part is set it is added at the end so that it has
        // priority when solving the restrictions
        var partsOptions = ripe.clone(this.partsOptions);
        var customization = [];
        for (var name in parts) {
            if (newPart !== undefined && newPart.name === name) {
                continue;
            }
            var part = parts[name];
            customization.push({
                name: name,
                material: part.material,
                color: part.color
            });
        }
        newPart !== undefined && customization.push(newPart);

        // obtains the new parts and mutates the original
        // parts map to apply the necessary changes
        var newParts = this._solveRestrictions(
            partsOptions,
            this.restrictionsMap,
            customization
        );
        for (var index = 0; index < newParts.length; index++) {
            var newPart = newParts[index];
            parts[newPart.name].material = newPart.material;
            parts[newPart.name].color = newPart.color;
        }
    }.bind(this));
};

ripe.plugins.Restrictions.prototype._solveRestrictions = function(
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

    // Retrieves a part from the customization and checks if it is
    // being restricted by any of the validated parts. If there is
    // no restriction then adds the part to the solution array and
    // proceeds to the next part.
    var newPart = customization.pop();
    if (this._isRestricted(newPart, restrictions, solution) === false) {
        solution.push(newPart);
        return this._solveRestrictions(availableParts, restrictions, customization, solution);
    }

    // If the part is restricted then tries to retrieve an alternative option.
    // If no alternative is found then an invalid state was reached and an empty
    // solution is returned, otherwise tries to proceed with the alternative option.
    else {
        var newPartOption = this._alternativeFor(newPart, restrictions, availableParts, true);
        if (newPartOption === null) {
            return [];
        }
        customization.push(newPartOption);
        return this._solveRestrictions(availableParts, restrictions, customization, solution);
    }
};

ripe.plugins.Restrictions.prototype._getRestrictionKey = function(
    part,
    material,
    color,
    token
) {
    var token = token || this.token;
    part = part || "";
    material = material || "";
    color = color || "";
    return part + token + material + token + color;
};

ripe.plugins.Restrictions.prototype._buildRestrictionsMap = function(restrictions) {
    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    var restrictionsMap = {};
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

ripe.plugins.Restrictions.prototype._isRestricted = function(newPart, restrictions, parts) {
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
    var restricted = restrictions[partKey] ? true : false;
    restricted |= materialRestrictions === true ? true : false;
    restricted |= colorRestrictions === true ? true : false;
    restricted |= keyRestrictions === true ? true : false;
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

ripe.plugins.Restrictions.prototype._isComplete = function(parts) {
    var partsS = [];
    for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        partsS.push(part.name);
    }

    for (var index = 0; index < this.partsOptions.length; index++) {
        var part = this.partsOptions[index];
        if (partsS.indexOf(part.name) === -1) {
            return false;
        }
    }

    return true;
};

ripe.plugins.Restrictions.prototype._alternativeFor = function(
    newPart,
    restrictions,
    availableParts,
    pop
) {
    pop = pop || false;
    var part = null;
    var partIndex = null;
    var materialsIndex = null;
    var colorsIndex = null;

    // finds the index of the part to use it as the starting
    // point of the search for an alternative
    for (var index = 0; index < availableParts.length; index++) {
        var _part = availableParts[index];
        if (_part.name !== newPart.name) {
            continue;
        }
        partIndex = index;
        part = _part;
        var materials = part.materials;
        for (var indexM = 0; indexM < materials.length; indexM++) {
            var material = materials[indexM];
            if (material.name !== newPart.material) {
                continue;
            }

            materialsIndex = indexM;
            var colors = material.colors;
            for (var indexC = 0; indexC < colors.length; indexC++) {
                var color = colors[indexC];
                if (color.name === newPart.color) {
                    colorsIndex = indexC;
                    break;
                }
            }
            break;
        }
        break;
    }

    // tries to retrieve an alternative option, giving
    // priority to the colors of its material
    var indexM = materialsIndex;
    do {
        var material = part.materials[indexM];
        var colors = material.colors;
        for (var indexC = 0; indexC < colors.length; indexC++) {
            var color = colors[indexC];
            if (color === newPart.color) {
                continue;
            }

            // if pop is set to true then removes the alternative
            // from the available parts list so that it is not
            // used again to avoid infinite loops
            if (pop) {
                colors.splice(indexC, 1);
            }
            var alternative = {
                name: newPart.name,
                material: material.name,
                color: color
            };
            return alternative;
        }
        indexM = (indexM + 1) % part.materials.length;
    } while (indexM !== materialsIndex);

    return null;
};
