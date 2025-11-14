import { Point } from './types';
import { bbox } from './utils';

export function detectMicroFeatures(points: Point[], box: ReturnType<typeof bbox>) {
  const gridX = 6, gridY = 6;
  const cellW = box.width / gridX, cellH = box.height / gridY;
  const grid: number[][] = Array.from({ length: gridY }, () => Array(gridX).fill(0));
  for (const p of points) {
    const gx = Math.min(gridX - 1, Math.max(0, Math.floor((p.x - box.minX) / cellW)));
    const gy = Math.min(gridY - 1, Math.max(0, Math.floor((p.y - box.minY) / cellH)));
    grid[gy][gx]++;
  }
  let denseCells = 0, isolatedCells = 0;
  for (let y = 0; y < gridY; y++) for (let x = 0; x < gridX; x++) {
    if (grid[y][x] >= 6) denseCells++;
    if (grid[y][x] > 0 && grid[y][x] <= 2) isolatedCells++;
  }
  const islands = Math.round(isolatedCells / 2);
  const stars = denseCells >= 2 ? Math.min(4, denseCells) : 0;
  const crosses = Math.round(denseCells / 3);
  const branches = Math.round(denseCells / 2);
  return { islands, stars, crosses, branches, denseCells, isolatedCells };
}
