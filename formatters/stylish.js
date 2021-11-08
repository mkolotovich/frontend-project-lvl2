import _ from 'lodash';

const spaceSize = 2;

const makeSpace = (size, space) => {
  let spaceType = space;
  if (size > 0) {
    spaceType += ' ';
    return makeSpace(size - 1, spaceType);
  }
  return space;
};

const isLeaf = (node) => {
  if (node.type === 'node') {
    return false;
  }
  return true;
};

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

const makeLine = (name, symbol, acc, item, depth) => {
  if (item.type === 'node') {
    if (depth > 1) {
      const itemName = item.name.split('.');
      return `${makeSpace(spaceSize ** depth + spaceSize, '')}${symbol}  ${itemName[itemName.length - 1]}: {\n`;
    }
    return `${makeSpace(spaceSize, '')}${symbol}  ${item.name}: {\n`;
  }
  return '';
};

const getChildren = (node) => node.children;

const stylish = (data, result, depth = 0) => {
  const {
    name, value, status, newValue,
  } = data;
  if (isLeaf(data)) {
    // const itemName = name.split('.');
    if (status === 'added') {
      if (_.isObject(value)) {
        if (depth === 1) {
          // return `${result}${makeSpace(spaceSize, '')}+ ${itemName[itemName.length - 1]}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 2, '')}}\n`;
          return `${result}${makeSpace(spaceSize, '')}+ ${name}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 2, '')}}\n`;
        }
        // return `${result}${makeSpace(spaceSize * depth + 2, '')}+ ${itemName[itemName.length - 1]}: {\n${replacer(value, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n`;
        return `${result}${makeSpace(spaceSize * depth + 2, '')}+ ${name}: {\n${replacer(value, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n`;
      }
      // return `${result}${makeSpace(spaceSize ** depth + 2, '')}+ ${itemName[itemName.length - 1]}: ${value}\n`;
      return `${result}${makeSpace(spaceSize ** depth + 2, '')}+ ${name}: ${value}\n`;
    } if (status === 'removed') {
      if (depth === 3) {
        // return `${result}${makeSpace(spaceSize + 8, '')}- ${itemName[itemName.length - 1]}: ${value}\n`;
        return `${result}${makeSpace(spaceSize + 8, '')}- ${name}: ${value}\n`;
      }
      if (_.isObject(value)) {
        // return `${result}${makeSpace(spaceSize, '')}- ${itemName[itemName.length - 1]}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 6, '')}}\n${makeSpace(spaceSize * depth + 2, '')}}\n`;
        return `${result}${makeSpace(spaceSize, '')}- ${name}: {\n${replacer(value, spaceSize * depth)}${makeSpace(spaceSize * depth + 6, '')}}\n${makeSpace(spaceSize * depth + 2, '')}}\n`;
      }
      // return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${itemName[itemName.length - 1]}: ${value}\n`;
      return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${name}: ${value}\n`;
    } if (status === 'updated') {
      if (depth !== 4) {
        if (_.isObject(value)) {
          // return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${itemName[itemName.length - 1]}: {\n${replacer(value, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n${result}${makeSpace(spaceSize * depth + 2, '')}+ ${itemName[itemName.length - 1]}: ${newValue}\n`;
          return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${name}: {\n${replacer(value, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n${result}${makeSpace(spaceSize * depth + 2, '')}+ ${name}: ${newValue}\n`;
        } if (_.isObject(newValue)) {
          // return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${itemName[itemName.length - 1]}: ${value}\n${makeSpace(spaceSize * depth + 2, '')}+ ${itemName[itemName.length - 1]}: {\n${replacer(newValue, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n`;
          return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${name}: ${value}\n${makeSpace(spaceSize * depth + 2, '')}+ ${name}: {\n${replacer(newValue, spaceSize * depth + 2)}${makeSpace(spaceSize * depth + 4, '')}}\n`;
        }
        if (depth === 3) {
          // return `${result}${makeSpace(spaceSize * depth + 4, '')}- ${itemName[itemName.length - 1]}: ${value}\n${result}${makeSpace(spaceSize * depth + 4, '')}+ ${itemName[itemName.length - 1]}: ${newValue}\n`;
          return `${result}${makeSpace(spaceSize * depth + 4, '')}- ${name}: ${value}\n${result}${makeSpace(spaceSize * depth + 4, '')}+ ${name}: ${newValue}\n`;
        }
        // return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${itemName[itemName.length - 1]}: ${value}\n${result}${makeSpace(spaceSize * depth + 2, '')}+ ${itemName[itemName.length - 1]}: ${newValue}\n`;
        return `${result}${makeSpace(spaceSize * depth + 2, '')}- ${name}: ${value}\n${result}${makeSpace(spaceSize * depth + 2, '')}+ ${name}: ${newValue}\n`;
      }
      // return `${result}${makeSpace(spaceSize ** depth - 2, '')}- ${itemName[itemName.length - 1]}: ${value}\n${result}${makeSpace(spaceSize ** depth - 2, '')}+ ${itemName[itemName.length - 1]}: ${newValue}\n`;
      return `${result}${makeSpace(spaceSize ** depth - 2, '')}- ${name}: ${value}\n${result}${makeSpace(spaceSize ** depth - 2, '')}+ ${name}: ${newValue}\n`;
    }
    // return `${result}${makeSpace(spaceSize ** depth + 2, '')}  ${itemName[itemName.length - 1]}: ${value}\n`;
    return `${result}${makeSpace(spaceSize ** depth + 2, '')}  ${name}: ${value}\n`;
  }
  const children = getChildren(data);
  const line = children.map((item) => stylish(item, makeLine(name, '', result, item, depth + 1), depth + 1));
  if (name === '') {
    return `{\n${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}`;
  }
  return `${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}\n`;
};

export default stylish;
