import _ from 'lodash';
import chooseFormatter from './formatters/index.js';

const getKeys = (obj, keys, path, obj1) => {
  const cb = ([key, value]) => {
    if (!_.isObject(value)) {
      keys.add(`${path}.${key}`);
    } else {
      const fullPath = `${path}.${key}`;
      keys.add(fullPath);
      if (!_.isObject(_.get(obj1, fullPath.slice(1))) || fullPath.slice(1).includes('.')) {
        return [];
      }
      return getKeys(value, keys, fullPath, obj1);
    }
    return keys;
  };

  const objKeys = Object.entries(obj);
  objKeys.map((child) => cb(child));
  return keys;
};

const chooseType = (node, file1, file2) => {
  if ((_.isObject(_.get(file1, node.slice(1))) && _.isObject(_.get(file2, node.slice(1))))
  || _.get(file1, node.slice(1)) === _.get(file2, node.slice(1))) {
    return 'unchanged';
  }
  if (_.has(file1, node.slice(1)) && _.has(file2, node.slice(1))
  && _.get(file1, node.slice(1)) !== _.get(file2, node.slice(1))) {
    return 'updated';
  }
  if (_.has(file1, node.slice(1))) {
    return 'removed';
  }
  return 'added';
};

const getValue = (node, file1, file2) => {
  if (_.has(file1, node.slice(1))) {
    return _.get(file1, node.slice(1));
  }
  return _.get(file2, node.slice(1));
};

const makeNode = (acc, node, file1, file2) => {
  const path = node.slice(1).split('.')[0];
  const fullPath = node.slice(1);
  if (node.slice(1).includes('.')) {
    acc[path].children[0][fullPath] = {
      name: node.slice(1),
      type: 'node',
      status: chooseType(node, file1, file2),
      children: [getValue(node, file1, file2)],
    };
  } else {
    acc.children.push({
      name: node.slice(1),
      type: 'node',
      status: chooseType(node, file1, file2),
      children: [],
    });
  }
};

const makeUpdatedNode = (acc, node, file1, file2) => {
  acc.children.push({
    name: node.slice(1),
    type: 'leaf',
    status: chooseType(node, file1, file2),
    value: getValue(node, file1, file2),
  });
};

const makeLeaf = (acc, node, file1, file2) => {
  acc.children.map((item) => {
    if (node.includes(item.name)) {
      item.children.push({
        name: node.slice(1),
        type: 'leaf',
        status: chooseType(node, file1, file2),
        value: getValue(node, file1, file2),
      });
    }
    return [];
  });
};

const cb = ([key, value], acc, node, file1, file2) => {
  const fullPath = node.slice(1);
  const pathToNode = `${fullPath}.${key}`;
  if (!_.isObject(getValue(`${node}.${key}`, file1, file2))) {
    _.last(acc.children[0].children).children.push({
      name: pathToNode,
      type: 'leaf',
      status: chooseType(`${node}.${key}`, file1, file2),
      children: [],
      value,
    });
  } else {
    _.last(acc.children[0].children).children.unshift({
      name: pathToNode,
      type: 'node',
      status: chooseType(pathToNode, file1, file2),
      children: [],
    });
    const child = `${pathToNode}.${Object.keys(getValue(`.${pathToNode}`, file1, file2))[0]}`;
    _.last(acc.children[0].children).children[0].children.push({
      name: child,
      type: 'leaf',
      status: chooseType(`.${child}`, file1, file2),
      value: getValue(`.${child}`, file1, file2),
      newValue: _.get(file2, child),
    });
  }
};

const getChildren = (acc, node, file1, file2) => {
  if (_.isObject(_.get(file2, node.slice(1)))) {
    const objKeys = Object.entries(_.get(file2, node.slice(1)));
    return objKeys.map((child) => cb(child, acc, node, file1, file2));
  }
  return [];
};

const makeInnerNode = (acc, node, file1, file2) => {
  acc.children[0].children.push({
    name: node.slice(1),
    type: 'node',
    status: chooseType(node, file1, file2),
    children: [],
  });
  getChildren(acc, node, file1, file2);
};

const makeChangedLeaf = (acc, node, file1, file2) => {
  acc.children.map((item) => {
    if (node.includes(item.name)) {
      item.children.push({
        name: node.slice(1),
        type: 'leaf',
        status: chooseType(node, file1, file2),
        value: getValue(node, file1, file2),
        newValue: _.get(file2, node.slice(1)),
      });
    }
    return [];
  });
};

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '', file2);
  getKeys(file2, keys, '', file1);
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();
  const ast = sortedKeys.reduce((acc, node) => {
    if (node.slice(1).includes('.')) {
      if (chooseType(node, file1, file2) === 'unchanged' && _.isObject(getValue(node, file1, file2))) {
        makeInnerNode(acc, node, file1, file2);
      } else if (_.isObject(_.get(file1, node.slice(1)))
      && _.isObject(_.get(file2, node.slice(1)))) {
        makeNode(acc, node, file1, file2);
      } else if (chooseType(node, file1, file2) === 'updated') {
        makeChangedLeaf(acc, node, file1, file2);
      } else {
        makeLeaf(acc, node, file1, file2);
      }
    } else if (chooseType(node, file1, file2) !== 'unchanged') {
      makeUpdatedNode(acc, node, file1, file2);
    } else {
      makeNode(acc, node, file1, file2);
    }
    return acc;
  }, { name: '', children: [], type: 'node' });
  return chooseFormatter(formatName, ast);
};

export default compareFiles;
