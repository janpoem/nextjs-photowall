export const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && !isNaN(v) && isFinite(v);

export const isNumberVal = (v: unknown) => {
  if (Array.isArray(v)) return false;
  return !isNaN(parseFloat(v as string)) && isFinite(v as number);
};

export const toNumber = (v: unknown, dft = 0): number => {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v == null || !isNumberVal(v)) return dft;
  if (typeof v === 'number') return v;
  return parseFloat(v as string);
};

export const limitNumberMin = (value: unknown, min: number, dft = 0) => {
  const v = toNumber(value, dft);
  return v < min ? min : v;
};

export const limitNumberMax = (value: unknown, max: number, dft = 0) => {
  const v = toNumber(value, dft);
  return v > max ? max : v;
};

export const limitNumberMinMax = (
  value: unknown,
  min: number,
  max: number,
  dft = 0,
) => {
  const v = toNumber(value, dft);
  return v < min ? min : v > max ? max : v;
};

export const decimalAdjust = (
  type: 'round' | 'ceil' | 'floor',
  value: number,
  exp?: number,
): number => {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  // @ts-ignore value to string
  value = value.toString().split('e');
  // @ts-ignore here
  value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
  // Shift back
  // @ts-ignore value to string
  value = value.toString().split('e');
  // @ts-ignore here
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
};

// exp 表示精确位数，
// < 0 时，表示浮点精度
// > 0 时，表示个十百千位（即往上取舍）
export const round10 = (value: number, exp?: number): number =>
  decimalAdjust('round', value, exp);
export const floor10 = (value: number, exp?: number): number =>
  decimalAdjust('floor', value, exp);
export const ceil10 = (value: number, exp?: number): number =>
  decimalAdjust('ceil', value, exp);
