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
 * Object used to store the information on the global visual
 * animation that are currently running as part of the RIPE
 * environment.
 *
 * Proper garbage collection should be ensure to avoid leak
 * of memory regarding animations.
 */
ripe.animations = {};

/**
 * @ignore
 */
ripe.createElement = function(tagName, className) {
    const element = tagName && document.createElement(tagName);
    element.className = className || "";
    return element;
};

/**
 * @ignore
 */
ripe.animateProperty = async function(
    element,
    property,
    initial,
    final,
    duration = 1.0,
    raise = true
) {
    // sets the initial value for the property according to the
    // provided values, notice that the date of the last touch
    // time for the animation is created
    element.style[property] = initial;
    let last = new Date();

    const promise = new Promise((resolve, reject) => {
        const frame = (timestamp, err) => {
            // in case there's an error coming from the callback calls
            // the promise reject function with the error
            if (err) {
                reject(err);
                return;
            }

            // in case there's an animation id currently defined in the
            // element it should be removed from the global dict (making
            // sure that there's proper garbage collection)
            if (element.dataset.animation_id) {
                delete ripe.animations[element.dataset.animation_id];
            }

            // checks how much time has passed since the last animation frame
            const current = new Date();
            const timeDelta = current - last;
            const animationDelta = (timeDelta * (final - initial)) / duration;

            // adjusts the value by the correspondent amount
            // making sure it doesn't surpass the final value
            let value = parseFloat(element.style[property]);
            value += animationDelta;
            value = final > initial ? Math.min(value, final) : Math.max(value, final);
            element.style[property] = value;
            last = current;

            // checks if the animation has finished and if it is then
            // fires the callback if it's set. Otherwise, requests a
            // new animation frame to proceed with the animation
            const incrementAnimation = final > initial && value < final;
            const decrementAnimation = final < initial && value > final;
            if (incrementAnimation || decrementAnimation) {
                // sets the id of the animation frame on the element
                // so that it can be canceled if necessary
                const id = requestAnimationFrame(frame);
                element.dataset.animation_id = id;
                ripe.animations[element.dataset.animation_id] = {
                    callback: frame,
                    last: last
                };
            } else {
                delete element.dataset.animation_id;
                resolve();
            }
        };

        // starts the animation process by running the initial
        // call to the frame animation function
        frame();
    });

    try {
        // waits for the complete set of steps of the animation
        // to complete (may raise unexpected errors)
        await promise;
    } catch (err) {
        // in case the raise flag is not set returns immediately
        // otherwise rethrows the exception to the upper layers
        if (!raise) return false;
        throw err;
    }

    // returns with a valid value indicating that the animation
    // has been executed with success
    return true;
};

/**
 * @ignore
 */
ripe.cancelAnimation = function(element) {
    if (!element.dataset.animation_id) return;
    const animationId = parseInt(element.dataset.animation_id);
    const info = ripe.animations[animationId];
    cancelAnimationFrame(animationId);

    // in case there's a callback defined for the current animation
    // then it muse be called with an action exception indicating that
    // the exception has been canceled in the middle of the execution
    if (info.callback) {
        info.callback(null, new ripe.ActionException("Animation canceled"));
    }
};

/**
 * @ignore
 */
ripe.getFrameKey = function(view, position, token) {
    token = token || "-";
    return view + token + position;
};

/**
 * @ignore
 */
ripe.parseFrameKey = function(frame, token) {
    token = token || "-";
    return frame.split(token, 2);
};

/**
 * @ignore
 */
ripe.frameNameHack = function(frame) {
    if (!frame) return "";
    const _frame = ripe.parseFrameKey(frame);
    const view = _frame[0];
    let position = _frame[1];
    position = view === "side" ? position : view;
    return position;
};

/**
 * @ignore
 */
ripe.fixEvent = function(event) {
    if (event.offsetX !== undefined) {
        return event;
    }

    const target = event.target || event.srcElement;
    const rect = target.getBoundingClientRect();

    try {
        event.offsetX = event.clientX - rect.left;
        event.offsetY = event.clientY - rect.top;
    } catch (exception) {
        return event;
    }

    return event;
};

/**
 * @ignore
 */
ripe.clone = function(object) {
    if (object === undefined) {
        return object;
    }
    const objectS = JSON.stringify(object);
    return JSON.parse(objectS);
};

/**
 * @ignore
 */
ripe.equal = function(first, second) {
    if (first === second) {
        return true;
    }

    if (ripe.typeof(first) !== ripe.typeof(second)) {
        return false;
    }

    if (ripe.isPrimitive(first) && ripe.isPrimitive(second)) {
        return first === second;
    }

    if (Object.keys(first).length !== Object.keys(second).length) {
        return false;
    }

    for (const key in first) {
        if (!(key in second)) return false;
        if (!ripe.equal(first[key], second[key])) return false;
    }

    return true;
};

/**
 * @ignore
 */
ripe.isPrimitive = function(object) {
    return object !== Object(object);
};

/**
 * @ignore
 */
ripe.typeof = function(object) {
    if (object === null) return "null";
    if (Array.isArray(object)) return "array";
    return typeof object;
};

/**
 * @ignore
 */
ripe.escape = function(value, char, escape = "\\") {
    return value
        .replace(new RegExp("\\" + escape, "g"), () => escape + escape)
        .replace(new RegExp("\\" + char, "g"), () => escape + char);
};

/**
 * @ignore
 */
ripe.unescape = function(value, escape = "\\") {
    const result = [];
    const iterator = value[Symbol.iterator]();
    for (const char of iterator) {
        if (char === escape) {
            const follow = iterator.next();
            if (!follow.done) {
                result.push(follow.value);
            } else {
                result.push(escape);
            }
        } else {
            result.push(char);
        }
    }
    return result.join("");
};

/**
 * @ignore
 */
ripe.countUnescape = function(value, sub, escape = "\\") {
    const iterator = value[Symbol.iterator]();
    let count = 0;
    for (const char of iterator) {
        if (char === escape) {
            iterator.next();
        } else if (char === sub) {
            count += 1;
        }
    }
    return count;
};

/**
 * @ignore
 */
ripe.splitUnescape = function(value, delimiter = " ", max = -1, escape = "\\", unescape = true) {
    const result = [];
    let current = [];
    const iterator = value[Symbol.iterator]();
    let count = 0;
    for (const char of iterator) {
        if (char === escape) {
            if (!unescape) current.push(escape);
            const follow = iterator.next();
            if (!follow.done) {
                current.push(follow.value);
            } else if (unescape) {
                current.push(escape);
            }
        } else if (char === delimiter && count !== max) {
            result.push(current.join(""));
            current = [];
            count += 1;
        } else {
            current.push(char);
        }
    }
    result.push(current.join(""));
    return result;
};
