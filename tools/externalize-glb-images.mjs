#!/usr/bin/env node
// Blender's exporter, with export_keep_originals enabled, writes each image
// BOTH as a uri pointing at the original file AND as a tiny placeholder
// bufferView. glTF says an image has one or the other, and three.js prefers the
// bufferView — so every texture loaded as a 645-byte 1x1 blob and the world
// rendered untextured.
//
// This strips the placeholder bufferView from any image that carries a uri, so
// the shared texture files are the ones that actually load.
import fs from 'node:fs';
import path from 'node:path';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function readChunks(buffer) {
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
  const total = buffer.readUInt32LE(8);
  const chunks = [];
  let offset = 12;
  while (offset < total) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    chunks.push({ type, data: buffer.subarray(offset + 8, offset + 8 + length) });
    offset += 8 + length;
  }
  return chunks;
}

function writeGLB(chunks) {
  const parts = [];
  let total = 12;
  for (const chunk of chunks) {
    const pad = (4 - (chunk.data.length % 4)) % 4;
    const padding = Buffer.alloc(pad, chunk.type === JSON_CHUNK ? 0x20 : 0x00);
    const header = Buffer.alloc(8);
    header.writeUInt32LE(chunk.data.length + pad, 0);
    header.writeUInt32LE(chunk.type, 4);
    parts.push(header, chunk.data, padding);
    total += 8 + chunk.data.length + pad;
  }
  const head = Buffer.alloc(12);
  head.writeUInt32LE(0x46546c67, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(total, 8);
  return Buffer.concat([head, ...parts]);
}

const directory = process.argv[2] || 'public/assets/blender';
let changed = 0;

for (const name of fs.readdirSync(directory).filter(f => f.endsWith('.glb'))) {
  const file = path.join(directory, name);
  const chunks = readChunks(fs.readFileSync(file));
  const jsonChunk = chunks.find(c => c.type === JSON_CHUNK);
  const gltf = JSON.parse(jsonChunk.data.toString('utf8'));

  const conflicted = (gltf.images || []).filter(i => i.uri && i.bufferView !== undefined);
  if (!conflicted.length) continue;

  for (const image of conflicted) delete image.bufferView;
  jsonChunk.data = Buffer.from(JSON.stringify(gltf), 'utf8');
  fs.writeFileSync(file, writeGLB(chunks));
  changed++;
  console.log(`${name}: detached ${conflicted.length} placeholder image${conflicted.length > 1 ? 's' : ''}`);
}

console.log(changed ? `Fixed ${changed} file(s).` : 'No conflicted images found.');
