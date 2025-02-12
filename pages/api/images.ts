import { errMsg } from '@/utils/error';
import { limitNumberMin } from '@/utils/number';
import { qs } from '@/utils/url';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const page = limitNumberMin(req.query.page, 1, 1);
  const limit = 3 * 10 - (page <= 1 ? 3 : 0);

  try {
    const results = await fetch(`https://picsum.photos/v2/list${qs({ page, limit })}`);
    try {
      const json = await results.json();
      res.status(200).json({
        page,
        limit,
        images: json,
      });
    } catch (jsonError) {
      res.status(500).json({
        error: errMsg(jsonError),
      });
    }
  } catch (error) {
    res.status(500).json({
      error: errMsg(error),
    });
  }
}
