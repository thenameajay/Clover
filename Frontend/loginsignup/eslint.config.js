import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from 'eslint-plugin-react-hooks';



/** @type {import('eslint').Linter.Config[]} */
export default [

  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react/prop-types': 'off', // Optional: Disable PropTypes validation
      'react/react-in-jsx-scope': 'off',
    },
  }
];