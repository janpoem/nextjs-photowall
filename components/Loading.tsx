import { ReactNode } from 'react';

export type LoadingProps = {
  loading?: boolean;
  text?: ReactNode;
  children?: ReactNode;
}

export function Loading({
                          loading = true,
                          text = 'Loading...',
                          children,
                        }: LoadingProps) {
  if (loading) {
    return <div className="Loading">
      <div className={'LoadingText'}>{text}</div>
      <div className={'LoadingProcessA'} />
    </div>;
  }

  return children;
}
