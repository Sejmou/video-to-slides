/**
 * mimics Python's zip() function: https://stackoverflow.com/a/10284006/13727176
 * For TypeScript, things are more complicated, solution copied from: https://stackoverflow.com/a/70192772/13727176
 * @param args
 * @returns
 */
export function zip<T extends unknown[][]>(
  ...args: T
): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] {
  const minLength = Math.min(...args.map(arr => arr.length));
  // @ts-expect-error This is too much for ts
  return range(minLength).map(i => args.map(arr => arr[i]));
}

export function range(n: number) {
  return Array.from(Array(n).keys());
}
