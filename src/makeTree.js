import _ from 'lodash';

const isValueObject = (node, file1, file2) => {
  if (_.isPlainObject(_.get(file1, node)) && _.isPlainObject(_.get(file2, node))) {
    return true;
  }
  return false;
};

const makeNode = (name, children, type) => ({
  name,
  children,
  type,
});

const getValue = (node, file1, file2) => {
  if (_.has(file1, node)) {
    return _.get(file1, node);
  }
  return _.get(file2, node);
};

const makeLeaf = (name, file1, file2, type) => ({
  name,
  type,
  value: getValue(name, file1, file2),
  newValue: _.get(file2, name),
});

const makeTree = (keys, file1, file2, acc = []) => {
  if (keys.length === 0) {
    return _.sortBy(acc, ['name']);
  }
  return keys.map((el) => {
    if (isValueObject(el, file1, file2)) {
      const subKeys1 = _.get(file1, el);
      const subKeys2 = _.get(file2, el);
      const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
      const sortedKeys = _.sortBy(innerKeys);
      return makeNode(el, makeTree(sortedKeys, subKeys1, subKeys2, []), 'nested');
    }
    if (_.get(file1, el) === _.get(file2, el)) {
      return makeLeaf(el, file1, file2, 'unchanged');
    } if (_.has(file1, el) && _.has(file2, el) && _.get(file1, el) !== _.get(file2, el)) {
      return makeLeaf(el, file1, file2, 'updated');
    } if (_.has(file1, el)) {
      return makeLeaf(el, file1, file2, 'removed');
    }
    return makeLeaf(el, file1, file2, 'added');
  });
};

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', res, 'nested');
  return tree;
};

export default buildTree;
