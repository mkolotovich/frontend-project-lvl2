import _ from 'lodash';

const getKeys = (obj, keys, path) => {
  let fullPath = path;
  const cb = ([key, value]) => {
    if (!_.isObject(value)) {
      fullPath = `${path}.${key}`;
      keys.add(fullPath);
    } else if (path === '') {
      fullPath = key;
      keys.add(key);
      return getKeys(value, keys, fullPath);
    } else {
      keys.add(`${path}.${key}`);
      return getKeys(value, keys, `${path}.${key}`);
    }
    return keys;
  };

  const objKeys = Object.entries(obj);
  objKeys.map((child) => cb(child));
  return keys;
};

const structure = [];

const makeDiff = (list, group, file1, file2) => {
  if (list.length === 0) {
    return structure;
  }
  let groupNumber = group;
  const [head, ...tail] = list;
  if (_.isObject(_.get(file1, head)) && _.isObject(_.get(file2, head))) {
    if (head.includes('.')) {
      const [...rest] = head.split('.');
      const name = _.last(rest);
      if (rest.length === 3) {
        _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', []]);
      } else {
        _.last(structure[group]).push([name, 'unchanged', []]);
      }
    } else {
      structure.push([head, 'unchanged', []]);
      if (structure[group][0] !== head) {
        groupNumber += 1;
      }
    }
    return makeDiff(tail, groupNumber, file1, file2);
  }
  const [...rest] = head.split('.');
  const name = _.last(rest);
  if (_.has(file1, head) && _.has(file2, head) && _.get(file1, head) === _.get(file2, head)) {
    if (rest.length === 3) {
      _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', _.get(file2, head)]);
    } else {
      _.last(structure[group]).push([name, 'unchanged', _.get(file2, head)]);
    }
  } else if (_.has(file1, head) && _.has(file2, head)) {
    if (rest.length === 4) {
      _.last(_.last(_.last(_.last(_.last(structure[group]))))).push([name, 'changed', _.get(file1, head), _.get(file2, head)]);
    } else if (_.isObject(_.get(file1, head))) {
      _.last(structure[group]).push([name, 'changed', [], _.get(file2, head)]);
    } else {
      _.last(structure[group]).push([name, 'changed', _.get(file1, head), _.get(file2, head)]);
    }
  } else if (_.has(file2, head)) {
    if (_.isObject(_.get(file2, head))) {
      if (rest.length === 1) {
        groupNumber += 1;
        structure.push([head, 'added', _.get(file2, head)]);
        return structure;
      }
      if (rest.length === 3) {
        _.last(_.last(structure[group])).push([name, 'unchanged']);
      } else {
        const [path] = rest;
        if (_.has(file1, path) && _.has(file2, path)) {
          _.last(structure[group]).push([name, 'added', _.get(file2, head)]);
          tail.shift();
        } else {
          _.last(structure[group]).push([name, 'unchanged']);
        }
      }
    } else if (rest.length === 3) {
      _.last(_.last(_.last(structure[group]))).push([name, 'added', _.get(file2, head)]);
    } else if (rest.length === 4) {
      _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', _.get(file2, head)]);
    } else {
      const [path] = rest;
      if (_.has(file1, path) && _.has(file2, path)) {
        _.last(structure[group]).push([name, 'added', _.get(file2, head)]);
      } else {
        _.last(structure[group]).push([name, 'unchanged', _.get(file2, head)]);
      }
    }
  } else if (_.has(file1, head)) {
    const path = `${rest[0]}.${rest[1]}`;
    if (_.has(file1, path) && _.has(file2, path)) {
      _.last(_.last(structure[group]))[2].push(name, 'unchanged', _.get(file1, head));
    } else {
      if (rest.length === 1) {
        groupNumber += 1;
        structure.push([head, 'deleted', _.get(file1, head)]);
        const filteredTail = tail.filter((item) => {
          if (!item.includes(head)) {
            return true;
          }
          return false;
        });
        return makeDiff(filteredTail, group, file1, file2);
      }
      if (_.isObject(_.get(file1, head))) {
        _.last(structure[group]).push([name, 'unchanged']);
      } else if (rest.length === 3) {
        _.last(_.last(structure[group])).push([name, 'unchanged', _.get(file1, head)]);
      } else {
        _.last(structure[group]).push([name, 'deleted', _.get(file1, head)]);
      }
    }
  }
  return makeDiff(tail, group, file1, file2);
};

let string = '{\n';
let plainString = '';
let spaceSize = 2;

const makeSpace = (size, space) => {
  let spaceType = space;
  if (size > 0) {
    spaceType += ' ';
    return makeSpace(size - 1, spaceType);
  }
  return space;
};

const makeLine = (name, symbol) => {
  string += `${makeSpace(spaceSize, '')}${symbol} ${name}: `;
  string += '{\n';
  spaceSize += 4;
};

const res = (stylish, children, tail) => stylish(children) + stylish(tail);

const stylish = (tree) => {
  if (!Array.isArray(tree)) {
    if (Object.entries(tree).length === 1) {
      const [name, value] = Object.entries(tree)[0];
      string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    } else {
      const [name, value] = Object.entries(tree)[0];
      if (!_.isObject(value)) {
        string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
        const [name1, value1] = Object.entries(tree)[1];
        string += `${makeSpace(spaceSize, '')}  ${name1}: {\n`;
        spaceSize += 4;
        const [subName, subValue] = Object.entries(value1)[0];
        string += `${makeSpace(spaceSize, '')}  ${subName}: ${subValue}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      } else {
        string += `${makeSpace(spaceSize, '')}  ${name}: {\n`;
        spaceSize += 4;
        const subName = Object.keys(value);
        string += `${makeSpace(spaceSize, '')}  ${subName}: {\n`;
        const [subSubName, subValue] = Object.entries(value[subName])[0];
        spaceSize += 4;
        string += `${makeSpace(spaceSize, '')}  ${subSubName}: ${subValue}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}\n`;
        const [name1, value1] = Object.entries(tree)[1];
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}  ${name1}: ${value1}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}`;
      }
    }
    return string;
  }
  if (tree.length === 0) {
    return string;
  }
  const [head, ...tail] = tree;
  const [name, type] = head;
  const children = head[2];
  if (type === 'unchanged' && head[2] instanceof Array) {
    makeLine(name, ' ');
    return stylish(children) + stylish(tail);
  } if (type === 'added' && head[2] instanceof Object) {
    makeLine(name, '+');
    res(stylish, children, tail);
  } else if (type === 'deleted' && head[2] instanceof Object) {
    makeLine(name, '-');
    res(stylish, children, tail);
  } else if (type === 'added' && head[2] instanceof Array) {
    spaceSize += 2;
    makeLine(name, '+');
    res(stylish, children, tail);
  } else if (type === 'deleted' && head[2] instanceof Array) {
    makeLine(name, '-');
    res(stylish, children, tail);
  } else if (type === 'added') {
    if (tail.length !== 0) {
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
    } else {
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 4;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    }
    stylish(tail);
  } else if (type === 'unchanged') {
    string += `${makeSpace(spaceSize, '')}  ${name}: ${head[2]}\n`;
    stylish(tail);
  } else if (type === 'deleted') {
    string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
    stylish(tail);
  } else if (type === 'changed') {
    if (tail.length !== 0) {
      string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[3]}\n`;
    } else {
      if (head[2] instanceof Array) {
        string += `${makeSpace(spaceSize, '')}- ${name}: {\n`;
        spaceSize += 4;
        const [subName, , value] = head[2];
        string += `${makeSpace(spaceSize, '')}  ${subName}: ${value}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      } else {
        string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
      }
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[3]}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    }
    stylish(tail);
  }
  return string;
};

const plain = (tree, path) => {
  if (tree.length === 0) {
    return plainString;
  }
  const [head, ...tail] = tree;
  const [name, type] = head;
  let children;
  let fullPath;
  if (path === '') {
    fullPath = name;
  } else {
    fullPath = `${path}.${name}`;
  }
  if (Array.isArray(head[2])) {
    [,, children] = head;
    if (head.length === 4) {
      const [,,, newValue] = head;
      plainString += `Property '${fullPath}' was updated. From [complex value] to '${newValue}'\n`;
    }
    return plain(children, fullPath) + plain(tail, path);
  }
  const [,, value, newValue] = head;
  if (type === 'added') {
    if (_.isObject(value)) {
      if (tail.length === 0) {
        plainString += `Property '${fullPath}' was ${type} with value: [complex value]`;
      } else {
        plainString += `Property '${fullPath}' was ${type} with value: [complex value]\n`;
      }
    } else if (typeof value === 'string') {
      plainString += `Property '${fullPath}' was ${type} with value: '${value}'\n`;
    } else {
      plainString += `Property '${fullPath}' was ${type} with value: ${value}\n`;
    }
    return plain(tail, path);
  } if (type === 'deleted') {
    plainString += `Property '${fullPath}' was removed\n`;
    return plain(tail, path);
  } if (type === 'changed') {
    if (typeof value === 'string') {
      plainString += `Property '${fullPath}' was updated. From '${value}' to '${newValue}'\n`;
    } else {
      plainString += `Property '${fullPath}' was updated. From ${value} to ${newValue}\n`;
    }
    return plain(tail, path);
  }
  return plain(tail, path);
};

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '');
  getKeys(file2, keys, '');
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();
  const structre = makeDiff(sortedKeys, 0, file1, file2);
  if (formatName === 'plain') {
    plain(structre, '');
    return plainString;
  }
  stylish(structre);
  return string;
};

export default compareFiles;
