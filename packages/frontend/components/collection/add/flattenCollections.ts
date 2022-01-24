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

export const flattenCollections = (
  collections: Collection[],
  depth: number = 0
): Option[] => {
  const spacer = generateSpacer(depth);

  return collections.reduce((acc: Option[], collection) => {
    const option: Option = {
      label: `${spacer} ${collection.title}`,
      value: `${collection.id}`,
    };

    const children = collection.children
      ? flattenCollections(collection.children, depth + 1)
      : [];

    return [...acc, option, ...children];
  }, []);
};
