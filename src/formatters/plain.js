import _ from 'lodash';
import { isLeaf } from './stylish.js';

const printValues = (value) => {
  const objValue = _.isObject(value) ? '[complex value]' : value;
  const strValue = typeof value === 'string' ? `'${value}'` : value;
  const printValue = _.isObject(value) ? objValue : strValue;
  return printValue;
};

const plain = (tree) => {
  const cb = (node, result = '', path = '') => {
    const {
      name, value, status, newValue, children,
    } = node;
    if (isLeaf(node)) {
      const nodeName = `${path}${name}`.slice(1);
      const printValue = printValues(value);
      const printNewValue = printValues(newValue);
      switch (status) {
        case 'added':
          return `${result}Property '${nodeName}' was added with value: ${printValue}\n`;
        case 'removed':
          return `${result}Property '${nodeName}' was removed\n`;
        case 'updated':
          return `${result}Property '${nodeName}' was updated. From ${printValue} to ${printNewValue}\n`;
        default:
          return '';
      }
    }
    const res = children.map((item) => cb(item, result, `${path}${name}.`)).join('');
    return (path === '') ? res.slice(0, -1) : res;
  };
  return cb(tree);
};

export default plain;
