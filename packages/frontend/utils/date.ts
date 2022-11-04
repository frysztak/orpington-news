import enGB from 'date-fns/locale/en-GB';
import { formatRelative as dateFnsFormatRelative, Locale } from 'date-fns';

/**
 * courtesy of https://github.com/date-fns/date-fns/issues/1218#issuecomment-599182307
 */
// https://date-fns.org/docs/I18n-Contribution-Guide#formatrelative
// https://github.com/date-fns/date-fns/blob/master/src/locale/en-US/_lib/formatRelative/index.js
// https://github.com/date-fns/date-fns/issues/1218
// https://stackoverflow.com/questions/47244216/how-to-customize-date-fnss-formatrelative
const formatRelativeLocale = {
  lastWeek: "'Last' eee",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: "'Next' eee",
  other: 'dd/MM/yyyy',
};

const locale: Locale = {
  ...enGB,
  formatRelative: (token) => (formatRelativeLocale as any)[token],
};

export const formatRelative = (date: Date) =>
  dateFnsFormatRelative(date, new Date(), { locale });
