import { fetchImage } from '@/api/images';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Loading } from '@/components/Loading';
import { useTheLoader } from '@/hooks/useTheLoader';

export type ImageDisplayProps = {
  url: string;
}

export function ImageDisplay({ url }: ImageDisplayProps) {

  const { loading, error } = useTheLoader({
    loader: fetchImage,
    params: [url],
  });

  return <Loading loading={loading} text={'Image loading...'}>
    <ErrorDisplay error={error}>
      <div className={'ImageDisplay'} style={{ backgroundImage: `url(${url})` }}>
      </div>
    </ErrorDisplay>
  </Loading>;
}
