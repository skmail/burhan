export function getRealRotation(radians: number) {
  while (radians < -Math.PI) radians += 2 * Math.PI;
  while (radians >= Math.PI) radians -= 2 * Math.PI;
  return radians;

  return radians >= 0 ? radians : radians + 2 * Math.PI;
}
