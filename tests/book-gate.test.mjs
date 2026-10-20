// Run: node --test tests/
// No TS runner in this repo, so transpile the module under test with the
// already-installed `typescript` and import it from a data: URL.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../app/book/lib/gate.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { matchesGateAnswer } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('accepts the answer regardless of case and surrounding whitespace', () => {
  assert.equal(matchesGateAnswer('Fido', 'fido'), true);
  assert.equal(matchesGateAnswer('  FIDO  ', 'fido'), true);
});

test('accepts any entry of a comma-separated list', () => {
  assert.equal(matchesGateAnswer('phido', 'fido, phido'), true);
  assert.equal(matchesGateAnswer('fido', 'fido, phido'), true);
});

test('rejects wrong, empty and oversized answers', () => {
  assert.equal(matchesGateAnswer('rover', 'fido'), false);
  assert.equal(matchesGateAnswer('', 'fido'), false);
  assert.equal(matchesGateAnswer('   ', 'fido'), false);
  assert.equal(matchesGateAnswer('fido'.padEnd(65, ' x'), 'fido'), false);
});

test('fails closed when no answer is configured', () => {
  assert.equal(matchesGateAnswer('fido', undefined), false);
  assert.equal(matchesGateAnswer('fido', ''), false);
  assert.equal(matchesGateAnswer('', ' , '), false);
});
