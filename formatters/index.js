import { stylish } from './stylish.js';
import plain from './plain.js';
import json from './json.js';

const chooseFormatter = (formatName, structre) => {
  if (formatName === 'plain') {
    return plain(structre, '');
  } if (formatName === 'json') {
    return json(structre);
  }
  return stylish(structre, '');
};

export default chooseFormatter;
