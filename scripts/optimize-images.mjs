/**
 * Resizes and recompresses everything in /public in place.
 * Filenames and formats are preserved so no markup has to change — next/image
 * still derives AVIF/WebP at request time, it just starts from a sane source.
 *
 *   node scripts/optimize-images.mjs [--dry]
 */
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MAX_EDGE = 1600;
const DRY = process.argv.includes('--dry');

const kb = bytes => `${(bytes / 1024).toFixed(0)}KB`;

async function optimize(file) {
  const abs = path.join(PUBLIC_DIR, file);
  const ext = path.extname(file).toLowerCase();
  const before = (await stat(abs)).size;

  const pipeline = sharp(abs).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (ext === '.png') {
    pipeline.png({ quality: 80, compressionLevel: 9, palette: true });
  } else {
    pipeline.jpeg({ quality: 80, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();

  if (buf.length >= before) {
    console.log(`  skip  ${file.padEnd(24)} ${kb(before)} (already optimal)`);
    return { before, after: before };
  }

  if (!DRY) {
    // Write via a temp file so a crash can't truncate the original.
    const tmp = `${abs}.tmp`;
    await sharp(buf).toFile(tmp);
    await rename(tmp, abs);
  }

  const pct = (((before - buf.length) / before) * 100).toFixed(0);
  console.log(`  ok    ${file.padEnd(24)} ${kb(before)} -> ${kb(buf.length)}  (-${pct}%)`);
  return { before, after: buf.length };
}

const entries = await readdir(PUBLIC_DIR);
const images = entries.filter(f => /\.(png|jpe?g)$/i.test(f));

console.log(`${DRY ? '[dry run] ' : ''}optimizing ${images.length} images in /public\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of images) {
  try {
    const { before, after } = await optimize(file);
    totalBefore += before;
    totalAfter += after;
  } catch (err) {
    console.error(`  FAIL  ${file}: ${err.message}`);
    await unlink(path.join(PUBLIC_DIR, `${file}.tmp`)).catch(() => {});
    process.exitCode = 1;
  }
}

console.log(
  `\ntotal ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
    `(-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`
);
