import { errMsg } from '@/utils/error';
import { ReactNode, useMemo } from 'react';

export type ErrorDisplayProp = {
  error?: Error | string | null;
  children?: ReactNode;
}

export function ErrorDisplay({ error, children }: ErrorDisplayProp) {

  const err = useMemo(() => errMsg(error), [error]);

  if (err != null && err !== '') {
    return <div className={'ErrorDisplay'}>
      An error occurred:
      <p>{errMsg(error)}</p>
    </div>
  }

  return children;
}
