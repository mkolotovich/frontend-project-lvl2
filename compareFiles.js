import _ from 'lodash';
import chooseFormatter from './formatters/index.js';

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

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '');
  getKeys(file2, keys, '');
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();
  const structre = makeDiff(sortedKeys, 0, file1, file2);
  return chooseFormatter(formatName, structre);
};

export default compareFiles;
