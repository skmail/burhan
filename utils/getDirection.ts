export function getDirection(angle: number) {
  var directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  var index = Math.floor(((angle+22.5)%360)/45);
  return directions[index];
}


