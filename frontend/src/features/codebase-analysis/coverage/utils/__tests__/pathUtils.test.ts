import { describe, it, expect } from '@jest/globals';
import { getFileName, getRelativePath } from '../pathUtils';

describe('pathUtils', () => {
  describe('getFileName', () => {
    it('should extract filename from Unix-style path', () => {
      expect(getFileName('src/app/App.tsx')).toBe('App.tsx');
      expect(getFileName('features/dashboard/Dashboard.tsx')).toBe('Dashboard.tsx');
    });

    it('should extract filename from Windows-style path', () => {
      expect(getFileName('src\\app\\App.tsx')).toBe('App.tsx');
      expect(getFileName('C:\\Users\\test\\project\\file.ts')).toBe('file.ts');
    });

    it('should handle filename without path', () => {
      expect(getFileName('standalone.ts')).toBe('standalone.ts');
    });

    it('should handle empty string', () => {
      expect(getFileName('')).toBe('');
    });
  });

  describe('getRelativePath', () => {
    it('should strip workspace root from absolute path', () => {
      const absolutePath = 'C:\\Users\\test\\Zach.ai\\frontend\\src\\app\\App.tsx';
      expect(getRelativePath(absolutePath)).toBe('src/app/App.tsx');
    });

    it('should handle frontend paths', () => {
      expect(getRelativePath('Zach.ai/frontend/src/features/test.ts')).toBe(
        'src/features/test.ts'
      );
    });

    it('should handle backend paths', () => {
      // getRelativePath strips 'Zach.ai\backend\' leaving 'src\server.ts', then normalizes to 'src/server.ts'
      expect(getRelativePath('Zach.ai\\backend\\src\\server.ts')).toBe('src/server.ts');
    });

    it('should normalize backslashes to forward slashes', () => {
      expect(getRelativePath('src\\app\\test.ts')).toBe('src/app/test.ts');
    });

    it('should extract from last src occurrence if no markers found', () => {
      const path = 'C:\\random\\path\\src\\features\\test.ts';
      expect(getRelativePath(path)).toBe('src/features/test.ts');
    });

    it('should return original path if no markers found', () => {
      const path = 'unknown/path/file.ts';
      expect(getRelativePath(path)).toBe('unknown/path/file.ts');
    });
  });
});
