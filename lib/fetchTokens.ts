import path from 'path';
import { promises as fs } from 'fs';

export async function fetchTokens() {
  const filePath = path.join(process.cwd(), 'data', 'tokens.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  return JSON.parse(jsonData);
}
