import { errMsg } from '@/utils/error';
import {
  limitNumberMin,
} from '@/utils/number';
import { qs } from '@/utils/url';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  let page = limitNumberMin(req.query.page, 1, 1);
  const limit = 40;

  try {
    const results = await fetch(`https://picsum.photos/v2/list${qs({ page, limit })}`);
    const json = await results.json();
    res.status(200).json({
      page,
      limit,
      images: json,
    });
  } catch (error) {
    res.status(500).json({
      error: errMsg(error),
    });
  }
}
