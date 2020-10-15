const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

const buildOrder = async function(ffOrderId = null) {
    const remote = ripe.RipeAPI();
    await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
    ffOrderId = ffOrderId || uuid.v4();
    const order = await remote.importOrderP(ffOrderId, {
        brand: "dummy",
        model: "dummy",
        parts: {
            piping: {
                material: "leather_dmy",
                color: "black"
            },
            side: {
                material: "leather_dmy",
                color: "black"
            },
            top0_bottom: {
                material: "leather_dmy",
                color: "black"
            },
            shadow: {
                material: "default",
                color: "default"
            }
        },
        gender: "female",
        size: 20,
        meta: ["client:ripe-sdk-test", "context:test"]
    });
    return order;
};

const destroyOrder = async function(order) {
    const remote = ripe.RipeAPI();
    await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
    await remote.deleteOrderP(order.number);
};

module.exports = {
    buildOrder: buildOrder,
    destroyOrder: destroyOrder
};
