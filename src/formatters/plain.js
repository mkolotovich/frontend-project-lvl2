import _ from 'lodash';

const printValue = (value) => {
  if (_.isObject(value)) {
    return '[complex value]';
  } if (typeof value === 'string') {
    return `'${value}'`;
  }
  return value;
};

const plain = (tree) => {
  const cb = (node, result = '', path = '') => {
    const {
      key, value, type, newValue, children,
    } = node;
    const nodeName = `${path}${key}`.slice(1);
    const printedValue = printValue(value);
    const printedNewValue = printValue(newValue);
    switch (type) {
      case 'root':
        return children.map((item) => cb(item, result, `${path}${key}.`)).join('\n');
      case 'nested':
        return children.flatMap((item) => cb(item, result, `${path}${key}.`)).join('\n');
      case 'added':
        return `${result}Property '${nodeName}' was added with value: ${printedValue}`;
      case 'removed':
        return `${result}Property '${nodeName}' was removed`;
      case 'updated':
        return `${result}Property '${nodeName}' was updated. From ${printedValue} to ${printedNewValue}`;
      default:
        return [];
    }
  };
  return cb(tree);
};

export default plain;
