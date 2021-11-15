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

// const makeNode = (acc, node, file1, file2) => {
//   if (node.slice(1).includes('.')) {
//     const rest = node.slice(1).split('.');
//     if (rest.length === 2) {
//       acc.children.map((item) => {
//         if (node.includes(item.name)) {
//           item.children.push({
//             name: _.last(node.slice(1).split('.')),
//             type: 'node',
//             status: chooseType(node, file1, file2),
//             children: [],
//           });
//         }
//         return [];
//       });
//     } else {
//       _.last(acc.children[0].children).children.push({
//         name: _.last(node.slice(1).split('.')),
//         type: 'node',
//         status: chooseType(node, file1, file2),
//         children: [],
//       });
//     }
//   } else {
//     acc.children.push({
//       name: _.last(node.slice(1).split('.')),
//       type: 'node',
//       status: chooseType(node, file1, file2),
//       children: [],
//     });
//   }
// };
const makeNode = (name, children) => ({
  name,
  children,
  type: 'node',
});

// const makeUpdatedNode = (acc, node, file1, file2) => {
//   acc.children.push({
//     name: _.last(node.slice(1).split('.')),
//     type: 'leaf',
//     status: chooseType(node, file1, file2),
//     value: getValue(node, file1, file2),
//   });
// };

// const makeLeaf = (acc, node, file1, file2) => {
//   const rest = node.slice(1).split('.');
//   if (rest.length === 2) {
//     acc.children.map((item) => {
//       if (node.includes(item.name)) {
//         item.children.push({
//           name: _.last(node.slice(1).split('.')),
//           type: 'leaf',
//           status: chooseType(node, file1, file2),
//           value: getValue(node, file1, file2),
//         });
//       }
//       return [];
//     });
//   } else {
//     _.last(_.last(acc.children).children).children.push({
//       name: _.last(node.slice(1).split('.')),
//       type: 'leaf',
//       status: chooseType(node, file1, file2),
//       value: getValue(node, file1, file2),
//     });
//   }
// };
const makeLeaf = (name, file1, file2) => ({
  name: _.last(name.slice(1).split('.')),
  type: 'leaf',
  status: chooseType(name, file1, file2),
  value: getValue(name, file1, file2),
});

// const makeChangedLeaf = (acc, node, file1, file2) => {
//   const rest = node.slice(1).split('.');
//   if (rest.length === 2) {
//     acc.children.map((item) => {
//       if (node.includes(item.name)) {
//         item.children.push({
//           name: _.last(node.slice(1).split('.')),
//           type: 'leaf',
//           status: chooseType(node, file1, file2),
//           value: getValue(node, file1, file2),
//           newValue: _.get(file2, node.slice(1)),
//         });
//       }
//       return [];
//     });
//   } else if (rest.length === 4) {
//     _.last(acc.children[0].children).children[0].children.push({
//       name: _.last(node.slice(1).split('.')),
//       type: 'leaf',
//       status: chooseType(node, file1, file2),
//       value: getValue(node, file1, file2),
//       newValue: _.get(file2, node.slice(1)),
//     });
//   } else {
//     _.last(_.last(acc.children).children).children.push({
//       name: _.last(node.slice(1).split('.')),
//       type: 'leaf',
//       status: chooseType(node, file1, file2),
//       value: getValue(node, file1, file2),
//       newValue: _.get(file2, node.slice(1)),
//     });
//   }
// };
const makeChangedLeaf = (name, file1, file2) => ({
  name: _.last(name.slice(1).split('.')),
  type: 'leaf',
  status: chooseType(name, file1, file2),
  value: getValue(name, file1, file2),
  newValue: _.get(file2, name.slice(1)),
});

const makeTree = (keys, file1, file2, acc) => {
  if (keys.length === 0) {
    // return acc;
    return _.sortBy(acc, ['name']);
  }
  const [header, ...rest] = keys;
  if (header.slice(1).includes('.')) {
    if (_.isObject(_.get(file1, header.slice(1)))
    && _.isObject(_.get(file2, header.slice(1)))) {
      return makeTree([], file1, file2, [...acc, makeNode(_.last(header.slice(1).split('.')), makeTree(rest, file1, file2, []))]);
      // return makeTree([], file1, file2, [..._.sortBy(acc, ['name']),
      //   makeNode(_.last(header.slice(1).split('.')), makeTree(rest, file1, file2, []))]);
    } if (chooseType(header, file1, file2) === 'updated') {
      return makeTree(rest, file1, file2, [...acc, makeChangedLeaf(header, file1, file2)]);
    }
    return makeTree(rest, file1, file2, [...acc, makeLeaf(header, file1, file2)]);
  }
  if (chooseType(header, file1, file2) !== 'unchanged') {
    return makeLeaf(header, file1, file2);
  }
  // const newAcc = makeNode(header, []);
  // return makeTree(rest, file1, file2, newAcc.children);
  return makeTree(rest, file1, file2, []);
};

const sort = (arr, acc = []) => {
  const [head, ...tail] = arr;
  if (tail.length === 0) {
    return [...acc, head];
  }
  const [next] = tail;
  if (head.split('.').length > next.split('.').length) {
    return sort([...tail.slice(1), head], [...acc, next]);
  }
  if (head.slice(1).includes('.') && next.includes(_.last(head.split('.')))) {
    return sort([...tail.slice(1), next], [...acc, head]);
  }
  return sort(tail, [...acc, head]);
};

const compareFiles = (file1, file2, formatName) => {
  const keys = new Set();
  getKeys(file1, keys, '', file2);
  getKeys(file2, keys, '', file1);
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();
  // const sortedKeys = _.sortBy(keysArray, (key) => {});
  const groups = sortedKeys.filter((item) => {
    if (!item.slice(1).includes('.')) {
      return true;
    }
    return false;
  });
  const groupKeys = groups.map((item) => sortedKeys.filter((el) => {
    if (el.includes(item)) {
      return true;
    }
    return false;
  }));
  // sort(groupKeys[0]);
  // const ast = sortedKeys.reduce((acc, node) => {
  //   if (node.slice(1).includes('.')) {
  //     if (_.isObject(_.get(file1, node.slice(1)))
  //     && _.isObject(_.get(file2, node.slice(1)))) {
  //       makeNode(acc, node, file1, file2);
  //     } else if (chooseType(node, file1, file2) === 'updated') {
  //       // makeChangedLeaf(acc, node, file1, file2);
  //       makeChangedLeaf(node, file1, file2);
  //     } else {
  //       // makeLeaf(acc, node, file1, file2);
  //       makeLeaf(node, file1, file2);
  //     }
  //   } else if (chooseType(node, file1, file2) !== 'unchanged') {
  //     // makeUpdatedNode(acc, node, file1, file2);
  //     makeLeaf(node, file1, file2);
  //   } else {
  //     // makeNode(acc, node, file1, file2);
  //     acc.children.push(makeNode(node.slice(1), []));
  //   }
  //   // return acc;
  //   return acc;
  // // }, { name: '', children: [], type: 'node' });
  // }, makeNode('', []));
  // return chooseFormatter(formatName, ast);
  // return makeTree(sortedKeys, file1, file2);
  // const res = groupKeys.map((item) => makeTree(item, file1, file2, makeNode(item[0], [])));
  // const res = groupKeys.map((item) => makeTree(item, file1, file2));
  const res = groupKeys.map((item) => {
    const sorted = sort(item);
    // return makeTree(sorted, file1, file2);
    if (Array.isArray(makeTree(sorted, file1, file2))) {
      const [group] = sorted;
      return makeNode(group.slice(1), makeTree(sorted, file1, file2));
    }
    return makeTree(sorted, file1, file2);
  });
  const tree = makeNode('', res);
  // return tree;
  return chooseFormatter(formatName, tree);
};

export default compareFiles;
