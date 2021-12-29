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

const makeTree = (keys, parsedData1, parsedData2) => keys.map((el) => {
  if (isValueObject(el, parsedData1, parsedData2)) {
    const subKeys1 = _.get(parsedData1, el);
    const subKeys2 = _.get(parsedData2, el);
    const innerKeys = _.union(Object.keys(subKeys1), Object.keys(subKeys2));
    const sortedKeys = _.sortBy(innerKeys);
    return makeNode(el, makeTree(sortedKeys, subKeys1, subKeys2, []), 'nested');
  }
  if (_.get(parsedData1, el) === _.get(parsedData2, el)) {
    return {
      name: el, type: 'unchanged', value: parsedData1[el], newValue: parsedData2[el],
    };
  } if (_.has(parsedData1, el) && _.has(parsedData2, el)
  && _.get(parsedData1, el) !== _.get(parsedData2, el)) {
    return {
      name: el, type: 'updated', value: parsedData1[el], newValue: parsedData2[el],
    };
  } if (_.has(parsedData1, el)) {
    return {
      name: el, type: 'removed', value: parsedData1[el], newValue: parsedData2[el],
    };
  }
  return {
    name: el, type: 'added', value: parsedData2[el], newValue: parsedData1[el],
  };
});

const buildTree = (parsedData1, parsedData2) => {
  const keys = _.union(Object.keys(parsedData1), Object.keys(parsedData2));
  const sortedGroups = _.sortBy(keys);
  const res = makeTree(sortedGroups, parsedData1, parsedData2);
  const tree = makeNode('', res, 'root');
  return tree;
};

export default buildTree;
