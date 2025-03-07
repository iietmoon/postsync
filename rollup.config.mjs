import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

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
  
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    external,
    plugins: [dts()]
  }
];