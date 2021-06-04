import * as fs from 'fs';
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
  const firstFile = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const secondFile = JSON.parse(fs.readFileSync(file2, 'utf8'));
  const entries = Object.entries(firstFile).sort();
  const entries1 = Object.entries(secondFile).sort();
  const cb = (acc) => {
    entries.map(([prop]) => entries1.map(([prop1, value1]) => {
      if (_.has(firstFile, prop1) && firstFile[prop1] === value1) {
        acc[`  ${prop1}`] = value1;
      } else if (_.has(firstFile, prop1) && firstFile[prop1] !== value1) {
        acc[`- ${prop1}`] = firstFile[prop1];
        acc[`+ ${prop1}`] = value1;
      } else if (!_.has(secondFile, prop)) {
        acc[`- ${prop}`] = firstFile[prop];
      } else {
        acc[`+ ${prop1}`] = value1;
      }
      return acc;
    }));
    return acc;
  };
  const res = entries.reduce(cb, {});
  const resultArray = Object.entries(res).sort(compare);
  const sortedObject = Object.fromEntries(resultArray);
  const resultString = JSON.stringify(sortedObject, null, '  ');
  const resultValue = resultString.replace(/"/g, '').replace(/,/g, '');
  return resultValue;
};

export default compareFiles;
