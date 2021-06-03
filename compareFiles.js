import * as fs from 'fs';
// import _ from 'lodash';

const compareFiles = (file1, file2) => {
  const firstFile = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const secondFile = JSON.parse(fs.readFileSync(file2, 'utf8'));
  const result = {};
  const entries = Object.entries(firstFile).sort();
  const entries1 = Object.entries(secondFile).sort();
  for (const [prop, ] of entries) {
    for (const [prop1, value1] of entries1) {
      if (firstFile.hasOwnProperty(prop1) && firstFile[prop1] === value1) {
        result[`  ${prop1}`] = value1;
      } else {
        if (firstFile.hasOwnProperty(prop1) && firstFile[prop1] !== value1) {
          result[`- ${prop1}`] = firstFile[prop1];
          result[`+ ${prop1}`] = value1;
        } 
        else if (!secondFile.hasOwnProperty(prop)) {
          result[`- ${prop}`] = firstFile[prop];
        }
        else {
          result[`+ ${prop1}`] = value1;
        }
      } 
    }
  }
  const resultArray = Object.entries(result).sort(compare);
  const sortedObject = Object.fromEntries(resultArray);
  const resultString = JSON.stringify(sortedObject, null, '  ');
  const resultValue = resultString.replace(/"/g,'').replace(/,/g,'');
  return resultValue;
};

export default compareFiles;

const compare = (a, b) => {
  const firstWord = [a[0].slice(0, 2),a[0].slice(2)];
  const secondWord = [b[0].slice(0, 2),b[0].slice(2)];
  if (firstWord[1] === secondWord[1]) {
    return 0;
  }
  return firstWord[1] > secondWord[1] ? 1 : -1;
};
