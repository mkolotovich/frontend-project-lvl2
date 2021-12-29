import _ from 'lodash';

const spaceSize = 2;
const depthSpaceSize = 4;

const makeSpace = (size, space) => {
  if (size > 0) {
    return makeSpace(size - 1, `${space} `);
  }
  return space;
};

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
  return `${cb(value, replacer, spaceCount)}${makeSpace(spaceCount - depthSpaceSize, '')}}`;
};

const makeLine = (item, depth) => {
  if (item.type === 'nested') {
    return `${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}  ${item.name}: {\n`;
  }
  return '';
};

const stylish = (tree) => {
  const cb = (data, result = '', depth = 0) => {
    const {
      name, value, type, newValue, children,
    } = data;
    const printValue = stringify(value, ' ', (depth + 1) * depthSpaceSize);
    const printNewValue = stringify(newValue, ' ', (depth + 1) * depthSpaceSize);
    switch (type) {
      case 'root':
        return `{\n${result}${children.map((item) => cb(item, makeLine(item, depth + 1), depth + 1)).join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}`;
      case 'nested':
        return `${result}${children.map((item) => cb(item, makeLine(item, depth + 1), depth + 1)).join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}\n`;
      case 'updated':
        return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${printValue}\n${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: ${printNewValue}\n`;
      case 'added':
        return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: ${printValue}\n`;
      case 'removed':
        return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${printValue}\n`;
      default:
        return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}  ${name}: ${printValue}\n`;
    }
  };
  return cb(tree);
};

export default stylish;
