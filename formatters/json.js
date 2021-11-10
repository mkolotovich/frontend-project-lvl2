import _ from 'lodash';
import {
  isLeaf, makeSpace, spaceSize,
} from './stylish.js';
// let string = '{\n';
// let spaceSize = 2;

// const makeSpace = (size, space) => {
//   let spaceType = space;
//   if (size > 0) {
//     spaceType += ' ';
//     return makeSpace(size - 1, spaceType);
//   }
//   return space;
// };

// const makeLine = (name) => {
//   string += `${makeSpace(spaceSize, '')}"${name}": `;
//   string += '{\n';
//   spaceSize += 2;
// };

// const res = (json, children, tail) => json(children) + json(tail);

// const json = (tree) => {
//   const cb = () => {
//     if (!Array.isArray(tree)) {
//       if (Object.entries(tree).length === 1) {
//         const [name, value] = Object.entries(tree)[0];
//         string += `${makeSpace(spaceSize, '')}"${name}": "${value}"\n`;
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}},\n`;
//       } else {
//         const [name, value] = Object.entries(tree)[0];
//         if (!_.isObject(value)) {
//           string += `${makeSpace(spaceSize, '')}"${name}": ${value},\n`;
//           const [name1, value1] = Object.entries(tree)[1];
//           string += `${makeSpace(spaceSize, '')}"${name1}": {\n`;
//           spaceSize += 2;
//           const [subName, subValue] = Object.entries(value1)[0];
//           string += `${makeSpace(spaceSize, '')}"${subName}": ${subValue}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}},\n`;
//         } else {
//           string += `${makeSpace(spaceSize, '')}"${name}": {\n`;
//           spaceSize += 2;
//           const subName = Object.keys(value);
//           string += `${makeSpace(spaceSize, '')}"${subName}": {\n`;
//           const [subSubName, subValue] = Object.entries(value[subName])[0];
//           spaceSize += 2;
//           string += `${makeSpace(spaceSize, '')}"${subSubName}": ${subValue}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}},\n`;
//           const [name1, value1] = Object.entries(tree)[1];
//           string += `${makeSpace(spaceSize, '')}"${name1}": ${value1}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}}\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}}`;
//         }
//       }
//       return string;
//     }
//     if (tree.length === 0) {
//       return string;
//     }
//     const [head, ...tail] = tree;
//     const [name, type] = head;
//     const children = head[2];
//     if (type === 'unchanged' && head[2] instanceof Array) {
//       makeLine(name);
//       return json(children) + json(tail);
//     } if (type === 'added' && head[2] instanceof Object) {
//       makeLine(name);
//       res(json, children, tail);
//     } else if (type === 'deleted' && head[2] instanceof Object) {
//       makeLine(name);
//       res(json, children, tail);
//     } else if (type === 'added' && head[2] instanceof Array) {
//       spaceSize += 2;
//       makeLine(name, '+');
//       res(json, children, tail);
//     } else if (type === 'deleted' && head[2] instanceof Array) {
//       makeLine(name, '-');
//       res(json, children, tail);
//     } else if (type === 'added' && typeof head[2] === 'string') {
//       if (tail.length === 0) {
//         string += `${makeSpace(spaceSize, '')}"${name}": "${head[2]}"\n`;
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}}\n`;
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}},\n`;
//       } else {
//         string += `${makeSpace(spaceSize, '')}"${name}": "${head[2]}",\n`;
//       }
//       json(tail);
//     } else if (type === 'added') {
//       if (tail.length !== 0) {
//         string += `${makeSpace(spaceSize, '')}"${name}": ${head[2]},\n`;
//       } else {
//         string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}}\n`;
//         spaceSize -= 4;
//         string += `${makeSpace(spaceSize, '')}}\n`;
//         spaceSize -= 2;
//       }
//       json(tail);
//     } else if (type === 'unchanged') {
//       string += `${makeSpace(spaceSize, '')}"${name}": "${head[2]}",\n`;
//       json(tail);
//     } else if (type === 'deleted') {
//       string += `${makeSpace(spaceSize, '')}"${name}": ${head[2]},\n`;
//       json(tail);
//     } else if (type === 'changed') {
//       if (tail.length !== 0) {
//         string += `${makeSpace(spaceSize, '')}"${name}": [\n`;
//         spaceSize += 2;
//         if (typeof head[2] === 'string') {
//           string += `${makeSpace(spaceSize, '')}"${head[2]}",\n`;
//           string += `${makeSpace(spaceSize, '')}"${head[3]}"\n`;
//         } else {
//           string += `${makeSpace(spaceSize, '')}${head[2]},\n`;
//           string += `${makeSpace(spaceSize, '')}${head[3]}\n`;
//         }
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}],\n`;
//       } else {
//         if (head[2] instanceof Array) {
//           string += `${makeSpace(spaceSize, '')}"${name}": [\n`;
//           spaceSize += 2;
//           string += `${makeSpace(spaceSize, '')}{\n`;
//           spaceSize += 2;
//           const [subName, , value] = head[2];
//           string += `${makeSpace(spaceSize, '')}"${subName}": "${value}"\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}},\n`;
//           string += `${makeSpace(spaceSize, '')}"${head[3]}"\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}]\n`;
//         } else {
//           string += `${makeSpace(spaceSize, '')}"${name}": [\n`;
//           spaceSize += 2;
//           string += `${makeSpace(spaceSize, '')}"${head[2]}",\n`;
//           string += `${makeSpace(spaceSize, '')}"${head[3]}"\n`;
//           spaceSize -= 2;
//           string += `${makeSpace(spaceSize, '')}]\n`;
//         }
//         spaceSize -= 2;
//         string += `${makeSpace(spaceSize, '')}},\n`;
//       }
//       json(tail);
//     }
//     return string;
//   };
//   cb();
//   return string;
// };
const makeLine = (symbol, item, depth) => {
  if (!isLeaf(item)) {
    const itemName = item.name;
    if (depth > 1) {
      return `${makeSpace(spaceSize * depth, '')}${symbol}"${itemName}": {\n`;
    }
    return `${makeSpace(spaceSize, '')}${symbol}"${itemName}": {\n`;
  }
  return '';
};

const replacer = (obj, size, acc = '') => {
  const [head, tail] = Object.entries(obj);
  const [key, value] = head;
  if (_.isObject(value)) {
    if (tail) {
      return replacer(value, size + 4, `${acc}${makeSpace(size + 4, '')}  ${key}: {\n`) + replacer(Object.fromEntries([tail]), size, `${makeSpace(size + 10, '')}}\n${makeSpace(size + 6, '')}}\n`);
    }
    return replacer(value, size + 4, `${acc}${makeSpace(size + 4, '')}  ${key}: {\n`);
  }
  if (tail !== undefined) {
    const result = `${acc}${makeSpace(size + 4, '')}  ${key}: ${value}\n`;
    return result + replacer(Object.fromEntries([tail]), size, acc);
  }
  return `${acc}${makeSpace(size + 4, '')}"${key}": "${value}"\n`;
};

const json = (data, result, depth = 0) => {
  // const {
  //   name, value, status, newValue, children,
  // } = data;
  // if (isLeaf(data)) {
  //   if (status === 'updated') {
  //     if (typeof value === 'string') {
  //       return `${result}${makeSpace(spaceSize * depth, '')}"${name}": [\n${makeSpace(spaceSize * depth + spaceSize, '')}"${value}",\n${makeSpace(spaceSize * depth + spaceSize, '')}"${newValue}"\n${makeSpace(spaceSize * depth, '')}]\n`;
  //     }
  //     return `${result}${makeSpace(spaceSize * depth, '')}"${name}": [\n${makeSpace(spaceSize * depth + spaceSize, '')}${value},\n${makeSpace(spaceSize ** depth + spaceSize, '')}${newValue}\n${makeSpace(spaceSize ** depth, '')}],\n`;
  //   }
  //   if (typeof value === 'string') {
  //     return `${result}${makeSpace(spaceSize * depth, '')}"${name}": "${value}",\n`;
  //   }
  //   if (_.isObject(value)) {
  //     return `${result}${makeSpace(spaceSize ** depth, '')}"${name}": {\n${replacer(value, spaceSize)}${makeSpace(spaceSize * depth, '')}},\n`;
  //   }
  //   return `${result}${makeSpace(spaceSize ** depth, '')}"${name}": ${value},\n`;
  // }
  // const line = children.map((item) => json(item, makeLine('', item, depth + 1), depth + 1));
  // if (name === '') {
  //   return `{\n${result}${line.join('')}${makeSpace(spaceSize * depth * spaceSize, '')}}`;
  // }
  // if (line.length > 1) {
  //   _.last(line).slice(0, -2);
  // }
  // return `${result}${line.join('')}${makeSpace(spaceSize * depth, '')}},\n`;
  return JSON.stringify(data, null, '  ');
};

export default json;
