import baseConfig from '@beeconnectlab/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: [
      'packages/eslint-config/**',
      '**/next-env.d.ts',
    ],
  },
];
