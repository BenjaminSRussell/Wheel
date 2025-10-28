import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAllJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('__tests__')) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u;

describe('Anti-pattern detection', () => {
  const srcDir = join(__dirname, '..', 'src');
  const jsFiles = getAllJsFiles(srcDir);

  jsFiles.forEach((filePath) => {
    const fileName = filePath.replace(srcDir, 'src');
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    it(`${fileName}: should not contain emojis in code or comments`, () => {
      lines.forEach((line, index) => {
        if (EMOJI_REGEX.test(line)) {
          throw new Error(`Emoji found in ${fileName} at line ${index + 1}: ${line.trim()}`);
        }
      });
    });

    it(`${fileName}: should not contain "except Exception: pass" pattern`, () => {
      if (content.match(/catch\s*\(\s*Exception\s*\)\s*{?\s*pass\s*}?/)) {
        throw new Error(`Exception catching anti-pattern found in ${fileName}`);
      }
    });

    it(`${fileName}: should not contain broad except blocks`, () => {
      if (content.match(/catch\s*\(\s*\w*\s*\)\s*{?\s*}\s*$/m)) {
        throw new Error(`Empty catch block found in ${fileName}`);
      }
    });
  });

  it('should have testable utility functions', () => {
    expect(jsFiles.length).toBeGreaterThan(0);
  });
});

