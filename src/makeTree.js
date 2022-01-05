import _ from 'lodash';

const isValueObject = (node, file1, file2) => {
  if (_.isPlainObject(_.get(file1, node)) && _.isPlainObject(_.get(file2, node))) {
    return true;
  }
  return false;
};

const makeNode = (key, type, children, value, newValue) => {
  if (type !== 'nested' && type !== 'root') {
    return {
      key, type, children, value, newValue,
    };
  }
  return { key, type, children };
};

const makeTree = (keys, parsedData1, parsedData2) => keys.map((el) => {
  if (isValueObject(el, parsedData1, parsedData2)) {
    const subKeys1 = _.get(parsedData1, el);
    const subKeys2 = _.get(parsedData2, el);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const sortedKeys = _.sortBy(innerKeys);
    return makeNode(el, 'nested', makeTree(sortedKeys, subKeys1, subKeys2, []));
  }
  if (_.get(parsedData1, el) === _.get(parsedData2, el)) {
    return makeNode(el, 'unchanged', [], parsedData2[el]);
  } if (_.has(parsedData1, el) && _.has(parsedData2, el)
  && _.get(parsedData1, el) !== _.get(parsedData2, el)) {
    return makeNode(el, 'updated', [], parsedData1[el], parsedData2[el]);
  } if (_.has(parsedData1, el)) {
    return makeNode(el, 'removed', [], parsedData1[el]);
  }
  return makeNode(el, 'added', [], parsedData2[el]);
});

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', 'root', res);
  return tree;
};

export default buildTree;
