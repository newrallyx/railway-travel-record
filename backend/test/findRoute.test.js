import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRoute } from '../src/lib/railway/findRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const stations = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json'), 'utf8'));
const segments = JSON.parse(fs.readFileSync(path.join(dataDir, 'segments.json'), 'utf8'));

test('仅高铁：北京南到上海虹桥可达', () => {
  const result = findRoute({
    stations,
    segments,
    fromStationId: 'beijingnan',
    toStationId: 'shanghaihongqiao',
    mode: 'hsr_only'
  });

  assert.equal(result.ok, true);
  assert.equal(result.stationPath[0].id, 'beijingnan');
  assert.equal(result.stationPath.at(-1).id, 'shanghaihongqiao');
  assert.ok(result.segments.every((segment) => segment.railType === 'hsr'));
});

test('仅普速：北京到上海可达', () => {
  const result = findRoute({
    stations,
    segments,
    fromStationId: 'beijing',
    toStationId: 'shanghai',
    mode: 'conventional_only'
  });

  assert.equal(result.ok, true);
  assert.ok(result.segments.every((segment) => segment.railType === 'conventional'));
});

test('途经点拼接：北京南经南京南到上海虹桥', () => {
  const result = findRoute({
    stations,
    segments,
    fromStationId: 'beijingnan',
    viaStationIds: ['nanjingnan'],
    toStationId: 'shanghaihongqiao',
    mode: 'hsr_only'
  });

  assert.equal(result.ok, true);
  assert.ok(result.stationPath.some((station) => station.id === 'nanjingnan'));
});

test('网络不连通时返回不可达', () => {
  const result = findRoute({
    stations,
    segments,
    fromStationId: 'beijingnan',
    toStationId: 'shanghai',
    mode: 'hsr_only'
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /未找到可达路径/);
});
