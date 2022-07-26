import { URI } from '../core/model/uri';
import { Logger } from '../core/utils/log';
import { Matcher, toMatcherPathFormat } from './test-datastore';
import { TEST_DATA_DIR } from './test-utils';

Logger.setLevel('error');

const testFolder = TEST_DATA_DIR.joinPath('test-datastore');

describe('Matcher', () => {
  it('generates globs with the base dir provided', () => {
    const matcher = new Matcher([testFolder], ['*'], []);
    expect(matcher.folders).toEqual([toMatcherPathFormat(testFolder)]);
    expect(matcher.include).toEqual([
      toMatcherPathFormat(testFolder.joinPath('*')),
    ]);
  });

  it('defaults to including everything and excluding nothing', () => {
    const matcher = new Matcher([testFolder]);
    expect(matcher.exclude).toEqual([]);
    expect(matcher.include).toEqual([
      toMatcherPathFormat(testFolder.joinPath('**', '*')),
    ]);
  });

  it('supports multiple includes', () => {
    const matcher = new Matcher([testFolder], ['g1', 'g2'], []);
    expect(matcher.exclude).toEqual([]);
    expect(matcher.include).toEqual([
      toMatcherPathFormat(testFolder.joinPath('g1')),
      toMatcherPathFormat(testFolder.joinPath('g2')),
    ]);
  });

  it('has a match method to filter strings', () => {
    const matcher = new Matcher([testFolder], ['*.md'], []);
    const files = [
      testFolder.joinPath('file1.md'),
      testFolder.joinPath('file2.md'),
      testFolder.joinPath('file3.mdx'),
      testFolder.joinPath('sub', 'file4.md'),
    ];
    expect(matcher.match(files)).toEqual([
      testFolder.joinPath('file1.md'),
      testFolder.joinPath('file2.md'),
    ]);
  });

  it('has a isMatch method to see whether a file is matched or not', () => {
    const matcher = new Matcher([testFolder], ['*.md'], []);
    const files = [
      testFolder.joinPath('file1.md'),
      testFolder.joinPath('file2.md'),
      testFolder.joinPath('file3.mdx'),
      testFolder.joinPath('sub', 'file4.md'),
    ];
    expect(matcher.isMatch(files[0])).toEqual(true);
    expect(matcher.isMatch(files[1])).toEqual(true);
    expect(matcher.isMatch(files[2])).toEqual(false);
    expect(matcher.isMatch(files[3])).toEqual(false);
  });

  it('happy path', () => {
    const matcher = new Matcher([URI.file('/root/')], ['**/*'], ['**/*.pdf']);
    expect(matcher.isMatch(URI.file('/root/file.md'))).toBeTruthy();
    expect(matcher.isMatch(URI.file('/root/file.pdf'))).toBeFalsy();
    expect(matcher.isMatch(URI.file('/root/dir/file.md'))).toBeTruthy();
    expect(matcher.isMatch(URI.file('/root/dir/file.pdf'))).toBeFalsy();
  });

  it('ignores files in the exclude list', () => {
    const matcher = new Matcher([testFolder], ['*.md'], ['file1.*']);
    const files = [
      testFolder.joinPath('file1.md'),
      testFolder.joinPath('file2.md'),
      testFolder.joinPath('file3.mdx'),
      testFolder.joinPath('sub', 'file4.md'),
    ];
    expect(matcher.isMatch(files[0])).toEqual(false);
    expect(matcher.isMatch(files[1])).toEqual(true);
    expect(matcher.isMatch(files[2])).toEqual(false);
    expect(matcher.isMatch(files[3])).toEqual(false);
  });
});
