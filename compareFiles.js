import _ from 'lodash';
import chooseFormatter from './formatters/index.js';

const getKeys = (obj, keys, path, obj1) => {
  const cb = ([key, value]) => {
    if (!_.isObject(value)) {
      keys.add(`${path}.${key}`);
    } else {
      const fullPath = `${path}.${key}`;
      keys.add(fullPath);
      if (!_.isObject(_.get(obj1, fullPath.slice(1)))) {
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
  if (node.slice(1).includes('.')) {
    const rest = node.slice(1).split('.');
    if (rest.length === 2) {
      acc.children.map((item) => {
        if (node.includes(item.name)) {
          item.children.push({
            name: node.slice(1),
            type: 'node',
            status: chooseType(node, file1, file2),
            children: [],
          });
        }
        return [];
      });
    } else {
      _.last(acc.children[0].children).children.push({
        name: node.slice(1),
        type: 'node',
        status: chooseType(node, file1, file2),
        children: [],
      });
    }
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
    name: _.last(node.slice(1).split('.')),
    type: 'leaf',
    status: chooseType(node, file1, file2),
    value: getValue(node, file1, file2),
  });
};

const makeLeaf = (acc, node, file1, file2) => {
  const rest = node.slice(1).split('.');
  if (rest.length === 2) {
    acc.children.map((item) => {
      if (node.includes(item.name)) {
        item.children.push({
          name: _.last(node.slice(1).split('.')),
          type: 'leaf',
          status: chooseType(node, file1, file2),
          value: getValue(node, file1, file2),
        });
      }
      return [];
    });
  } else {
    _.last(_.last(acc.children).children).children.push({
      name: _.last(node.slice(1).split('.')),
      type: 'leaf',
      status: chooseType(node, file1, file2),
      value: getValue(node, file1, file2),
    });
  }
};

const makeChangedLeaf = (acc, node, file1, file2) => {
  const rest = node.slice(1).split('.');
  if (rest.length === 2) {
    acc.children.map((item) => {
      if (node.includes(item.name)) {
        item.children.push({
          name: _.last(node.slice(1).split('.')),
          type: 'leaf',
          status: chooseType(node, file1, file2),
          value: getValue(node, file1, file2),
          newValue: _.get(file2, node.slice(1)),
        });
      }
      return [];
    });
  } else if (rest.length === 4) {
    _.last(acc.children[0].children).children[0].children.push({
      name: _.last(node.slice(1).split('.')),
      type: 'leaf',
      status: chooseType(node, file1, file2),
      value: getValue(node, file1, file2),
      newValue: _.get(file2, node.slice(1)),
    });
  } else {
    _.last(_.last(acc.children).children).children.push({
      name: _.last(node.slice(1).split('.')),
      type: 'leaf',
      status: chooseType(node, file1, file2),
      value: getValue(node, file1, file2),
      newValue: _.get(file2, node.slice(1)),
    });
  }
};

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '', file2);
  getKeys(file2, keys, '', file1);
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();
  const ast = sortedKeys.reduce((acc, node) => {
    if (node.slice(1).includes('.')) {
      if (_.isObject(_.get(file1, node.slice(1)))
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
