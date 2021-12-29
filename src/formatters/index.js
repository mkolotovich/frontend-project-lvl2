import stylish from './stylish.js';
import plain from './plain.js';
import json from './json.js';

const formatData = (formatName, structure) => {
  if (formatName === 'plain') {
    return plain(structure);
  } if (formatName === 'json') {
    return json(structure);
  } if (formatName === 'stylish') {
    return stylish(structure);
  }
  return new Error(`incorrect format: ${formatName}!`);
};

export default formatData;
