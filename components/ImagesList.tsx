import { fetchImages, ImageData, ImagesListData } from '@/api/images';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ImageInfo } from '@/components/ImageInfo';
import { ImageItem } from '@/components/ImageItem';
import { Loading } from '@/components/Loading';
import { useTheLoader } from '@/hooks/useTheLoader';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export type ImagesListProp = {
  page?: number | null;
  onLoad?: (data: ImagesListData) => void;
}

export function ImagesList({ page, onLoad }: ImagesListProp) {

  const [openImage, setOpenImage] = useState<ImageData | null>(null);

  const { data, loading, error } = useTheLoader({
    loader: fetchImages,
    params: [page],
    onLoad: (res) => onLoad?.(res),
  });

  return <>
    {openImage && createPortal(
      <div className={'AppPopup'} onClick={() => setOpenImage(null)}>
        <ImageInfo image={openImage}/>
      </div>,
      document.body)}
    <Loading loading={loading}>
      <ErrorDisplay
        error={error || (!loading && data == null ? 'No data yet' : null)}>
        <div className={'ImagesListWrapper'}>
          <div className={'ImagesList'}>
            {(data?.images ?? []).map((image, idx) => (
              <ImageItem key={`image:${data?.page}:${idx}`} image={image}
                         onClick={() => setOpenImage(image)}/>))}
          </div>
        </div>
      </ErrorDisplay>
    </Loading>
  </>;
}
