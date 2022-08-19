export const calcItemPadding = (
  chevron?: 'top' | 'bottom',
  level?: number
): string => {
  const paddingLeft = (chevron ? 0 : 3) + (level || 0) * 2;

  return `calc(${paddingLeft} * var(--chakra-space-2))`;
};
