import hooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { "react-hooks": hooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: "readonly", document: "readonly", localStorage: "readonly", fetch: "readonly", FormData: "readonly", Headers: "readonly", crypto: "readonly", setTimeout: "readonly", clearTimeout: "readonly", setInterval: "readonly", clearInterval: "readonly", URLSearchParams: "readonly", File: "readonly" },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "no-undef": "error",
    },
  },
];
