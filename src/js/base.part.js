var Ripe = function(url, brand, model, variant, options) {
    this.init(url, brand, model, variant, options);
};

Ripe.prototype.init = function(url, brand, model, variant, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.brand = brand;
    this.model = model;
    this.variant = variant;
    this.options = options || {};
    this.frames = options.frames;
    this.parts = options.parts;
    this.options.size = this.options.size || 1000;
    this.options.maxSize = this.options.maxSize || 1000;
    this.options.sensitivity = this.options.sensitivity || 40;
    this.frameBinds = {};
    this.callbacks = {};
    this.ready = false;

    // retrieves the configuration information for this product
    this.getConfig(function(config) {
        this.config = config;
    });

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && !this.options.noDefaults;
    loadDefaults && this.getDefaults(function(result) {
        this.parts = result;
        this.ready = true;
        this.update();
        this._runCallbacks("parts", this.parts);
    });

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start
    // the loading process for them, setting then the result in
    // the instance and builds a combinations map for easier use
    var loadCombinations = !options.noCombinations;
    loadCombinations && this.loadCombinations();

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

Ripe.prototype.load = function() {
    this.update();
};

Ripe.prototype.unload = function() {};

Ripe.prototype.loadCombinations = function(callback) {
    this.getCombinations(function(result) {
        this.combinations = result;
        this.combinationsMap = {};
        for (var index = 0; index < this.combinations.length; index++) {
            var combination = this.combinations[index];
            var part = combination[0];
            var material = combination[1];
            var color = combination[2];
            var partMaterials = this.combinationsMap[part] || {};
            var materialColors = partMaterials[material] || [];
            color && materialColors.push(color);
            partMaterials[material] = materialColors;
            this.combinationsMap[part] = partMaterials;
        }
        this.update();
        this._runCallbacks("combinations", this.combinations);
        callback && callback(this.combinationsMap);
    });
};

Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    !noUpdate && this.update();
};

Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }!noUpdate && this.update();
};

Ripe.prototype.getOptions = function(callback) {
    var self = this;
    var callbacks = [];
    this.combinationsMap === undefined && callbacks.push(this.loadCombinations.bind(this));
    this.restrictions === undefined && callbacks.push(this.getRestrictions.bind(this));
    if (callbacks.length > 0) {
        this._waitCallbacks(callbacks, function() {
            self.getOptions(callback);
        });
        return;
    }

    var getUnrestrictedValues = function(part, materials) {
        var keysList = [];

        // iterates over the complete set of parts, to creates the list of
        // states that exist for the complete set of parts
        var partList = Object.keys(self.parts);
        for (var index = 0; index < partList.length; index++) {
            // in case the current state in iteration refers the part
            // that is currently under selection there's no need for
            // restricting its domain as the selection would unselect
            // the trigger of the restriction
            var currentPart = partList[index];
            if (currentPart === part) {
                continue;
            }

            // retrieves both the material and the color for the current
            // selection and builds the key string for such combination
            var value = self.parts[currentPart];
            var material = value.material;
            var color = value.color;
            var materialKey = self._getTupleKey(null, material, null);
            var colorKey = self._getTupleKey(null, null, color);
            var materialColorKey = self._getTupleKey(null, material, color);

            // verifies if the key of the combination and its componentes are
            // already included in the keys list and adds them if they aren't
            keysList.indexOf(materialKey) == -1 && keysList.push(materialKey);
            keysList.indexOf(colorKey) == -1 && keysList.push(colorKey);
            keysList.indexOf(materialColorKey) == -1 && keysList.push(materialColorKey);
        };

        // checks if any of the possible materials
        // are restricted and removes them
        var unrestrictedMaterials = [];
        var materialList = Object.keys(materials);
        for (var index = 0; index < materialList.length; index++) {
            // retrieves the material key and its restrictions
            var materialName = materialList[index];
            var materialKey = self._getTupleKey(null, materialName);
            var materialRestrictions = self.restrictions[materialKey];

            // checks if the material has a global restriction
            // or is being restricted by other material currently
            // on the shoe and ignores it if it is
            if (materialRestrictions === true) {
                continue;
            } else if (materialRestrictions) {
                for (var index = 0; index < materialRestrictions.length; index++) {
                    var restriction = materialRestrictions[index];
                    if (keysList.indexOf(restriction) > -1) {
                        continue;
                    }
                }
            }

            // iterates over the material's colors
            // to retrieve the valid colors
            var colors = materials[materialName];
            var newColors = colors.filter(function(color) {
                // ignores the color if it has a global restriction
                // or is being restricted by other color
                var colorKey = self._getTupleKey(null, null, color);
                var colorRestrictions = self.restrictions[colorKey];
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
                var materialColorKey = self._getTupleKey(null, materialName, color);
                var keyRestrictions = self.restrictions[materialColorKey];
                if (!keyRestrictions) {
                    return true;
                } else if (keyRestrictions.length === 0 || keyRestrictions === true) {
                    return false;
                }

                // checks if any of the combination's
                // restrictions are active
                var invalidKeys = keyRestrictions.map(keyRestrictions, function(restriction) {
                    return keysList.indexOf(restriction) < 0 ? null : restriction;
                });
                return invalidKeys.length === 0;
            });

            // updates the valid colors
            unrestrictedMaterials[materialName] = newColors;
        };
        return unrestrictedMaterials;
    };

    var unrestrictedParts = [];
    var partKeys = Object.keys(this.combinationsMap);
    for (var index = 0; index < partKeys.length; index++) {
        var partName = partKeys[index];
        var partKey = this._getTupleKey(partName);
        var partRestricted = this.restrictions[partKey] ? true : false;;
        if (partRestricted) {
            continue;
        }

        var materials = this.combinationsMap[partName];
        var newMaterials = getUnrestrictedValues(partName, materials);
        var newPart = {
            name: partName,
            materials: newMaterials
        };
        unrestrictedParts.push(newPart);
    }
    callback(unrestrictedParts);
};

Ripe.prototype.bindFrame = function(target, frame) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    // tries to retrieve the set of binds to the target
    // frame, then adds the target to that list and re-sets
    // the list in the binds map
    var bind = this.frameBinds[frame] || [];
    bind.push(target);
    this.frameBinds[frame] = bind;
};

Ripe.prototype.addUpdateCallback = function(callback) {
    this._addCallback("update", callback);
};

Ripe.prototype.removeUpdateCallback = function(callback) {
    this._removeCallback("update", callback);
};

Ripe.prototype.addPriceCallback = function(callback) {
    this._addCallback("price", callback);
};

Ripe.prototype.removePriceCallback = function(callback) {
    this._removeCallback("price", callback);
};

Ripe.prototype.addPartsCallback = function(callback) {
    this._addCallback("parts", callback);
};

Ripe.prototype.removePartsCallback = function(callback) {
    this._removeCallback("parts", callback);
};

Ripe.prototype.addCombinationsCallback = function(callback) {
    this._addCallback("combinations", callback);
};

Ripe.prototype.removeCombinationsCallback = function(callback) {
    this._removeCallback("combinations", callback);
};

Ripe.prototype.render = function(target, frame, options) {
    target = target || this.options.target;
    var element = target;
    element.src = this._getImageURL(frame, null, null, null, null, null, options);
};

Ripe.prototype.update = function(price) {
    for (var frame in this.frameBinds) {
        var bind = this.frameBinds[frame];
        for (var index = 0; index < bind.length; index++) {
            var target = bind[index];
            this.render(target, frame);
        }
    }

    this.dragBind && this._updateDrag(this.dragBind);

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice(function(value) {
        this._runCallbacks("price", value);
    });
};

Ripe.prototype._addCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    callbacks.push(callback);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._removeCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    var index = array.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._runCallbacks = function(name) {
    var callbacks = this.callbacks[name] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.prototype._waitCallbacks = function(callbacks, callback) {
    var callbackCount = callbacks.length;
    for (var index = 0; index < callbacks.length; index++) {
        var _callback = callbacks[index];
        _callback(function() {
            callbackCount--;
            callbackCount === 0 && callback();
        });
    }
};

Ripe.prototype._animateProperty = function(element, property, initial, final, duration, callback) {
    // sets the initial value for the property
    element.style[property] = initial;
    var last = new Date();
    var frame = function() {
        // checks how much time has passed
        // since the last animation frame
        var current = new Date();
        var timeDelta = current - last;
        var animationDelta = timeDelta * (final - initial) / duration;

        // adjusts the value by the correspondent amount
        // making sure it doens't surpass the final value
        var value = parseFloat(element.style[property]);
        value += animationDelta;
        value = final > initial ? Math.min(value, final) : Math.max(value, final);
        element.style[property] = value;
        last = current;

        // checks if the animation has finished and if it is then
        // fires the callback if it's set. Otherwise, requests a
        // new animation frame to proceed with the animation
        var incrementAnimation = final > initial && value < final;
        var decrementAnimation = final < initial && value > final;
        if (incrementAnimation || decrementAnimation) {
            // sets the id of the animation frame on the element
            // so that it can be canceled if necessary
            var id = requestAnimationFrame(frame);
            element.dataset.animationId = id;
        } else {
            callback && callback();
        }
    };

    // starts the animation
    frame();
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;
