import { Duration } from '@shared/enums/durations';

export const extensionDurationPrimary = [
  { id: Duration.ThirteenWeeks, name: '13 Weeks' },
  { id: Duration.TwentySixWeeks, name: '26 Weeks' },
  { id: Duration.Month, name: 'Month' },
  { id: Duration.NinetyDays, name: '90 Days' },
  { id: Duration.Year, name: 'Year' },
  { id: Duration.Other, name: 'Other' },
];

export const extensionDurationSecondary = [
  { id: Duration.Days, name: 'Days' },
  { id: Duration.Weeks, name: 'Weeks' },
  { id: Duration.Months, name: 'Months' },
];
