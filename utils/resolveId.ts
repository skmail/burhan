export function resolveId(id: string): [string, string] {
  const result = id.split(":");
  return [result[0], result[1]];
}
