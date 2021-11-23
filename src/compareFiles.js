import chooseFormatter from './formatters/index.js';
import buildTree from './makeTree.js';

const compareFiles = (file1, file2, formatName) => {
  const tree = buildTree(file1, file2);
  return chooseFormatter(formatName, tree);
};

export default compareFiles;
