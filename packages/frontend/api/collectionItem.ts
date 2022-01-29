import { Wretcher } from 'wretch';
import { ID } from '@orpington-news/shared';

export const setDateRead = (
  api: Wretcher,
  itemSerialId: ID,
  dateRead: number | null
) =>
  api
    .url(`/collectionItem/setDateRead`)
    .put({ id: itemSerialId, dateRead })
    .json();
