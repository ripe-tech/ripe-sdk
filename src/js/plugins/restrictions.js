if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.RestrictionsPlugin = function(restrictions, options) {
    ripe.Ripe.plugins.Plugin.call(this);
    options = options || {};
    this.restrictions = restrictions;
    this.restrictionsMap = this._buildRestrictionsMap(restrictions);
    this.loaded = false;
    this.manual = options.manual || false;
    this.token = options.token || ":";
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype = ripe.build(ripe.Ripe.plugins.Plugin.prototype);
ripe.Ripe.plugins.RestrictionsPlugin.prototype.constructor = ripe.Ripe.plugins.RestrictionsPlugin;

ripe.Ripe.plugins.RestrictionsPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    this._configBind = this.owner.bind("config", async () => {
        if (this.manual && this.loaded) {
            this.owner && this.unregister(this.owner);
            return;
        }

        this.loaded = false;
        const { result } = await this.owner.getConfigP();
        this.restrictions = this.manual ? this.restrictions : result.restrictions;
        this.restrictionsMap = this._buildRestrictionsMap(this.restrictions);

        const optionals = [];
        for (const name in result.defaults) {
            const part = result.defaults[name];
            part.optional && optionals.push(name);
        }
        this.optionals = optionals;
        this.partsOptions = result.parts;
        this.loaded = true;
        this.trigger("config");
    });

    // binds to the pre parts event so that the parts can be
    // changed so that they comply with the product's restrictions
    this._partBind = this.owner.bind("part", this._applyRestrictions.bind(this));
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype.unregister = function(owner) {
    this.partsOptions = null;
    this.options = null;
    this.owner && this.owner.unbind("part", this._partBind);
    this.owner && this.owner.unbind("config", this._configBind);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._applyRestrictions = function(name, value) {
    // if the part information has not been loaded yet from the
    // owner's config then does nothing
    if (!this.loaded) {
        return;
    }

    // creates an array with the customization, by copying the
    // current parts environment into a separate array
    const customization = [];
    const partsOptions = ripe.clone(this.partsOptions);
    for (const partName in this.owner.parts) {
        if (name !== undefined && name === partName) {
            continue;
        }
        const part = this.owner.parts[partName];
        customization.push({
            name: partName,
            material: part.material,
            color: part.color
        });
    }

    // if a new part is set it is added at the end so that it
    // has higher priority when solving the restrictions
    const partSet =
        name !== undefined
            ? {
                  name: name,
                  material: value.material,
                  color: value.color
              }
            : null;
    name !== undefined && customization.push(partSet);

    // obtains the new parts and mutates the original
    // parts map to apply the necessary changes
    const newParts = this._solveRestrictions(partsOptions, this.restrictionsMap, customization);

    const changes = [];

    for (let index = 0; index < newParts.length; index++) {
        const newPart = newParts[index];
        const oldPart = this.owner.parts[newPart.name];

        // if a change was made due to the restrictions
        // then adds it to the changes array
        if (oldPart.material !== newPart.material || oldPart.color !== newPart.color) {
            changes.push({
                from: {
                    part: newPart.name,
                    material: oldPart.material,
                    color: oldPart.color
                },
                to: {
                    part: newPart.name,
                    material: newPart.material,
                    color: newPart.color
                }
            });
        }

        oldPart.material = newPart.material;
        oldPart.color = newPart.color;
    }

    // triggers the restrictions event with the set of changes in the
    // domain and the possible part set that triggered those changes
    this.trigger("restrictions", changes, partSet);
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
    const newPart = customization.pop();
    if (this._isRestricted(newPart, restrictions, solution) === false) {
        solution.push(newPart);
        return this._solveRestrictions(availableParts, restrictions, customization, solution);
    }

    // if the part is restricted then tries to retrieve an alternative option,
    // if an alternative is found then adds it to the customization and proceeds
    // with it, otherwise an invalid state was reached and an empty solution
    // is returned, meaning that there is no option for the current customization
    // that would comply with the restrictions
    const newPartOption = this._alternativeFor(newPart, availableParts, true);
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
    const restrictionsMap = {};

    if (!restrictions) {
        return restrictionsMap;
    }

    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    for (let index = 0; index < restrictions.length; index++) {
        // in case the restriction is considered to be a single one
        // then this is a special (all cases excluded one) and must
        // be treated as such (true value set in the map value)
        const restriction = restrictions[index];
        if (restriction.length === 1) {
            const _restriction = restriction[0];
            const key = this._getRestrictionKey(
                _restriction.part,
                _restriction.material,
                _restriction.color
            );
            restrictionsMap[key] = true;
            continue;
        }

        // iterates over all the items in the restriction to correctly
        // populate the restrictions map with the restrictive values
        for (let _index = 0; _index < restriction.length; _index++) {
            const item = restriction[_index];

            const material = item.material;
            const color = item.color;
            const materialColorKey = this._getRestrictionKey(null, material, color);

            for (let __index = 0; __index < restriction.length; __index++) {
                const _item = restriction[__index];
                const _material = _item.material;
                const _color = _item.color;
                const _key = this._getRestrictionKey(null, _material, _color);

                if (__index === _index) {
                    continue;
                }

                const sequence = restrictionsMap[materialColorKey] || [];
                sequence.push(_key);
                restrictionsMap[materialColorKey] = sequence;
            }
        }
    }

    return restrictionsMap;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._isRestricted = function(
    newPart,
    restrictions,
    parts
) {
    const name = newPart.name;
    const material = newPart.material;
    const color = newPart.color;
    const partKey = this._getRestrictionKey(name);
    const materialKey = this._getRestrictionKey(null, material, null);
    const colorKey = this._getRestrictionKey(null, null, color);
    const materialColorKey = this._getRestrictionKey(null, material, color);
    const materialRestrictions = restrictions[materialKey];
    const colorRestrictions = restrictions[colorKey];
    let keyRestrictions = restrictions[materialColorKey] || [];
    let restricted = restrictions[partKey] !== undefined;
    restricted |= materialRestrictions === true;
    restricted |= colorRestrictions === true;
    restricted |= keyRestrictions === true;
    if (restricted) {
        return true;
    }

    keyRestrictions =
        materialRestrictions instanceof Array
            ? keyRestrictions.concat(materialRestrictions)
            : keyRestrictions;
    keyRestrictions =
        colorRestrictions instanceof Array
            ? keyRestrictions.concat(colorRestrictions)
            : keyRestrictions;

    for (let index = 0; index < keyRestrictions.length; index++) {
        const restriction = keyRestrictions[index];
        for (let _index = 0; _index < parts.length; _index++) {
            const part = parts[_index];
            if (part.name === name) {
                continue;
            }

            const restrictionKeys = [
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
    let part = null;
    const partsS = [];
    for (let index = 0; index < parts.length; index++) {
        part = parts[index];
        partsS.push(part.name);
    }

    // iterates through the part options and checks
    // if all of them are set
    for (let index = 0; index < this.partsOptions.length; index++) {
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
    let part = null;
    let color = null;
    let colors = null;
    let materialsIndex = null;

    // finds the index of the part to use it as the starting
    // point of the search for an alternative
    for (let index = 0; index < availableParts.length; index++) {
        const _part = availableParts[index];
        if (_part.name !== newPart.name) {
            continue;
        }
        part = _part;
        const materials = part.materials;
        for (let _index = 0; _index < materials.length; _index++) {
            const material = materials[_index];
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
    let indexM = null;
    while (indexM !== materialsIndex) {
        indexM = indexM === null ? materialsIndex : indexM;

        const material = part.materials[indexM];
        colors = material.colors;
        for (let index = 0; index < colors.length; index++) {
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
            const alternative = {
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
