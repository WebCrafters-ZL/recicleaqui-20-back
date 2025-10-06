import securityPlugin from "eslint-plugin-security";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    plugins: {
      security: securityPlugin
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "error",
      "security/detect-unsafe-regex": "error"
    }
  }
];
