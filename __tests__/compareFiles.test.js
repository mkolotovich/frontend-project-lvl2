import { test, expect } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import compareFiles from '../compareFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

test('compareFiles', () => {
  expect(compareFiles(fs.readFileSync(getFixturePath('file1.json'), 'utf-8'), fs.readFileSync(getFixturePath('file2.json'), 'utf-8')))
    .toEqual(fs.readFileSync(getFixturePath('expected_file.txt'), 'utf-8'));
});