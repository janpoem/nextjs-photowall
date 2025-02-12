import { api } from '@/api/_common';
import { limitNumberMin } from '@/utils/number';
import { qs } from '@/utils/url';

export type ImageData = {
  'id': string,
  'author': string,
  'width': number,
  'height': number,
  'url': string,
  'download_url': string
}

export type ImagesListData = {
  page: number;
  limit: number;
  images: ImageData[];
}

export type ImagePreload = {
  width: number;
  height: number;
  url: string;
}

export const fetchImages = (page?: number | null) => api.get<ImagesListData>(`images${qs({ page: limitNumberMin(page, 1, 1) })}`);

export const fetchImage = async (url: string) => {
  return new Promise<ImagePreload>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve( { url, width: image.width, height: image.height })
    };

    image.onerror = () => {
      reject(new Error('Image load error'));
    };

    image.src = url;
  });
};
