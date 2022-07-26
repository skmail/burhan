import { PointTuple } from "../types";

const computeAngle = (p1: PointTuple, p2: PointTuple) => {
  var dy = p2[1] - p1[1];
  var dx = p2[0] - p1[0];
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  // theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
};

export default computeAngle;
