import { WidgetTypeEnum } from "../enums/widget-type.enum";

export const widgetTitles: Record<WidgetTypeEnum, string> = {
  [WidgetTypeEnum.CANDIDATES]: 'Candidates',
  [WidgetTypeEnum.ACTIVE_POSITIONS]: 'Active Positions',
  [WidgetTypeEnum.POSITIONS_BY_TYPES]: 'Open, Onboard and Closed Positions',
  [WidgetTypeEnum.APPLICANTS_BY_REGION]: 'Applicants by Region',
  [WidgetTypeEnum.OPEN_POSITIONS]: 'Open Positions',
  [WidgetTypeEnum.IN_PROGRESS_POSITIONS]: 'In Progress Positions',
  [WidgetTypeEnum.FILLED_POSITIONS]: 'Filled Positions',
};
