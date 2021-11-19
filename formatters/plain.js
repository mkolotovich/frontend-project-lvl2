import _ from 'lodash';
import { isLeaf } from './stylish.js';

const isString = (value, newValue) => {
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
      const [printValue, printNewValue] = isString(value, newValue);
      if (_.isObject(value)) return `${result}Property '${nodeName}' was updated. From [complex value] to '${newValue}'\n`;
      if (_.isObject(newValue)) return `${result}Property '${nodeName}' was updated. From ${value} to [complex value]\n`;
      return `${result}Property '${nodeName}' was updated. From ${printValue} to ${printNewValue}\n`;
    }
    return '';
  }
  const res = children.map((item) => plain(item, result, `${path}${name}.`)).join('');
  if (path === '') return res.slice(0, -1);
  return res;
};

export default plain;
