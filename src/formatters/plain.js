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
      name, value, type, newValue, children,
    } = node;
    const nodeName = `${path}${name}`.slice(1);
    const printedValue = printValue(value);
    const printedNewValue = printValue(newValue);
    switch (type) {
      case 'root':
        return children.map((item) => cb(item, result, `${path}${name}.`)).join('').slice(0, -1);
      case 'nested':
        return children.map((item) => cb(item, result, `${path}${name}.`)).join('');
      case 'added':
        return `${result}Property '${nodeName}' was added with value: ${printedValue}\n`;
      case 'removed':
        return `${result}Property '${nodeName}' was removed\n`;
      case 'updated':
        return `${result}Property '${nodeName}' was updated. From ${printedValue} to ${printedNewValue}\n`;
      default:
        return '';
    }
  };
  return cb(tree);
};

export default plain;
