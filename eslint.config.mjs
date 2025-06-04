import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import { fixupPluginRules } from "@eslint/compat";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  eslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  ...tsEslint.configs.recommended,
  {
    plugins: {
      "react-hooks": fixupPluginRules(hooksPlugin),
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^props$|^React$|^meta$|^_$|^params",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_|React|^e$",
          destructuredArrayIgnorePattern: "^props$|^React$|^meta$|^_$",
          varsIgnorePattern: "^props$|^React$|^meta$|^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-children-prop": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "no-debugger": "off",
      // "import/no-default-export": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],

      "react/jsx-key": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintConfigPrettier,
];
