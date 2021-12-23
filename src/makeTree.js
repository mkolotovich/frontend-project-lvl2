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
  const [header] = keys;
  const rest = keys.slice(1);
  if (isValueObject(header, file1, file2)) {
    const subKeys1 = _.get(file1, header);
    const subKeys2 = _.get(file2, header);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const keyIsObject = innerKeys.filter((el) => isValueObject(el, subKeys1, subKeys2));
    const keysNotObject = innerKeys.filter((el) => !isValueObject(el, subKeys1, subKeys2));
    const sortedKeys = [...keysNotObject, ...keyIsObject];
    return makeTree(rest, file1, file2,
      [...acc, makeNode(header, makeTree(sortedKeys, subKeys1, subKeys2, []), 'nested')]);
  }
  if (_.get(file1, header) === _.get(file2, header)) {
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2, 'unchanged')]);
  } if (_.has(file1, header) && _.has(file2, header)
  && _.get(file1, header) !== _.get(file2, header)) {
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2, 'updated')]);
  } if (_.has(file1, header)) {
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2, 'removed')]);
  }
  return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2, 'added')]);
};

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', res, 'nested');
  return tree;
};

export default buildTree;
