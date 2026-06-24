import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const eslintConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "exports/**", "storage/**"]
  }
];

export default eslintConfig;
