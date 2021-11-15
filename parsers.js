import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import compareFiles from './compareFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.resolve(__dirname, '__fixtures__', filename);

const parseFiles = (file1, file2, formatName) => {
  // let parse;
  const fileExt1 = path.extname(file1);
  const fileExt2 = path.extname(file2);
  const parse = fileExt1 === '.json' && fileExt2 === '.json' ? JSON.parse : yaml.load;
  // if (fileExt1 === '.json' && fileExt2 === '.json') {
  //   parse = JSON.parse;
  // } if ((fileExt1 === '.yml' || fileExt1 === '.yaml') && (fileExt2 === '.yml' || fileExt2 === '.yaml')) {
  //   parse = yaml.load;
  // }
  return compareFiles(parse(fs.readFileSync(getFixturePath(file1), 'utf8')), parse(fs.readFileSync(getFixturePath(file2), 'utf8')), formatName);
};

export default parseFiles;
