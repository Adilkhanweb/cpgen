const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const { Script } = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 2, 'the page contains the editor and its bundled text engine');
for (const [, body] of scripts) new Script(body);
for (const [label, pattern] of Object.entries({
  'embedded demo client': /BKN Group|пример BKN|Желтоқсан|\bconst demoPhotos\b/i,
  'Kazakh IBAN': /\bKZ[0-9A-Z]{18}\b/i,
  '12-digit identifier': /\b\d{12}\b/,
  'private demo image': /data:image\/(?:png|webp|jpe?g);base64,[a-z0-9+/]{60}/i,
  'GitHub token': /\b(?:gh[pousr]_|github_pat_)[a-z0-9_]{15,}/i,
  'root-relative resource': /<(?:link|script|img)\b[^>]+(?:src|href)=["']\/(?!\/)/i,
})) assert.doesNotMatch(html, pattern, `${label} must not be included in the public HTML`);
assert.match(html, /SIL OPEN FONT LICENSE/i);
console.log('Public entry point parsed and passed publication checks.');
