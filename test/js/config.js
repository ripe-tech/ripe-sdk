const TEST_TIMEOUT = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : 30000;

module.exports = {
    TEST_TIMEOUT: TEST_TIMEOUT
};
