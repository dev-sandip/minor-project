/**
 * Returns a new object with the specified keys omitted.
 **/
export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const newObj = { ...obj };
  keys.forEach((key) => delete newObj[key]);
  return newObj as Omit<T, K>;
};

