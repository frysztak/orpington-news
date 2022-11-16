import { groupBy } from 'rambda';
import {
  fromUnixTime,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday,
} from 'date-fns';
import { CollectionItem } from '@orpington-news/shared';

export const groupByDate = groupBy<CollectionItem>(({ datePublished }) => {
  const date = fromUnixTime(datePublished);
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date, { weekStartsOn: 1 })) {
    return 'This week';
  } else if (isThisMonth(date)) {
    return 'This month';
  } else {
    return 'More than a month ago';
  }
});

export const groupByCollection = groupBy<CollectionItem>(
  ({ collection: { title } }) => {
    return title;
  }
);

export const getGroupCounts = (
  groups: Record<string, CollectionItem[]>
): number[] => {
  return Object.values(groups).map((items) => items.length);
};

export const getGroupNames = (
  groups: Record<string, CollectionItem[]>
): string[] => {
  return Object.keys(groups);
};
