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
    if (status === 'added') {
      if (typeof value === 'string') return `${result}Property '${nodeName}' was added with value: '${value}'\n`;
      if (_.isObject(value)) return `${result}Property '${nodeName}' was added with value: [complex value]\n`;
      return `${result}Property '${nodeName}' was added with value: ${value}\n`;
    } if (status === 'removed') return `${result}Property '${nodeName}' was removed\n`;
    if (status === 'updated') {
      const [printValue, printNewValue] = _.isObject(value) || _.isObject(newValue)
        ? printComplexValues(value, newValue) : printSimpleValues(value, newValue);
      return `${result}Property '${nodeName}' was updated. From ${printValue} to ${printNewValue}\n`;
    }
    return '';
  }
  const res = children.map((item) => plain(item, result, `${path}${name}.`)).join('');
  if (path === '') return res.slice(0, -1);
  return res;
};

export default plain;
