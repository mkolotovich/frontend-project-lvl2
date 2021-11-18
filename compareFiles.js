import _ from 'lodash';
import chooseFormatter from './formatters/index.js';

const getKeys = (obj, keys, path, obj1) => {
  const cb = ([key, value]) => {
    if (!_.isObject(value)) {
      keys.add(`${path}.${key}`);
    } else {
      const fullPath = `${path}.${key}`;
      keys.add(fullPath);
      if (!_.isObject(_.get(obj1, fullPath.slice(1)))) {
        return [];
      }
      return getKeys(value, keys, fullPath, obj1);
    }
    return keys;
  };

  const objKeys = Object.entries(obj);
  objKeys.map((child) => cb(child));
  return keys;
};

const isValueObject = (node, file1, file2) => {
  if (_.isObject(_.get(file1, node.slice(1))) && _.isObject(_.get(file2, node.slice(1)))) {
    return true;
  }
  return false;
};

const chooseType = (node, file1, file2) => {
  if (isValueObject(node, file1, file2)
  || _.get(file1, node.slice(1)) === _.get(file2, node.slice(1))) {
    return 'unchanged';
  }
  if (_.has(file1, node.slice(1)) && _.has(file2, node.slice(1))
  && _.get(file1, node.slice(1)) !== _.get(file2, node.slice(1))) {
    return 'updated';
  }
  if (_.has(file1, node.slice(1))) {
    return 'removed';
  }
  return 'added';
};

const getValue = (node, file1, file2) => {
  if (_.has(file1, node.slice(1))) {
    return _.get(file1, node.slice(1));
  }
  return _.get(file2, node.slice(1));
};

const makeNode = (name, children) => ({
  name,
  children,
  type: 'node',
});

const makeLeaf = (name, file1, file2) => ({
  name: _.last(name.slice(1).split('.')),
  type: 'leaf',
  status: chooseType(name, file1, file2),
  value: getValue(name, file1, file2),
});

const makeChangedLeaf = (name, file1, file2) => ({
  name: _.last(name.slice(1).split('.')),
  type: 'leaf',
  status: chooseType(name, file1, file2),
  value: getValue(name, file1, file2),
  newValue: _.get(file2, name.slice(1)),
});

const makeTree = (keys, file1, file2, acc) => {
  if (keys.length === 0) {
    return _.sortBy(acc, ['name']);
  }
  const [header] = keys;
  const rest = keys.slice(1);
  if (header.slice(1).includes('.')) {
    if (isValueObject(header, file1, file2)) {
      return makeTree([], file1, file2, [...acc, makeNode(_.last(header.slice(1).split('.')), makeTree(rest, file1, file2, []))]);
    } if (chooseType(header, file1, file2) === 'updated') {
      return makeTree(rest, file1, file2, [...acc, makeChangedLeaf(header, file1, file2)]);
    }
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2)]);
  }
  if (chooseType(header, file1, file2) !== 'unchanged') {
    return makeLeaf(header, file1, file2);
  }
  return makeTree(rest, file1, file2, []);
};

const sort = (arr, acc = [], subChildren) => {
  const [head] = arr;
  const tail = arr.slice(1);
  if (tail.length === 0) {
    if (subChildren) {
      return [...acc, head, ...subChildren];
    }
    return [...acc, head];
  }
  const [next] = tail;
  if (head.slice(1).includes('.') && next.includes(_.last(head.split('.')))) {
    const children = arr.filter((item) => {
      if (item.includes(head)) {
        return true;
      }
      return false;
    });
    if (children.length > tail.length) {
      return sort(tail, [...acc, head], []);
    }
    return sort([...tail.slice(children.length - 1)], acc, children);
  }
  return sort(tail, [...acc, head], subChildren);
};

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '', file2);
  getKeys(file2, keys, '', file1);
  const keysArray = Array.from(keys);
  const sortedKeys = _.sortBy(keysArray);
  const groups = sortedKeys.filter((item) => !item.slice(1).includes('.'));
  const groupKeys = groups.map((item) => sortedKeys.filter((el) => el.includes(item)));
  sort(groupKeys[0]);
  const res = groupKeys.map((item) => {
    const sorted = sort(item);
    if (Array.isArray(makeTree(sorted, file1, file2))) {
      const [group] = sorted;
      return makeNode(group.slice(1), makeTree(sorted, file1, file2));
    }
    return makeTree(sorted, file1, file2);
  });
  const tree = makeNode('', res);
  return chooseFormatter(formatName, tree);
};

export default compareFiles;
