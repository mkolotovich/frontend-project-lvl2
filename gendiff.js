#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import compareFiles from './compareFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

program
  .description('Compares two configuration files and shows a difference.')
  .version('0.0.1', '-V, --version', 'output the version number')
  .helpOption('-h, --help', 'output usage information')
  .option('-f, --format [type]', 'output format')
  .arguments('<filepath1>')
  .arguments('<filepath2>')
  .action((filepath1, filepath2) => {
    console.log(compareFiles(fs.readFileSync(getFixturePath(filepath1), 'utf8'), fs.readFileSync(getFixturePath(filepath2), 'utf8')));
  })
  .parse();
