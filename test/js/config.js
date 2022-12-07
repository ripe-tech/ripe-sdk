const TEST_TIMEOUT = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : 60000;
const TEST_URL = process.env.TEST_URL || "https://ripe-core-now.platforme.com/api/";
const TEST_USERNAME = process.env.TEST_USERNAME || null;
const TEST_PASSWORD = process.env.TEST_PASSWORD || null;
const TEST_KEY = process.env.TEST_KEY || null;
const SKIP_TEST_NOTIFY = process.env.SKIP_TEST_NOTIFY ? parseInt(process.env.SKIP_TEST_NOTIFY) : 0;

module.exports = {
    TEST_TIMEOUT: TEST_TIMEOUT,
    TEST_URL: TEST_URL,
    TEST_USERNAME: TEST_USERNAME,
    TEST_PASSWORD: TEST_PASSWORD,
    TEST_KEY: TEST_KEY,
    SKIP_TEST_NOTIFY: SKIP_TEST_NOTIFY
};
