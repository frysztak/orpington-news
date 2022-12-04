import { groupBy } from 'rambda';
import {
  fromUnixTime,
  isAfter,
  isFuture,
  isSameMonth,
  isSameWeek,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday,
  startOfMonth,
  startOfWeek,
  sub,
} from 'date-fns';
import { CollectionItem } from '@orpington-news/shared';

const weekStartsOn = 1; // Monday
const isLastWeek = (date: Date): boolean => {
  const lastWeekStart = startOfWeek(
    sub(new Date(), {
      days: 7,
    }),
    { weekStartsOn }
  );
  return isSameWeek(date, lastWeekStart, { weekStartsOn });
};

const isLast30Days = (date: Date): boolean => {
  const startDate = sub(new Date(), {
    days: 30,
  });
  return isAfter(date, startDate);
};

const isLastMonth = (date: Date): boolean => {
  const lastMonthStart = startOfMonth(
    sub(new Date(), {
      months: 1,
    })
  );
  return isSameMonth(date, lastMonthStart);
};

export const groupByDate = groupBy<CollectionItem>(({ datePublished }) => {
  const date = fromUnixTime(datePublished);
  if (isToday(date)) {
    return 'Today';
  } else if (isFuture(date)) {
    return 'In the Future';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date, { weekStartsOn })) {
    return 'This week';
  } else if (isLastWeek(date)) {
    return 'Last week';
  } else if (isThisMonth(date)) {
    return 'This month';
  } else if (isLast30Days(date)) {
    return 'Last 30 days';
  } else if (isLastMonth(date)) {
    return 'Last month';
  } else if (isThisYear(date)) {
    return 'This year';
  } else {
    return 'Lifetime ago';
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
