export default function scaleY(value: number, baseline: number, scale: number) {
  return baseline - value * scale;
}
