import { test, expect } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import parseFiles from '../src/parsers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
test('compareNestedJsonFiles', () => {
  expect(parseFiles('file1nested.json', 'file2nested.json', 'stylish'))
    .toEqual(fs.readFileSync(getFixturePath('expected_nested_file.txt'), 'utf-8'));
});
test('compareNestedYamlFiles', () => {
  expect(parseFiles('file1nested.yaml', 'file2nested.yaml', 'stylish'))
    .toEqual(fs.readFileSync(getFixturePath('expected_nested_file.txt'), 'utf-8'));
});
test('compareNestedJsonFilesPlain', () => {
  expect(parseFiles('file1nested.json', 'file2nested.json', 'plain'))
    .toEqual(fs.readFileSync(getFixturePath('expected_plain_file.txt'), 'utf-8'));
});
test('compareNestedJsonFilesJsonOutput', () => {
  expect(parseFiles('file1nested.json', 'file2nested.json', 'json'))
    .toEqual(fs.readFileSync(getFixturePath('expected_json_file.json'), 'utf-8'));
});
