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

export const ButtonRegionTooltip = 'Select a single Region-Location-Department to Schedule';
export const ButtonSelectDataTooltip = 'Select at least one date to Schedule';
