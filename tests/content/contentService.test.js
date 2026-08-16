import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ContentService } from '../../assets/js/services/contentService.js';

test('routes all provider reads through content middleware', async () => {
  const accesses = [];
  const provider = {
    name: 'test-provider',
    async getSiteContent() {
      return { pages: [] };
    },
    async getDoctors() {
      return [{ name: 'Dr. Test' }];
    }
  };
  const service = new ContentService({
    provider,
    middleware: [async (context, next) => {
      accesses.push(`${context.provider}:${context.resource}:before`);
      const value = await next();
      accesses.push(`${context.provider}:${context.resource}:after`);
      return value;
    }]
  });

  assert.deepEqual(await service.getSiteContent(), { pages: [] });
  assert.deepEqual(await service.getDoctors(), [{ name: 'Dr. Test' }]);
  assert.deepEqual(accesses, [
    'test-provider:siteContent:before',
    'test-provider:siteContent:after',
    'test-provider:doctors:before',
    'test-provider:doctors:after'
  ]);
});

test('rejects middleware that calls next more than once', async () => {
  const service = new ContentService({
    provider: {
      async getSiteContent() {
        return {};
      }
    },
    middleware: [async (context, next) => {
      await next();
      return next();
    }]
  });

  await assert.rejects(service.getSiteContent(), /next\(\) called more than once/);
});

test('keeps raw content provider imports behind ContentService', () => {
  const allowedFile = join('assets', 'js', 'services', 'contentService.js');
  const sourceFiles = ['assets/js', 'scripts', 'tests'].flatMap((root) => walk(root));
  const bypasses = sourceFiles.filter((file) => {
    if (file === allowedFile) return false;
    return /from ['"].*\/data\/(?:doctors|siteContent)\.js['"]/.test(readFileSync(file, 'utf8'));
  });

  assert.deepEqual(bypasses, []);
});

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return path.endsWith('.js') || path.endsWith('.mjs') ? [path] : [];
  });
}