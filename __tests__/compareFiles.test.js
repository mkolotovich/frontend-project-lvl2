import { test, expect } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import parseFiles from '../parsers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

test('compareJsonFiles', () => {
  expect(parseFiles('file1.json', 'file2.json'))
    .toEqual(fs.readFileSync(getFixturePath('expected_file.txt'), 'utf-8'));
});

test('compareYmlFiles', () => {
  expect(parseFiles('file1.yml', 'file2.yml'))
    .toEqual(fs.readFileSync(getFixturePath('expected_file.txt'), 'utf-8'));
});

test('compareYamlFiles', () => {
  expect(parseFiles('file1.yaml', 'file2.yaml'))
    .toEqual(fs.readFileSync(getFixturePath('expected_file.txt'), 'utf-8'));
});
