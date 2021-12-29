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

const makeTree = (keys, parsedData1, parsedData2) => keys.map((el) => {
  if (isValueObject(el, parsedData1, parsedData2)) {
    const subKeys1 = _.get(parsedData1, el);
    const subKeys2 = _.get(parsedData2, el);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const sortedKeys = _.sortBy(innerKeys);
    return makeNode(el, makeTree(sortedKeys, subKeys1, subKeys2, []), 'nested');
  }
  if (_.get(parsedData1, el) === _.get(parsedData2, el)) {
    return makeLeaf(el, parsedData1, parsedData2, 'unchanged');
  } if (_.has(parsedData1, el) && _.has(parsedData2, el)
  && _.get(parsedData1, el) !== _.get(parsedData2, el)) {
    return makeLeaf(el, parsedData1, parsedData2, 'updated');
  } if (_.has(parsedData1, el)) {
    return makeLeaf(el, parsedData1, parsedData2, 'removed');
  }
  return makeLeaf(el, parsedData1, parsedData2, 'added');
});

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', res, 'root');
  return tree;
};

export default buildTree;
