import * as path from 'path';
import * as fs from 'fs';
import yaml from 'js-yaml';
import compareFiles from './compareFiles.js';

const readFile = (filename) => {
  const fullPath = path.resolve(process.cwd(), '__fixtures__', filename);
  const data = fs.readFileSync(fullPath).toString();
  return data;
};

export default (path1, path2, formatName = 'stylish') => {
  const data1 = readFile(path1);
  const data2 = readFile(path2);
  const fileExt1 = path.extname(path1);
  const fileExt2 = path.extname(path2);
  const parse = fileExt1 === '.json' && fileExt2 === '.json' ? JSON.parse : yaml.load;
  return compareFiles(parse(data1), parse(data2), formatName);
};
