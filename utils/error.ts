import { isInferObj, notEmptyStr } from './infer';

type ErrorLike = {
  message?: string;
  error?: string;
};

export const isErrLike = (err: unknown): err is ErrorLike =>
  isInferObj<ErrorLike>(
    err,
    it => notEmptyStr(it.error) || notEmptyStr(it.message),
  );

export const errMsg = (err: unknown) => {
  if (err == null) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (isErrLike(err)) return err.error || err.message;
  return '';
};
