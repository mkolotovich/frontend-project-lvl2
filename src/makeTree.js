import _ from 'lodash';

const isValueObject = (node, file1, file2) => {
  if (_.isPlainObject(_.get(file1, node)) && _.isPlainObject(_.get(file2, node))) {
    return true;
  }
  return false;
};

const chooseType = (node, file1, file2) => {
  if (isValueObject(node, file1, file2)) {
    return 'nested';
  }
  if (_.get(file1, node) === _.get(file2, node)) {
    return 'unchanged';
  }
  if (_.has(file1, node) && _.has(file2, node) && _.get(file1, node) !== _.get(file2, node)) {
    return 'updated';
  }
  if (_.has(file1, node)) {
    return 'removed';
  }
  return 'added';
};

const makeNode = (name, children, file1, file2) => ({
  name,
  children,
  type: 'node',
  status: chooseType(name, file1, file2),
});

const getValue = (node, file1, file2) => {
  if (_.has(file1, node)) {
    return _.get(file1, node);
  }
  return _.get(file2, node);
};

const makeLeaf = (name, file1, file2) => ({
  name,
  type: 'leaf',
  status: chooseType(name, file1, file2),
  value: getValue(name, file1, file2),
  newValue: _.get(file2, name),
});

const makeTree = (keys, file1, file2, acc = []) => {
  if (keys.length === 0) {
    return _.sortBy(acc, ['name']);
  }
  const [header] = keys;
  const rest = keys.slice(1);
  if (chooseType(header, file1, file2) === 'nested') {
    const subKeys1 = _.get(file1, header);
    const subKeys2 = _.get(file2, header);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const keyIsObject = innerKeys.filter((el) => isValueObject(el, subKeys1, subKeys2));
    const keysNotObject = innerKeys.filter((el) => !isValueObject(el, subKeys1, subKeys2));
    const sortedKeys = [...keysNotObject, ...keyIsObject];
    return makeTree([], subKeys1, subKeys2,
      [...acc, makeNode(header, makeTree(sortedKeys, subKeys1, subKeys2, []), subKeys1, subKeys2)]);
  }
  if (chooseType(header, file1, file2) !== 'nested') {
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2)]);
  }
  return [];
};

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const res = keys.map((item) => {
    const subKeys1 = _.get(parsedData1, item);
    const subKeys2 = _.get(parsedData2, item);
    if (chooseType(item, parsedData1, parsedData2) === 'nested') {
      const itemKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
      const sortedKeys = _.sortBy(itemKeys);
      return makeNode(item, makeTree(sortedKeys, subKeys1, subKeys2), parsedData1, parsedData2);
    }
    return makeLeaf(item, parsedData1, parsedData2);
  });
  const tree = makeNode('', res);
  return tree;
};

export default buildTree;
