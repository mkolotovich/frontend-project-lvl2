import _ from 'lodash';

let string = '{\n';
let spaceSize = 2;

const makeSpace = (size, space) => {
  let spaceType = space;
  if (size > 0) {
    spaceType += ' ';
    return makeSpace(size - 1, spaceType);
  }
  return space;
};

const makeLine = (name, symbol) => {
  string += `${makeSpace(spaceSize, '')}${symbol} ${name}: `;
  string += '{\n';
  spaceSize += 4;
};

const res = (stylish, children, tail) => stylish(children) + stylish(tail);

const stylish = (tree) => {
  const cb = () => {
    if (!Array.isArray(tree)) {
      if (Object.entries(tree).length === 1) {
        const [name, value] = Object.entries(tree)[0];
        string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      } else {
        const [name, value] = Object.entries(tree)[0];
        if (!_.isObject(value)) {
          string += `${makeSpace(spaceSize, '')}  ${name}: ${value}\n`;
          const [name1, value1] = Object.entries(tree)[1];
          string += `${makeSpace(spaceSize, '')}  ${name1}: {\n`;
          spaceSize += 4;
          const [subName, subValue] = Object.entries(value1)[0];
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
      return string;
    }
    if (tree.length === 0) {
      return string;
    }
    const [head, ...tail] = tree;
    const [name, type] = head;
    const children = head[2];
    if (type === 'unchanged' && head[2] instanceof Array) {
      makeLine(name, ' ');
      return stylish(children) + stylish(tail);
    } if (type === 'added' && head[2] instanceof Object) {
      makeLine(name, '+');
      res(stylish, children, tail);
    } else if (type === 'deleted' && head[2] instanceof Object) {
      makeLine(name, '-');
      res(stylish, children, tail);
    } else if (type === 'added' && head[2] instanceof Array) {
      spaceSize += 2;
      makeLine(name, '+');
      res(stylish, children, tail);
    } else if (type === 'deleted' && head[2] instanceof Array) {
      makeLine(name, '-');
      res(stylish, children, tail);
    } else if (type === 'added') {
      if (tail.length !== 0) {
        string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
      } else {
        string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[2]}\n`;
        spaceSize -= 2;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 4;
        string += `${makeSpace(spaceSize, '')}}\n`;
        spaceSize -= 2;
      }
      stylish(tail);
    } else if (type === 'unchanged') {
      string += `${makeSpace(spaceSize, '')}  ${name}: ${head[2]}\n`;
      stylish(tail);
    } else if (type === 'deleted') {
      string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
      stylish(tail);
    } else if (type === 'changed') {
      if (tail.length !== 0) {
        string += `${makeSpace(spaceSize, '')}- ${name}: ${head[2]}\n`;
        string += `${makeSpace(spaceSize, '')}+ ${name}: ${head[3]}\n`;
      } else {
        if (head[2] instanceof Array) {
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
    return string;
  };
  cb();
  return string;
};
export default stylish;
