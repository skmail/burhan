export function flatMap<T>(array: T[][]): T[] {
  const result = [];
  for (let item of array) {
    result.push(...item);
  }

  return result;
}
