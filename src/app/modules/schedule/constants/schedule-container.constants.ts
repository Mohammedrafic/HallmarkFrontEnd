import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';

import { TabTitleConfig } from '../enums';

export const TabListConfig: TabsListConfig[] = [
  {
    title: TabTitleConfig.Scheduling,
  },
  // {
  //   title: TabTitleConfig.Analytics,
  // },
];

export const FilterErrorMessage = 'Filter to a single department and skill to start scheduling';

export const HourTimeMealMs = 3600000;
export const HalfHourTimeMealMs = 1800000;
export const AboutSixHoursMs = 21540000;
export const AboutTwentyHoursMs = 43140000;
export const DayMs = 86400000;
