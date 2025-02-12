import { ImageData } from '@/api/images';

export type ImageInfoProp = {
  image: ImageData;
}

export function ImageInfo({ image }: ImageInfoProp) {

  return <div className={'ImageInfo'}>
    <div className={'ImageView'}>
      <img src={image.download_url} alt={image.download_url} />
    </div>
    <div className={'ImageInfoBlock'}>
      <div className={'ImageInfoAuthor'}>Author: <strong>{image.author}</strong></div>
      <div className={'ImageInfoSize'}>{image.width} x {image.height}</div>
      <a href={image.url} target={'_blank'}>get more info...</a>
    </div>
  </div>
}
