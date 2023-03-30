const base = require("./base");
const ripe = base.ripe;

ripe.FileTuple = function(...args) {
    this.push(...args);
};

ripe.FileTuple.prototype = Object.create(Array.prototype);
ripe.FileTuple.prototype.constructor = ripe.FileTuple;

ripe.FileTuple.fromData = function(data, name = null, mime = null) {
    const fileTuple = new this(name, mime, data);
    return fileTuple;
};

ripe.FileTuple.fromString = function(
    dataString,
    name = null,
    mime = null,
    { encoding = "utf-8" } = {}
) {
    const data = new TextEncoder(encoding).encode(dataString);
    return this.fromData(data, name, mime);
};

ripe.FileTuple.fromArrayBuffer = function(arrayBuffer, name = null, mime = null) {
    const buffer = Buffer.from(arrayBuffer);
    return this.fromData(buffer, name, mime);
};

ripe.FileTuple.fromBlob = async function(blob, name = null, mime = null) {
    const arrayBuffer = await blob.arrayBuffer();
    return this.fromArrayBuffer(arrayBuffer, name, mime);
};

ripe.FileTuple.prototype.toString = function() {
    return "[object Array]";
};

ripe.FileTuple.prototype.name = function() {
    return this[0];
};

ripe.FileTuple.prototype.mime = function() {
    return this[1];
};

ripe.FileTuple.prototype.data = function() {
    return this[2];
};
