import chooseFormatter from './formatters/index.js';
import buildTree from './makeTree.js';
import parse from './parsers.js';
import readFile from './readFile.js';

const compareFiles = (file1, file2, formatName = 'stylish') => {
  const parser = parse(file1, file2);
  const data1 = parser(readFile(file1));
  const data2 = parser(readFile(file2));
  const tree = buildTree(data1, data2);
  return chooseFormatter(formatName, tree);
};

export default compareFiles;
