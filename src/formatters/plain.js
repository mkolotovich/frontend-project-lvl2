import _ from 'lodash';
import { isLeaf } from './stylish.js';

const printValues = (value, newValue) => {
  const objValue = _.isObject(value) ? '[complex value]' : value;
  const objNewValue = _.isObject(newValue) ? '[complex value]' : newValue;
  const strValue = typeof value === 'string' ? `'${value}'` : value;
  const strNewValue = typeof newValue === 'string' ? `'${newValue}'` : newValue;
  const printValue = _.isObject(value) ? objValue : strValue;
  const printNewValue = _.isObject(newValue) ? objNewValue : strNewValue;
  return [printValue, printNewValue];
};

const plain = (tree, result = '', path = '') => {
  const {
    name, value, status, newValue, children,
  } = tree;
  if (isLeaf(tree)) {
    const nodeName = `${path}${name}`.slice(1);
    const [printValue, printNewValue] = printValues(value, newValue);
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
  const res = children.map((item) => plain(item, result, `${path}${name}.`)).join('');
  return (path === '') ? res.slice(0, -1) : res;
};

export default plain;
