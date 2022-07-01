import { WidgetTypeEnum } from '../enums/widget-type.enum';

export const widgetTypes: Record<string, WidgetTypeEnum> = {
  1: WidgetTypeEnum.CANDIDATES,
  3: WidgetTypeEnum.ACTIVE_POSITIONS,
  4: WidgetTypeEnum.POSITIONS_BY_TYPES,
  5: WidgetTypeEnum.APPLICANTS_BY_REGION,
  7: WidgetTypeEnum.OPEN_POSITIONS,
  8: WidgetTypeEnum.IN_PROGRESS_POSITIONS,
  9: WidgetTypeEnum.FILLED_POSITIONS,
  13: WidgetTypeEnum.TASKS,
};
