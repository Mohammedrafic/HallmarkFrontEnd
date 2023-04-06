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

export const ButtonRegionTooltip = 'Select a single Region-Location-Department-Skill to Schedule';
export const ButtonSelectDataTooltip = 'Select at least one date to Schedule';
export const FilterErrorMessage = 'Filter to a single department and skill to start scheduling';
