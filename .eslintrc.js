module.exports = {
    "extends": "standard",
    "plugins": ["mocha"],
    "rules": {
        "indent": ["warn", 4],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "space-before-function-paren": ["error", "never"],
        "linebreak-style": ["error", "windows"],
        "mocha/no-exclusive-tests": "error"
    },
    "env": {
        "browser": true,
        "jasmine": true
    }
};
