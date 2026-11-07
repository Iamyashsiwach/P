// Run: node --test app/blogs/lib
// Node 20 can't run .ts directly and the repo has no TS runner, so transpile
// blog-data.ts with the TypeScript compiler that's already installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('./blog-data.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getBlogPosts, getBlogPost, formatPostDate } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);

test('posts are newest first', () => {
  const dates = getBlogPosts().map(post => post.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test('every post is well-formed and slugs are unique', () => {
  const posts = getBlogPosts();
  const slugs = posts.map(post => post.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const post of posts) {
    assert.match(post.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${post.slug}`);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/, `bad date: ${post.date}`);
    assert.ok(post.title && post.excerpt && post.content.trim(), `empty field in ${post.slug}`);
  }
});

test('local assets linked from posts exist under public/', () => {
  const publicDir = new URL('../../../public', import.meta.url).pathname;
  for (const post of getBlogPosts()) {
    const links = [...post.content.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1]);
    if (post.video) links.push(post.video.src, post.video.poster, post.video.captions);
    for (const link of links) {
      // next.config.js redirects /blogs/* to /* on the blog host, which would 404 the asset.
      assert.ok(!link.startsWith('/blogs/'), `${post.slug}: ${link} is under the /blogs prefix`);
      assert.ok(existsSync(publicDir + link), `${post.slug}: missing public${link}`);
    }
  }
});

test('getBlogPost finds by slug and returns undefined otherwise', () => {
  const [first] = getBlogPosts();
  assert.equal(getBlogPost(first.slug), first);
  assert.equal(getBlogPost('nope'), undefined);
});

test('formatPostDate is timezone-stable', () => {
  assert.equal(formatPostDate('2026-11-07'), '7 Nov 2026');
  assert.equal(formatPostDate('2026-01-01'), '1 Jan 2026');
});
