import _ from 'lodash';

const compare = (a, b) => {
  const firstWord = [a[0].slice(0, 2), a[0].slice(2)];
  const secondWord = [b[0].slice(0, 2), b[0].slice(2)];
  if (firstWord[1] === secondWord[1]) {
    return 0;
  }
  return firstWord[1] > secondWord[1] ? 1 : -1;
};

const compareFiles = (file1, file2) => {
  const entries = Object.entries(file1).sort();
  const entries1 = Object.entries(file2).sort();
  const result = {};
  entries.map(([prop]) => entries1.map(([prop1, value1]) => {
    if (_.has(file1, prop1) && file1[prop1] === value1) {
      result[`  ${prop1}`] = value1;
    } else if (_.has(file1, prop1) && file1[prop1] !== value1) {
      result[`- ${prop1}`] = file1[prop1];
      result[`+ ${prop1}`] = value1;
    } else if (!_.has(file2, prop)) {
      result[`- ${prop}`] = file1[prop];
    } else {
      result[`+ ${prop1}`] = value1;
    }
    return result;
  }));
  const resultArray = Object.entries(result).sort(compare);
  const sortedObject = Object.fromEntries(resultArray);
  const resultString = JSON.stringify(sortedObject, null, '  ');
  const resultValue = resultString.replace(/"/g, '').replace(/,/g, '');
  return resultValue;
};

export default compareFiles;
