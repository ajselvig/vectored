import * as path from 'path'
import {defineConfig} from 'vite'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url);

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [
    vanillaExtractPlugin()
  ]
})