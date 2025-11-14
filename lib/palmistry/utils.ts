import { Point } from './types';

export function clamp(v: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

export function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function mean(nums: number[]) {
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function variance(nums: number[]) {
  if (nums.length === 0) return 0;
  const m = mean(nums);
  return mean(nums.map(n => (n - m) ** 2));
}

export function bbox(points: Point[]) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  return { minX, maxX, minY, maxY, width, height, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
}
