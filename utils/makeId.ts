export function makeId(...args: (string | undefined)[]) {
  return args.filter(Boolean).join(":");
}
