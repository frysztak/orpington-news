import { Option } from '@components/forms/SelectField';
import { FlatCollection } from '@orpington-news/shared';

const generateSpacer = (depth: number): string => {
  if (depth === 0) {
    return '';
  }

  if (depth === 1) {
    return '└─';
  }

  return '\u00A0\u00A0' + generateSpacer(depth - 1);
};

export const flattenCollections = (collections: FlatCollection[]): Option[] => {
  return collections.map((collection) => {
    const spacer = generateSpacer(collection.level);
    const option: Option = {
      label: `${spacer} ${collection.title}`,
      value: `${collection.id}`,
    };

    return option;
  });
};
