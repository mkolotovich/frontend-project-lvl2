import _ from 'lodash';

const keys = new Set();

const getKeys = (obj, keys, path) => {
  const cb = ([key, value]) => {
    if(!_.isObject(value)) {
      fullPath = `${path}.${key}`;
      keys.add(fullPath);
    } else {
      if(path === '') {
        fullPath = key;
        keys.add(key);
        return getKeys(value, keys, fullPath);
      } else {
        keys.add(`${path}.${key}`);
        return getKeys(value, keys, `${path}.${key}`);
      }
    }
  };
  let fullPath = path;
  const objKeys = Object.entries(obj);
  objKeys.map((child) => cb(child));
  return keys;
};

const structure = [];

const makeDiff = (list, group, file1, file2) => {
  if (list.length === 0) {
    return structure;
  }
  const [head, ...tail] = list;
  if(_.isObject(_.get(file1, head)) && _.isObject(_.get(file2, head))) {
    if(head.includes('.')) {
      const [...rest] = head.split('.');
      const name = _.last(rest);
      if(rest.length === 3) {
        _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', []]);
      } else {
        _.last(structure[group]).push([name, 'unchanged', []]);
      }
    } else {
      structure.push([head, 'unchanged', []]);
      if(structure[group][0] !== head) {
        group += 1;
      }
    } 
    return makeDiff(tail, group, file1, file2);
  } 
  const [...rest] = head.split('.');
  const name = _.last(rest);
  if(_.has(file1, head) && _.has(file2, head) && _.get(file1, head) === _.get(file2, head)) {
    if(rest.length === 3) {
      _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', _.get(file2, head)]);
    } else {
      _.last(structure[group]).push([name, 'unchanged', _.get(file2, head)]);
    }
  } else if (_.has(file1, head) && _.has(file2, head)) {
    if(rest.length === 4) {
      _.last(_.last(_.last(_.last(_.last(structure[group]))))).push([name, 'changed', _.get(file1, head), _.get(file2, head)]);
    } else {
      if(_.isObject(_.get(file1, head))) {
        _.last(structure[group]).push([name, 'changed', [], _.get(file2, head)]);
      } else {
        _.last(structure[group]).push([name, 'changed', _.get(file1, head), _.get(file2, head)]);
      }
    }
  } else if(_.has(file2, head)) {
    if(_.isObject(_.get(file2, head))) {
      if(rest.length === 1) {
        group += 1;
        structure.push([head, 'added', _.get(file2, head)]);
        return structure;
      } 
      else {
        if(rest.length === 3) {
          _.last(_.last(structure[group])).push([name, 'unchanged']);
        } else {
          const [path,] = rest;
          if(_.has(file1, path) && _.has(file2, path)) {
            _.last(structure[group]).push([name, 'added', _.get(file2, head)]);
            tail.shift();
          } else {
            _.last(structure[group]).push([name, 'unchanged']);
          }
        }
      }
    }
    else {
      if(rest.length === 3) {
        _.last(_.last(_.last(structure[group]))).push([name, 'added', _.get(file2, head)]);
      } else if(rest.length === 4) {
        _.last(_.last(_.last(structure[group]))).push([name, 'unchanged', _.get(file2, head)]);
      } else {
        const [path,] = rest;
        if(_.has(file1, path) && _.has(file2, path)) {
          _.last(structure[group]).push([name, 'added', _.get(file2, head)]);
        } else {
          _.last(structure[group]).push([name, 'unchanged', _.get(file2, head)]);
        }
      }
    }
  } else if(_.has(file1, head)) {
    const path = `${rest[0]}.${rest[1]}`;
    if(_.has(file1, path) && _.has(file2, path)) {
      _.last(_.last(structure[group]))[2].push(name, 'unchanged', _.get(file1, head));
    } else {
      if(rest.length === 1) {
        group += 1;
        structure.push([head, 'deleted', _.get(file1, head)]);
        const filteredTail = tail.filter(item => {
          if(!item.includes(head)) {
            return item;
          }
        });
        return makeDiff(filteredTail, group, file1, file2);
      } else {
        if(_.isObject(_.get(file1, head))) {
          _.last(structure[group]).push([name, 'unchanged']);
        } else {
          if(rest.length === 3) {
            _.last(_.last(structure[group])).push([name, 'unchanged', _.get(file1, head)]);
          } else {
            _.last(structure[group]).push([name, 'deleted', _.get(file1, head)]);
          }
        }
      }
    }
  }
  return makeDiff(tail, group, file1, file2);
}

const compareFiles = (file1, file2) => {
  getKeys(file1, keys, '');
  getKeys(file2, keys, '');
  const keysArray = Array.from(keys);
  const sortedKeys = keysArray.sort();  
  const structre = makeDiff(sortedKeys, 0, file1, file2);
  stylish(structre);
  return string;
};

let string = '{\n';
let spaceSize = 2;

const makeSpace = (size, space) => {
  if(size > 0) {
    space += ' ';
    return makeSpace(size - 1, space);
  }
  return space;
};

const stylish = (tree) => {
  if(!Array.isArray(tree)) {
    if(Object.entries(tree).length === 1) {
      const [name, value] = Object.entries(tree)[0];
      string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    } else {
      const [name, value] = Object.entries(tree)[0];
      if(!_.isObject(value)) {
        string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
        const [name1, value1] = Object.entries(tree)[1];
        string += `${makeSpace(spaceSize, '')}  ${name1}: {\n`;
        spaceSize += 4;
        const [subName, subValue]= Object.entries(value1)[0];
        string += `${makeSpace(spaceSize, '')}  ${subName}: ${subValue}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      } else {
        string += `${makeSpace(spaceSize, '')}  ${name}: {\n`;
        spaceSize += 4;
        const subName = Object.keys(value);
        string += `${makeSpace(spaceSize, '')}  ${subName}: {\n`;
        const [subSubName, subValue] = Object.entries(value[subName])[0];
        spaceSize += 4;
        string += `${makeSpace(spaceSize, '')}  ${subSubName}: ${subValue}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}\n`;
        const [name1, value1] = Object.entries(tree)[1];
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}  ${name1}: ${value1}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}`;
      }
    }
    return;
  }
  if(tree.length === 0) {
    return string;
  }
  const [head, ...tail] =  tree;
  const [name, type] = head;
  if(type === 'unchanged' && head[2] instanceof Array) {
    string += `${makeSpace(spaceSize, '')}  ${name}: `;
    const children = head[2];
    string += `{\n`;
    spaceSize += 4;
    return stylish(children) + stylish(tail);
  } else if(type === 'added' && head[2] instanceof Object) {
    string += `${makeSpace(spaceSize, '')}+ ${name}: `;
    const children = head[2];
    string += `{\n`;
    spaceSize += 4;
    stylish(children) + stylish(tail);
  } else if(type === 'deleted' && head[2] instanceof Object) {
    string += `${makeSpace(spaceSize, '')}- ${name}: `;
    const children = head[2];
    string += `{\n`;
    spaceSize += 4;
    stylish(children) + stylish(tail);
  } else if(type === 'added' && head[2] instanceof Array) {
    spaceSize += 2;
    string += `${makeSpace(spaceSize, '')}+ ${name}: `;
    const children = head[2];
    string += `{\n`;
    spaceSize += 4;
    return stylish(children);
  } else if(type === 'deleted' && head[2] instanceof Array) {
    string += `${makeSpace(spaceSize, '')}- ${name}: `;
    const children = head[2];
    string += `{\n`;
    spaceSize += 4;
    return stylish(children);
  } else if(type === 'added') {
    if(tail.length !== 0)  {
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
    } else {
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 4;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    }
    return stylish(tail);
  } else if (type === 'unchanged') {
    string += `${makeSpace(spaceSize, '')}  ${name}: ${head[2]}\n`;
    stylish(tail);
  } else if (type === 'deleted') {
    string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
    stylish(tail);
  } else if (type === 'changed') {
    if(tail.length !== 0)  {
      string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[3]}\n`;
    } else {
      if(head[2] instanceof Array) {
        string += `${makeSpace(spaceSize, '')}- ${name}: {\n`;
        spaceSize += 4;
        const [subName, , value] = head[2];
        string += `${makeSpace(spaceSize, '')}  ${subName}: ${value}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      } else {
        string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
      }
      string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[3]}\n`;
      spaceSize -= 2;
      string += `${makeSpace(spaceSize, '')}}\n`;
      spaceSize -= 2;
    }
    stylish(tail);
  }
};

export default compareFiles;
