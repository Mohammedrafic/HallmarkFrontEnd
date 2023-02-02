import { WidgetTypeEnum } from '../enums/widget-type.enum';

export const widgetTypes: Record<string, WidgetTypeEnum> = {
  1: WidgetTypeEnum.CANDIDATES,
  3: WidgetTypeEnum.ACTIVE_POSITIONS,
  4: WidgetTypeEnum.POSITIONS_BY_TYPES,
  5: WidgetTypeEnum.APPLICANTS_BY_REGION,
  7: WidgetTypeEnum.OPEN_POSITIONS,
  8: WidgetTypeEnum.IN_PROGRESS_POSITIONS,
  9: WidgetTypeEnum.FILLED_POSITIONS,
  10: WidgetTypeEnum.FILLED_POSITIONS_TREND,
  11: WidgetTypeEnum.INVOICES,
  12: WidgetTypeEnum.CHAT,
  13: WidgetTypeEnum.TASKS,
  14: WidgetTypeEnum.APPLICANTS_BY_POSITIONS,
  15: WidgetTypeEnum.OPEN_POSITIONS_TREND,
  16: WidgetTypeEnum.IN_PROGRESS_POSITIONS_TREND,
  17: WidgetTypeEnum.LTA_ORDER_ENDING,
  18: WidgetTypeEnum.Candidate_Applied_In_Last_N_Days
  19: WidgetTypeEnum.ORG
};
