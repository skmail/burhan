export function getMidpoint(
  p1: [number, number],
  p2: [number, number],
  per: number
): [number, number] {
  return [p1[0] + (p2[0] - p1[0]) * per, p1[1] + (p2[1] - p1[1]) * per];
}
