import { isInferObj } from './infer';

export type QueryInput =
  | undefined
  | null
  | string
  | string[][]
  | Record<string, unknown>
  | URLSearchParams;

export const qo = (query: QueryInput) =>
  !query
    ? undefined
    : query instanceof URLSearchParams
      ? query
      : new URLSearchParams(isInferObj(query) ? filterQuery(query) : query);

export type QueryStringJoiner = '?' | '&' | string;

export const qs = (query: QueryInput, joiner: QueryStringJoiner = '?') => {
  const params = qo(query);
  let res = params ? params + '' : '';
  if (res.length) {
    if (joiner) {
      res = joiner + res;
    }
  }
  return res;
};

const filterQuery = (
  query: Record<string, unknown>,
): Record<string, string> => {
  return Object.keys(query)
    .filter(key => query[key] != null)
    .reduce(
      (map, key) => {
        map[key] = filterValue(query[key]);
        return map;
      },
      {} as Record<string, string>,
    );
};

const filterValue = (value: unknown): string => {
  if (isInferObj(value)) {
    return JSON.stringify(value);
  }
  return value + '';
};
