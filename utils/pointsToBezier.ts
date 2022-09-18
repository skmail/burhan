import { Point, Tuple } from "@free-transform/core";
import { Command, PointTuple } from "../types";

// @url https://gist.github.com/adammiller/826148/70b8d4fc86147a8d836a603836e6d80c12c8a653
export function pointsToBezier(points: PointTuple[], tolerance = 5): Command[] {
  const simp = simplifyPath(points, tolerance);

  const result: Command[] = [];

  result.push({
    id: String(Math.random()),
    command: "moveTo",
    args: simp[0],
  });
  simp.shift();

  let c = 1;

  for (let i = 0; i < simp.length; i++) {
    if (c % 3 === 0) {
      result.push({
        id: String(Math.random()),
        command: "bezierCurveTo",
        args: simp[i],
      });
    } else if (c % 2 === 0) {
      result.push({
        id: String(Math.random()),
        command: "bezierCurveToCP2",
        args: simp[i],
      });
    } else {
      result.push({
        id: String(Math.random()),
        command: "bezierCurveToCP1",
        args: simp[i],
      });
    }
    c++;
    if (c > 3) {
      c = 1;
    }
  }
  return result;
}

class Line {
  private p1: PointTuple;
  private p2: PointTuple;

  constructor(p1: PointTuple, p2: PointTuple) {
    this.p1 = p1;
    this.p2 = p2;
  }

  distanceToPoint(point: PointTuple) {
    // slope
    const m = (this.p2[1] - this.p1[1]) / (this.p2[0] - this.p1[0]);
    // y offset
    const b = this.p1[1] - m * this.p1[0];
    const d = [];
    // distance to the linear equation
    if (m != Infinity)
      d.push(
        Math.abs(point[1] - m * point[0] - b) / Math.sqrt(Math.pow(m, 2) + 1)
      );
    // distance to p1
    d.push(
      Math.sqrt(
        Math.pow(point[0] - this.p1[0], 2) + Math.pow(point[1] - this.p1[1], 2)
      )
    );
    // distance to p2
    d.push(
      Math.sqrt(
        Math.pow(point[0] - this.p2[0], 2) + Math.pow(point[1] - this.p2[1], 2)
      )
    );
    // return the smallest distance
    return d.sort(function (a, b) {
      return a - b; //causes an array to be sorted numerically and ascending
    })[0];
  }
}

const simplifyPath = function (points: PointTuple[], tolerance: number) {
  const douglasPeucker = function (points: PointTuple[], tolerance: number) {
    if (points.length <= 2) {
      return [points[0]];
    }
    var returnPoints: PointTuple[] = [],
      // make line from start to end
      line = new Line(points[0], points[points.length - 1]),
      // find the largest distance from intermediate poitns to this line
      maxDistance = 0,
      maxDistanceIndex = 0,
      p;
    for (var i = 1; i <= points.length - 2; i++) {
      var distance = line.distanceToPoint(points[i]);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxDistanceIndex = i;
      }
    }
    // check if the max distance is greater than our tollerance allows
    if (maxDistance >= tolerance) {
      p = points[maxDistanceIndex];
      line.distanceToPoint(p);
      // include this point in the output
      returnPoints = returnPoints.concat(
        douglasPeucker(points.slice(0, maxDistanceIndex + 1), tolerance)
      );
      // returnPoints.push( points[maxDistanceIndex] );
      returnPoints = returnPoints.concat(
        douglasPeucker(points.slice(maxDistanceIndex, points.length), tolerance)
      );
    } else {
      // ditching this point
      p = points[maxDistanceIndex];
      line.distanceToPoint(p);
      returnPoints = [points[0]];
    }
    return returnPoints;
  };
  var arr = douglasPeucker(points, tolerance);
  // always have to push the very last point on so it doesn't get left off
  arr.push(points[points.length - 1]);
  return arr;
};
