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
      return replacer(value, size + 4, `${acc}${makeSpace(size + 4, '')}  ${key}: {\n`) + replacer(Object.fromEntries([tail]), size, `${makeSpace(size + 10, '')}}\n${makeSpace(size + 6, '')}}\n`);
    }
    return replacer(value, size + 4, `${acc}${makeSpace(size + 4, '')}  ${key}: {\n`);
  }
  if (tail !== undefined) {
    const result = `${acc}${makeSpace(size + 4, '')}  ${key}: ${value}\n`;
    return result + replacer(Object.fromEntries([tail]), size, acc);
  }
  return `${acc}${makeSpace(size + 4, '')}  ${key}: ${value}\n`;
};

const makeLine = (item, depth) => {
  if (!isLeaf(item)) {
    return `${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}  ${item.name}: {\n`;
  }
  return '';
};

const printComplexValues = (value, newValue, depth) => {
  if (_.isObject(value)) {
    return [`{\n${replacer(value, spaceSize * depth + spaceSize)}${makeSpace(spaceSize * depth + 4, '')}}`, newValue];
  }
  if (_.isObject(newValue)) {
    return [value, `{\n${replacer(newValue, spaceSize * depth + spaceSize)}${makeSpace(spaceSize * depth + 4, '')}}`];
  }
  return [value, newValue];
};

export const stylish = (data, result, depth = 0) => {
  const {
    name, value, status, newValue, children,
  } = data;
  if (isLeaf(data)) {
    if (status === 'added') {
      if (_.isObject(value)) return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: {\n${replacer(value, depthSpaceSize * (depth - 1) + spaceSize)}${makeSpace(depthSpaceSize * depth, '')}}\n`;
      return `${result}${makeSpace(spaceSize ** depth + 2, '')}+ ${name}: ${value}\n`;
    } if (status === 'removed') {
      if (_.isObject(value)) return `${result}${makeSpace(spaceSize, '')}- ${name}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 6, '')}}\n${makeSpace(spaceSize * depth + 2, '')}}\n`;
      return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${value}\n`;
    } if (status === 'updated') {
      const [printValue, printNewValue] = printComplexValues(value, newValue, depth);
      if (_.isObject(value) || _.isObject(newValue)) {
        return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${name}: ${printValue}\n${result}${makeSpace(spaceSize * depth + 2, '')}+ ${name}: ${printNewValue}\n`;
      }
      return `${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}- ${name}: ${value}\n${result}${makeSpace(depthSpaceSize * (depth - 1) + spaceSize, '')}+ ${name}: ${newValue}\n`;
    }
    return `${result}${makeSpace(spaceSize ** depth + 2, '')}  ${name}: ${value}\n`;
  }
  const line = children.map((item) => stylish(item, makeLine(item, depth + 1), depth + 1));
  if (name === '') return `{\n${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}`;
  return `${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}\n`;
};