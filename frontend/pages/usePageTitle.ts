import { useArticleDetails } from '@features/Article/queries';
import { getNumber } from '@utils';
import { useRouter } from 'next/router';

export const usePageTitle = (): string => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemId = getNumber(router.query?.itemId);
  const { data: { title } = {} } = useArticleDetails(collectionId, itemId);

  return title ? `${title} | Orpington News` : 'Orpington News';
};
