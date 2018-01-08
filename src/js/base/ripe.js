if (typeof require !== "undefined") {
    var base = require("./base");
    require("./observable");
    var ripe = base.ripe;
}

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = Object.create(ripe.Observable.prototype);

ripe.Ripe.prototype.init = function(brand, model, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.brand = brand;
    this.model = model;
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.parts = this.options.parts || {};
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.noDefaults = this.options.noDefaults === undefined ? false : this.options.noDefaults;
    this.useDefaults = this.options.useDefaults === undefined ? !this.noDefaults : this.options.useDefaults;
    this.noCombinations = this.options.noCombinations === undefined ? false : this.options.noCombinations;
    this.useCombinations = this.options.useCombinations === undefined ? !this.noCombinations : this.options.useCombinations;
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;
    this.children = [];
    this.ready = false;

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && this.useDefaults;
    var loadParts = loadDefaults ? this.getDefaults : function(callback) {
        setTimeout(callback);
    };
    loadParts.call(this, function(result) {
        result = result || this.parts;
        this.parts = result;
        this.ready = true;
        this.update();
        this.trigger("parts", this.parts);
    }.bind(this));

    // loads the config information of the model then
    // builds the restrictions map and saves it
    this.getConfig(function(config) {
        this.config = config;
        this.restrictions = config["restrictions"] || [];
        this.restrictionsMap = this._buildRestrictionsMap(this.restrictions);
    });

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = this.useCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this.trigger("combinations", this.combinations);
    }.bind(this));

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    if (noUpdate) {
        return;
    }
    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }

    if (noUpdate) {
        return;
    }

    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.getFrames = function(callback) {
    if (this.options.frames) {
        callback(this.options.frames);
        return;
    }

    this.getConfig(function(config) {
        var frames = {};
        var faces = config["faces"];
        for (var index = 0; index < faces.length; index++) {
            var face = faces[index];
            frames[face] = 1;
        }

        var sideFrames = config["frames"];
        frames["side"] = sideFrames;
        callback && callback(frames);
    });
};

ripe.Ripe.prototype.getOptions = function(callback) {
    var unrestrictedParts = [];
    var parts = this.config.parts;
    for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        var partName = part.name;
        var partKey = ripe.getTripletKey(partName);
        var partRestricted = this.restrictionsMap[partKey] ? true : false;
        if (partRestricted) {
            continue;
        }
        var materials = part.materials;
        var newMaterials = this._getUnrestrictedMaterials(partName, materials);
        var newPart = {
            name: partName,
            materials: newMaterials
        };
        unrestrictedParts.push(newPart);
    }
    callback && callback(unrestrictedParts);
};

ripe.Ripe.prototype._getUnrestrictedMaterials = function(part, values) {
    // iterates over the complete set of parts, to creates the list of
    // states that exist for the complete set of parts
    var keysList = [];
    for (var index in this.parts) {
        // in case the current state in iteration refers the part
        // that is currently under selection there's no need for
        // restricting its domain as the selection would unselect
        // the trigger of the restriction
        if (index === part) {
            continue;
        }

        // retrieves both the material and the color for the current
        // selection and builds the key string for such combination
        var value = this.parts[index];
        var material = value.material;
        var color = value.color;
        var materialKey = ripe.getTripletKey(null, material, null);
        var colorKey = ripe.getTripletKey(null, null, color);
        var materialColorKey = ripe.getTripletKey(null, material, color);

        // verifies if the key of the combination and its componentes are
        // already included in the keys list and adds them if they aren't
        keysList.indexOf(materialKey) === -1 && keysList.push(materialKey);
        keysList.indexOf(colorKey) === -1 && keysList.push(colorKey);
        keysList.indexOf(materialColorKey) === -1 && keysList.push(materialColorKey);
    };

    // checks if any of the possible materials
    // are restricted and removes them
    var unrestrictedValues = [];
    for (var index = 0; index < values.length; index++) {
        // retrieves the material key and its restrictions
        var value = values[index];
        var newValue = ripe.assign({}, value);
        var material = value.name;
        var materialKey = ripe.getTripletKey(null, material);
        var materialRestrictions = this.restrictionsMap[materialKey];

        // checks if the material has a global restriction
        // or is being restricted by other material currently
        // on the shoe and ignores it if it is
        var validMaterial = true;
        if (materialRestrictions === true) {
            validMaterial = false;
        } else if (materialRestrictions) {
            for (var _index = 0; _index < materialRestrictions.length; _index++) {
                var restriction = materialRestrictions[_index];
                if (keysList.indexOf(restriction) > -1) {
                    validMaterial = false;
                }
            }
        }
        if (validMaterial === false) {
            continue;
        }

        // iterates over the material's colors
        // to retrieve the valid colors
        var colors = value.colors;
        var newColors = colors.filter(function(color) {
            // ignores the color if it has a global restriction
            // or is being restricted by other color
            var colorKey = ripe.getTripletKey(null, null, color);
            var colorRestrictions = this.restrictionsMap[colorKey];
            if (colorRestrictions === true) {
                return false;
            } else if (colorRestrictions) {
                for (var index = 0; index < colorRestrictions.length; index++) {
                    var restriction = colorRestrictions[index];
                    if (keysList.indexOf(restriction) > -1) {
                        return;
                    }
                }
            }

            // retrieves the material-color combination
            // key and its restrictions and validates
            // the color if there are no restrictions
            var materialColorKey = ripe.getTripletKey(null, material, color);
            var keyRestrictions = this.restrictionsMap[materialColorKey];
            if (!keyRestrictions) {
                return true;
            } else if (keyRestrictions.length === 0 || keyRestrictions === true) {
                return false;
            }

            // checks if any of the combination's
            // restrictions are active
            for (var index = 0; index < keyRestrictions.length; index++) {
                var restriction = keyRestrictions[index];
                if (keysList.indexOf(restriction) > -1) {
                    return false;
                }
            }
            return true;
        }.bind(this));

        // updates the valid colors
        newValue.colors = newColors;
        unrestrictedValues.push(newValue);
    };
    return unrestrictedValues;
};

ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

ripe.Ripe.prototype.bindConfigurator = function(element, options) {
    var config = new ripe.Configurator(this, element, options);
    return this.bindInteractable(config);
};

ripe.Ripe.prototype.bindInteractable = function(child) {
    this.children.push(child);
    return child;
};

ripe.Ripe.prototype.selectPart = function(part, options) {
    this.trigger("selected_part", part);
};

ripe.Ripe.prototype.deselectPart = function(part, options) {
    this.trigger("deselected_part", part);
};

ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts
    };
};

ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready && this.usePrice && this.getPrice(function(value) {
        this.trigger("price", value);
    }.bind(this));
};

ripe.Ripe.prototype._buildRestrictionsMap = function(restrictions) {
    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    var restrictionsMap = {};
    restrictions.forEach(function(restriction) {
        // in case the restriction is considered to be a single one
        // then this is a special (all cases excluded one) and must
        // be treated as such (true value set in the map value)
        if (restriction.length === 1) {
            var _restriction = restriction[0];
            var key = ripe.getTripletKey(_restriction.part, _restriction.material,
                _restriction.color);
            restrictionsMap[key] = true;
            return;
        }

        // iterates over all the items in the restriction to correctly
        // populate the restrictions map with the restrictive values
        for (var index = 0; index < restriction.length; index++) {
            var item = restriction[index];

            var material = item.material;
            var color = item.color;
            var materialColorKey = ripe.getTripletKey(null, material, color);

            for (var _index = 0; _index < restriction.length; _index++) {
                var _item = restriction[_index];

                var _material = _item.material;
                var _color = _item.color;
                var _key = ripe.getTripletKey(null, _material, _color);

                if (_key === materialColorKey) {
                    continue;
                }

                var sequence = restrictionsMap[materialColorKey] || [];
                sequence.push(_key);
                restrictionsMap[materialColorKey] = sequence;
            }
        }
    });
    return restrictionsMap;
};

var Ripe = ripe.Ripe;
