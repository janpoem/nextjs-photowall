export type ObjLike = Record<string, unknown>;

export const isInferObj = <T extends ObjLike = ObjLike>(
  obj: unknown,
  fn?: (it: T) => boolean,
): obj is T => {
  if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
    if (typeof fn === 'function') {
      return fn(obj as T);
    }
    return true;
  }
  return false;
};

export interface ClassConstructor<T> {
  new (...args: any[]): T;
}

export const isCls = <T = any>(ctor: unknown): ctor is ClassConstructor<T> =>
  ctor != null &&
  typeof ctor === 'function' &&
  /^\s*class/.test(ctor.toString());

// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
export const isStr = (val: unknown): val is string =>
  typeof val === 'string' || val instanceof String;

export const notEmptyStr = (val: unknown): val is string =>
  isStr(val) && val.length > 0;

const trueValues = ['T', 'TRUE'];

export const toBool = (val: unknown): boolean => {
  if (val == null) return false;
  switch (typeof val) {
    case 'number':
      return val > 0;
    case 'string':
      return trueValues.includes(val.toUpperCase());
    case 'boolean':
      return val;
    default:
      return true;
  }
};
