import stylish from './stylish.js';
import plain from './plain.js';

const chooseFormatter = (formatName, structre) => {
  if (formatName === 'plain') {
    return plain(structre, '');
  }
  return stylish(structre);
};

export default chooseFormatter;
