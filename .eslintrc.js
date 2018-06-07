module.exports = {
    "extends": "standard",
    "plugins": ["mocha"],
    "rules": {
        "indent": ["warn", 4, {
            SwitchCase: 1
        }],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        "linebreak-style": ["error", "windows"],
        "mocha/no-exclusive-tests": "error",
        "standard/no-callback-literal": "off"
    },
    "env": {
        "browser": true,
        "jasmine": true
    }
};
