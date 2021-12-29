import _ from 'lodash';

const spaceSize = 2;
const depthSpaceSize = 4;

const stringify = (value, replacer = ' ', spaceCount = 1) => {
  if (!_.isObject(value)) {
    return `${value}`;
  }
  const cb = (currentValue, replaceInner, depth) => {
    const entries = Object.entries(currentValue);
    return entries.reduce((acc, [key, val]) => {
      const newAcc = typeof val !== 'object' ? `${replaceInner.repeat(depth)}${key}: ${val}\n` : `${replaceInner.repeat(depth)}${key}: ${cb(val, replaceInner, depth + depthSpaceSize)}${replaceInner.repeat(depth)}}\n`;
      return acc + newAcc;
    }, '{\n');
  };
  return `${cb(value, replacer, spaceCount)}${' '.repeat(spaceCount - depthSpaceSize)}}`;
};

const makeLine = (item, depth) => {
  if (item.type === 'nested') {
    return `${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}  ${item.key}: {\n`;
  }
  return '';
};

const stylish = (tree) => {
  const cb = (data, result = '', depth = 0) => {
    const {
      key, value, type, newValue, children,
    } = data;
    const printValue = stringify(value, ' ', (depth + 1) * depthSpaceSize);
    const printNewValue = stringify(newValue, ' ', (depth + 1) * depthSpaceSize);
    switch (type) {
      case 'root':
        return `{\n${result}${children.map((item) => cb(item, makeLine(item, depth + 1), depth + 1)).join('\n')}\n${' '.repeat(spaceSize * depth * spaceSize)}}`;
      case 'nested':
        return `${result}${children.map((item) => cb(item, makeLine(item, depth + 1), depth + 1)).join('\n')}\n${' '.repeat(spaceSize * depth * spaceSize)}}`;
      case 'updated':
        return `${result}${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}- ${key}: ${printValue}\n${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}+ ${key}: ${printNewValue}`;
      case 'added':
        return `${result}${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}+ ${key}: ${printValue}`;
      case 'removed':
        return `${result}${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}- ${key}: ${printValue}`;
      default:
        return `${result}${' '.repeat(depthSpaceSize * (depth - 1) + spaceSize)}  ${key}: ${printValue}`;
    }
  };
  return cb(tree);
};

export default stylish;
