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
  type: 'node',
  status: type,
});

const getValue = (node, file1, file2) => {
  if (_.has(file1, node)) {
    return _.get(file1, node);
  }
  return _.get(file2, node);
};

const makeLeaf = (name, file1, file2, type) => ({
  name,
  type: 'leaf',
  status: type,
  value: getValue(name, file1, file2),
  newValue: _.get(file2, name),
});

const makeTree = (keys, file1, file2, acc = []) => {
  if (keys.length === 0) {
    return _.sortBy(acc, ['name']);
  }
  const [header] = keys;
  const rest = keys.slice(1);
  const nodeType = { };
  if (isValueObject(header, file1, file2)) {
    nodeType.type = 'nested';
  } else if (_.get(file1, header) === _.get(file2, header)) {
    nodeType.type = 'unchanged';
  } else if (_.has(file1, header) && _.has(file2, header)
  && _.get(file1, header) !== _.get(file2, header)) {
    nodeType.type = 'updated';
  } else if (_.has(file1, header)) {
    nodeType.type = 'removed';
  } else {
    nodeType.type = 'added';
  }
  if (isValueObject(header, file1, file2)) {
    const subKeys1 = _.get(file1, header);
    const subKeys2 = _.get(file2, header);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const keyIsObject = innerKeys.filter((el) => isValueObject(el, subKeys1, subKeys2));
    const keysNotObject = innerKeys.filter((el) => !isValueObject(el, subKeys1, subKeys2));
    const sortedKeys = [...keysNotObject, ...keyIsObject];
    return makeTree(rest, file1, file2,
      [...acc, makeNode(header, makeTree(sortedKeys, subKeys1, subKeys2, []), nodeType.type)]);
  }
  return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2, nodeType.type)]);
};

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', res);
  return tree;
};

export default buildTree;
