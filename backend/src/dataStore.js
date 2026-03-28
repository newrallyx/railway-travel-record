import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

const readJson = async (fileName) => {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
};

const writeJson = async (fileName, value) => {
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
};

export const loadBaseData = async () => {
  const [stations, lines, segments, trips] = await Promise.all([
    readJson('stations.json'),
    readJson('lines.json'),
    readJson('segments.json'),
    readJson('trips.json')
  ]);

  return { stations, lines, segments, trips };
};

export const saveTrips = async (trips) => {
  await writeJson('trips.json', trips);
};
