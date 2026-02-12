import nextConfig from '@beeconnectlab/eslint-config/next';

export default [
  ...nextConfig,
  {
    ignores: ['next-env.d.ts'],
  },
];
