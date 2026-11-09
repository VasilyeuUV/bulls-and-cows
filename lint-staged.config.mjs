export default {
  '*.{ts,js,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{css,html,json,md,yml,yaml}': ['prettier --write'],
};
