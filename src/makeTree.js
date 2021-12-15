import _ from 'lodash';

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
  if (_.isPlainObject(_.get(file1, node.slice(1)))
  && _.isPlainObject(_.get(file2, node.slice(1)))) {
    return true;
  }
  return false;
};

const chooseType = (node, file1, file2) => {
  if (isValueObject(node, file1, file2)) {
    return 'nested';
  }
  if (_.get(file1, node.slice(1)) === _.get(file2, node.slice(1))) {
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

const makeNode = (name, children, file1, file2) => ({
  name: _.last(name.slice(1).split('.')),
  children,
  type: 'node',
  status: chooseType(name, file1, file2),
});

const getValue = (node, file1, file2) => {
  if (_.has(file1, node.slice(1))) {
    return _.get(file1, node.slice(1));
  }
  return _.get(file2, node.slice(1));
};

const makeLeaf = (name, file1, file2) => ({
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
      return makeTree([], file1, file2,
        [...acc, makeNode(header, makeTree(rest, file1, file2, []), file1, file2)]);
    } if (chooseType(header, file1, file2) === 'updated') {
      return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2)]);
    }
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2)]);
  }
  if (chooseType(header, file1, file2) !== 'nested') {
    return makeLeaf(header, file1, file2);
  }
  return makeTree(rest, file1, file2, []);
};

const buildTree = (file1, file2) => {
  const keys = new Set();
  getKeys(file1, keys, '', file2);
  getKeys(file2, keys, '', file1);
  const keysArray = Array.from(keys);
  const sortedKeys = _.sortBy(keysArray);
  const groups = sortedKeys.filter((item) => !item.slice(1).includes('.'));
  const groupKeys = groups.map((item) => sortedKeys.filter((el) => el.includes(item)));
  const res = groupKeys.map((item) => {
    const [group] = item;
    if (Array.isArray(makeTree(item, file1, file2))) {
      const sorted = _.sortBy(item, (x) => {
        const itemsLength = item.map((el) => el.split('.').length);
        const maxLength = _.max(itemsLength);
        const index = itemsLength.indexOf(maxLength) - 1;
        const filtered = item.filter((el, ind) => ind === index || el.split('.').length === maxLength);
        const maxKeyLength = _.max(item.filter((el) => el.slice(group.length).split('.').length === 2).map((elem) => elem.slice(group.length + 1).length));
        const sortKeys = x.split('.');
        if (filtered.includes(x)) {
          return sortKeys.map((i) => _.padEnd(i, maxKeyLength + 1)).join('');
        }
        return sortKeys.map((i) => _.padStart(i, maxKeyLength + 1)).join('');
      });
      return makeNode(group, makeTree(sorted, file1, file2), file1, file2);
    }
    return makeTree(item, file1, file2);
  });
  const tree = makeNode('', res);
  return tree;
};

export default buildTree;
