if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

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
ripe.animateProperty = function(element, property, initial, final, duration, callback, abort) {
    // sets the initial value for the property
    element.style[property] = initial;
    let last = new Date();

    const frame = function() {
        // check if the animation should be cancelled
        if (abort && abort()) {
            callback && callback();
            return;
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
        } else {
            callback && callback();
        }
    };

    // starts the animation process by running the initial
    // call to the frame animation function
    frame();
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
    if (!frame) {
        return "";
    }
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
    if (event.hasOwnProperty("offsetX") && event.offsetX !== undefined) {
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
    const firstS = JSON.stringify(first);
    const secondS = JSON.stringify(second);
    return firstS === secondS;
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
