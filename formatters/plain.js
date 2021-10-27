import _ from 'lodash';

const plain = (tree, path) => {
  let res = '';
  let fullPath;
  const cb = (list, pathToNode) => {
    if (list.length === 0) {
      return res;
    }
    let children;
    let newValue;
    const [head, ...tail] = list;
    const [name, type] = head;
    if (pathToNode === '') {
      fullPath = name;
    } else {
      fullPath = `${pathToNode}.${name}`;
    }
    if (Array.isArray(head[2])) {
      [,, children] = head;
      if (head.length === 4) {
        [,,, newValue] = head;
        res += `Property '${fullPath}' was updated. From [complex value] to '${newValue}'\n`;
      }
      return cb(children, fullPath) + cb(tail, pathToNode);
    }
    const [,, value] = head;
    [,,, newValue] = head;
    if (type === 'added') {
      if (_.isObject(value)) {
        if (tail.length === 0) {
          res += `Property '${fullPath}' was ${type} with value: [complex value]`;
        } else {
          res += `Property '${fullPath}' was ${type} with value: [complex value]\n`;
        }
      } else if (typeof value === 'string') {
        res += `Property '${fullPath}' was ${type} with value: '${value}'\n`;
      } else {
        res += `Property '${fullPath}' was ${type} with value: ${value}\n`;
      }
      return cb(tail, pathToNode);
    }
    if (type === 'deleted') {
      res += `Property '${fullPath}' was removed\n`;
      return cb(tail, pathToNode);
    }
    if (type === 'changed') {
      if (typeof value === 'string') {
        res += `Property '${fullPath}' was updated. From '${value}' to '${newValue}'\n`;
      } else {
        res += `Property '${fullPath}' was updated. From ${value} to ${newValue}\n`;
      }
      return cb(tail, pathToNode);
    }
    return cb(tail, pathToNode);
  };
  cb(tree, path);
  return res;
};

export default plain;
