import _ from 'lodash';

const spaceSize = 2;
const depthSpaceSize = 4;

const makeSpace = (size, space) => {
  if (size > 0) {
    return makeSpace(size - 1, `${space} `);
  }
  return space;
};

export const isLeaf = (node) => node.type !== 'node';

const replacer = (obj, size, acc = '') => {
  const [head, tail] = Object.entries(obj);
  const [key, value] = head;
  if (_.isObject(value)) {
    if (tail) {
      return replacer(value, size + depthSpaceSize, `${acc}${makeSpace(size + depthSpaceSize, '')}${key}: {\n`) + replacer(Object.fromEntries([tail]), size, `${makeSpace(size + 8, '')}}\n${makeSpace(size + depthSpaceSize, '')}}\n`);
    }
    return replacer(value, size + depthSpaceSize, `${acc}${makeSpace(size + depthSpaceSize, '')}${key}: {\n`);
  }
  if (tail !== undefined) {
    const result = `${acc}${makeSpace(size + depthSpaceSize, '')}  ${key}: ${value}\n`;
    return result + replacer(Object.fromEntries([tail]), size + spaceSize, acc);
  }
  return `${acc}${makeSpace(size + depthSpaceSize, '')}${key}: ${value}\n`;
};

const makeLine = (item, depth) => {
  if (!isLeaf(item)) {
    return `${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}  ${item.name}: {\n`;
  }
  return '';
};

const printComplexValues = (value, newValue, depth) => {
  if (_.isObject(value)) {
    return [`{\n${replacer(value, depthSpaceSize * depth)}${makeSpace(depthSpaceSize * depth, '')}}`, newValue];
  }
  if (_.isObject(newValue)) {
    return [value, `{\n${replacer(newValue, depthSpaceSize * depth)}${makeSpace(depthSpaceSize * depth, '')}}`];
  }
  return [value, newValue];
};

export const stylish = (data, result, depth = 0) => {
  const {
    name, value, status, newValue, children,
  } = data;
  if (isLeaf(data)) {
    const [printValue, printNewValue] = printComplexValues(value, newValue, depth);
    if (status === 'added') {
      return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: ${printValue}\n`;
    } if (status === 'removed') {
      if (_.isObject(value)) return `${result}${makeSpace(spaceSize, '')}- ${name}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 6, '')}}\n${makeSpace(spaceSize * depth + 2, '')}}\n`;
      return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${value}\n`;
    } if (status === 'updated') {
      return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${printValue}\n${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: ${printNewValue}\n`;
    }
    return `${result}${makeSpace(spaceSize ** depth + spaceSize, '')}  ${name}: ${value}\n`;
  }
  const line = children.map((item) => stylish(item, makeLine(item, depth + 1), depth + 1));
  if (name === '') return `{\n${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}`;
  return `${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}\n`;
};
