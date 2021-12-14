#!/usr/bin/env node

import { program } from 'commander';
// import parse from '../src/parsers.js';
// import readFile from '../src/readFile.js';
import compareFiles from '../src/compareFiles.js';

program
  .description('Compares two configuration files and shows a difference.')
  .version('0.0.1', '-V, --version', 'output the version number')
  .helpOption('-h, --help', 'output usage information')
  .option('-f, --format [type]', 'output format', 'stylish')
  .arguments('<filepath1>')
  .arguments('<filepath2>')
  .action((filepath1, filepath2) => {
    // const data1 = readFile(filepath1);
    // const data2 = readFile(filepath2);
    // const parser = parse(filepath1, filepath2);
    console.log(compareFiles(filepath1, filepath2, program.opts().format));
    // console.log(parseFiles(filepath1, filepath2, program.opts().format));
  })
  .parse();
