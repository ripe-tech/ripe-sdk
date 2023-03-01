const base = require("./base");
const ripe = base.ripe;

/**
 * Returns 'size' length subsequences of elements from the
 * input items.
 *
 * The return sequence are ordered according to the order
 * of the input items. If the input is sorted, the result
 * will respect that ordering. Elements are treated as
 * unique based on their position instead of their value,
 * meaning that there will be no repeated values in each
 * combination.
 *
 * @param {Array} items The items to create iterations from.
 * @param {Number} size The length of the return sequence.
 * @returns {Array} A sequence of length 'size' subsequences
 * of items created from combining the input items, with no
 * repeated values and its ordering respecting the order of
 * the input array.
 * @see https://docs.python.org/3/library/itertools.html#itertools.combinations
 */
ripe.combinations = function(items, size) {
    function recursive(values, i) {
        // saves the values and exists the combination
        // logic once the length of the combination
        // was reached
        if (values.length === size) {
            result.push(values);
            return;
        }

        // returns if there are no more elements
        // to combine in the input array
        if (i + 1 > items.length) return;

        // concatenates the value to the subsequence being
        // constructed and makes a recursive call so that
        // the combination can be constructed both with the
        // new subsequence and with the previous generating
        // all possible combinations with no repetition
        recursive(values.concat(items[i]), i + 1);
        recursive(values, i + 1);
    }

    const result = [];
    recursive([], 0);
    return result;
};
