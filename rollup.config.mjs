import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

// Extract peer dependencies to avoid bundling them
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

// Base configuration for the TypeScript compilation
const typescriptOptions = {
  useTsconfigDeclarationDir: true,
  tsconfigOverride: {
    compilerOptions: {
      declaration: true,
      declarationDir: 'dist/types',
      jsx: 'react',
    },
    exclude: ['**/*.test.ts', '**/*.test.tsx', 'node_modules', 'dist']
  }
};

export default [
  // Main builds (ESM and CommonJS)
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      }
    ],
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      typescript(typescriptOptions),
    ]
  },
  
  // Minified builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module.replace('.js', '.min.js'),
        format: 'esm',
        sourcemap: true,
      },
      {
        file: pkg.main.replace('.js', '.min.js'),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      }
    ],
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      typescript(typescriptOptions),
      terser()
    ]
  },
  
  // Type definitions
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    external,
    plugins: [dts()]
  }
];