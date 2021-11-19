import _ from 'lodash';
import { isLeaf } from './stylish.js';

const printSimpleValues = (value, newValue) => {
  if (typeof value === 'string' && typeof newValue === 'string') {
    return [`'${value}'`, `'${newValue}'`];
  }
  if (typeof value === 'string') {
    return [`'${value}'`, newValue];
  }
  if (typeof newValue === 'string') {
    return [value, `'${newValue}'`];
  }
  return [value, newValue];
};

const printComplexValues = (value, newValue) => {
  if (_.isObject(value)) {
    return ['[complex value]', `'${newValue}'`];
  }
  if (_.isObject(newValue)) {
    return [value, '[complex value]'];
  }
  return [value, newValue];
};

const plain = (tree, result, path = '') => {
  const {
    name, value, status, newValue, children,
  } = tree;
  if (isLeaf(tree)) {
    const nodeName = `${path}${name}`.slice(1);
    const [printValue, printNewValue] = _.isObject(value) || _.isObject(newValue)
      ? printComplexValues(value, newValue) : printSimpleValues(value, newValue);
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
  // if (path === '') return res.slice(0, -1);
  return res;
};

export default plain;
