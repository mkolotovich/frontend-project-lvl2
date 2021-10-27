import _ from 'lodash';

let plainString = '';

const plain = (tree, path) => {
  if (tree.length === 0) {
    return plainString;
  }
  const [head, ...tail] = tree;
  const [name, type] = head;
  let children;
  let fullPath;
  if (path === '') {
    fullPath = name;
  } else {
    fullPath = `${path}.${name}`;
  }
  if (Array.isArray(head[2])) {
    [,, children] = head;
    if (head.length === 4) {
      const [,,, newValue] = head;
      plainString += `Property '${fullPath}' was updated. From [complex value] to '${newValue}'\n`;
    }
    return plain(children, fullPath) + plain(tail, path);
  }
  const [,, value, newValue] = head;
  if (type === 'added') {
    if (_.isObject(value)) {
      if (tail.length === 0) {
        plainString += `Property '${fullPath}' was ${type} with value: [complex value]`;
      } else {
        plainString += `Property '${fullPath}' was ${type} with value: [complex value]\n`;
      }
    } else if (typeof value === 'string') {
      plainString += `Property '${fullPath}' was ${type} with value: '${value}'\n`;
    } else {
      plainString += `Property '${fullPath}' was ${type} with value: ${value}\n`;
    }
    return plain(tail, path);
  } if (type === 'deleted') {
    plainString += `Property '${fullPath}' was removed\n`;
    return plain(tail, path);
  } if (type === 'changed') {
    if (typeof value === 'string') {
      plainString += `Property '${fullPath}' was updated. From '${value}' to '${newValue}'\n`;
    } else {
      plainString += `Property '${fullPath}' was updated. From ${value} to ${newValue}\n`;
    }
    return plain(tail, path);
  }
  return plain(tail, path);
};
export default plain;
