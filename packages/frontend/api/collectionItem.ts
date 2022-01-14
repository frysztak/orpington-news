import { Wretcher } from 'wretch';

export const setDateRead = (
  api: Wretcher,
  itemId: string,
  dateRead: number | null
) =>
  api.url(`/collectionItem/setDateRead`).put({ id: itemId, dateRead }).json();
