import { Option } from '@components/forms/SelectField';
import { Collection } from '@orpington-news/shared';

const generateSpacer = (depth: number): string => {
  if (depth === 0) {
    return '';
  }

  if (depth === 1) {
    return '└─';
  }

  return '\u00A0\u00A0' + generateSpacer(depth - 1);
};

export const flattenCollections = (collections: Collection[]): Option[] => {
  return collections
    .filter(({ isHome }) => !isHome)
    .map((collection) => {
      const spacer = generateSpacer(collection.level - 1);
      const option: Option = {
        label: `${spacer} ${collection.title}`,
        value: `${collection.id}`,
      };

      return option;
    });
};
