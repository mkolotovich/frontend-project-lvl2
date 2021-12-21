import yaml from 'js-yaml';

export default (data, format) => {
  const parse = format === '.json' ? JSON.parse : yaml.load;
  return parse(data);
};
