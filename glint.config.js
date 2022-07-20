module.exports = {
  fix: true,
  path: ['src'],
  ts: true,
  formatter: 'stylish',
  config: {
    extends: [
      'airbnb-base',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      'import/order': 'off',
      'no-multi-spaces': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'no-continue': 'off',
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'no-use-before-define': 'off',
      'no-restricted-syntax': 'off',
    },
  },
};
