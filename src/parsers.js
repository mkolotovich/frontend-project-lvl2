import yaml from 'js-yaml';
import * as path from 'path';
// import compareFiles from './compareFiles.js';
// import readFile from './readFile.js';

// export default (path1, path2, formatName = 'stylish') => {
export default (path1, path2) => {
  // const data1 = readFile(path1);
  // const data2 = readFile(path2);
  const fileExt1 = path.extname(path1);
  const fileExt2 = path.extname(path2);
  const parse = fileExt1 === '.json' && fileExt2 === '.json' ? JSON.parse : yaml.load;
  return parse;
  // return compareFiles(parse(data1), parse(data2), formatName);
};
