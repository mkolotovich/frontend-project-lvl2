import yaml from 'js-yaml';
import * as path from 'path';

export default (path1, path2) => {
  const fileExt1 = path.extname(path1);
  const fileExt2 = path.extname(path2);
  const parse = fileExt1 === '.json' && fileExt2 === '.json' ? JSON.parse : yaml.load;
  return parse;
};
