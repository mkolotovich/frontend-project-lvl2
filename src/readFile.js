import * as path from 'path';
import * as fs from 'fs';

export default (filename) => {
  const fullPath = path.resolve(process.cwd(), '__fixtures__', filename);
  const data = fs.readFileSync(fullPath).toString();
  return data;
};
