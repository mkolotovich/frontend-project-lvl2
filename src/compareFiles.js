import chooseFormatter from './formatters/index.js';
import buildTree from './makeTree.js';
import parse from './parsers.js';
import readFile from './readFile.js';
import getFileFormat from './getFileFormat.js';

const getData = (filepath) => readFile(filepath);

const compareFiles = (filepath1, filepath2, formatName = 'stylish') => {
  const data1 = getData(filepath1);
  const data2 = getData(filepath2);
  const format1 = getFileFormat(filepath1);
  const format2 = getFileFormat(filepath2);
  const parsedData1 = parse(data1, format1);
  const parsedData2 = parse(data2, format2);
  const tree = buildTree(parsedData1, parsedData2);
  return chooseFormatter(formatName, tree);
};

export default compareFiles;
