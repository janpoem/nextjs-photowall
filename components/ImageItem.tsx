import { ImageData } from './api/images';
import { ImageDisplay } from '@/components/ImageDisplay';

export type ImageItemProps = {
  image: ImageData;
  onClick?: (image: ImageData) => void;
}

export function ImageItem({ image, onClick }: ImageItemProps) {

  return <div className={'ImageItem ' + `Image${image.id}`} onClick={() => onClick?.(image)}>
    <ImageDisplay url={image.download_url} />
  </div>
}
