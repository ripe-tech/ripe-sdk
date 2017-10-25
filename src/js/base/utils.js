ripe.createElement = function(tagName, className) {
    var element = tagName && document.createElement(tagName);
    element.className = className ? className : "";

    return element;
};
