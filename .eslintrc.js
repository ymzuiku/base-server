/*
yarn add @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-eslint eslint eslint-config-prettier eslint-plugin-cypress eslint-plugin-prettier prettier husky lint-staged -D

package.json:
"scripts":{
  "eslint": "eslint --ext .tsx,.ts,.js --cache --fix ./"
},
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "./{src,server}/++/+.{ts,tsx,js}": [
    "npm run eslint"
  ]
},
*/

module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "plugin:cypress/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint"],
  globals: {
    $: true,
  },
  rules: {
    "prettier/prettier": 1,
    "no-empty": 0,
    "no-constant-condition": 0,
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    eqeqeq: ["warn", "always"],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: true,
      },
    ],
    "cypress/no-assigning-return-values": "error",
    "cypress/no-unnecessary-waiting": 0,
    "cypress/assertion-before-screenshot": "warn",
    "cypress/no-force": 0,
    "cypress/no-async-tests": "error",
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        VariableDeclarator: 4,
        SwitchCase: 1,
      },
    ],
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/no-triple-slash-reference": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "@typescript-eslint/no-this-alias": 0,
    "@typescript-eslint/triple-slash-reference": 0,
  },
};
