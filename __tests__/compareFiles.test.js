import { test, expect, describe } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import compareFiles from '../src/compareFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
describe.each([
  ['file1nested.json', 'file2nested.json', 'stylish', 'expected_nested_file.txt'],
  ['file1nested.yaml', 'file2nested.yaml', 'stylish', 'expected_nested_file.txt'],
  ['file1nested.json', 'file2nested.json', 'plain', 'expected_plain_file.txt'],
  ['file1nested.json', 'file2nested.json', 'json', 'expected_json_file.json'],
])('.compareFiles(%s, %s, %s)', (a, b, c, expected) => {
  test(`returns ${expected}`, () => {
    expect(compareFiles(a, b, c)).toBe(fs.readFileSync(getFixturePath(expected), 'utf-8'));
  });
});
