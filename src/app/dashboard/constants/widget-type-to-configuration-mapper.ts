import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';

export const widgetTypeToConfigurationMapper: Record<WidgetTypeEnum, PanelModel> = {
  [WidgetTypeEnum.CANDIDATES]: { sizeX: 3, sizeY: 4, maxSizeY: 4, maxSizeX: 3, minSizeX: 3, minSizeY: 4 },
  [WidgetTypeEnum.APPLICANTS_BY_REGION]: { sizeX: 3, sizeY: 3, maxSizeY: 3, maxSizeX: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.APPLICANTS_BY_POSITIONS]: { sizeX: 3, sizeY: 3, maxSizeY: 3, maxSizeX: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.ACTIVE_POSITIONS]: { sizeX: 3, sizeY: 4, maxSizeY: 4, maxSizeX: 3, minSizeX: 3, minSizeY: 4 },
  [WidgetTypeEnum.POSITIONS_BY_TYPES]: { sizeX: 3, sizeY: 3, maxSizeY: 3, maxSizeX: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.IN_PROGRESS_POSITIONS]: { sizeX: 1, sizeY: 1, maxSizeX: 1, maxSizeY: 1, minSizeX: 1, minSizeY: 1 },
  [WidgetTypeEnum.OPEN_POSITIONS]: { sizeX: 1, sizeY: 1, maxSizeX: 1, maxSizeY: 1, minSizeX: 1, minSizeY: 1 },
  [WidgetTypeEnum.FILLED_POSITIONS]: { sizeX: 1, sizeY: 1, maxSizeX: 1, maxSizeY: 1, minSizeX: 1, minSizeY: 1 },
  [WidgetTypeEnum.FILLED_POSITIONS_TREND]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
  [WidgetTypeEnum.TASKS]: { sizeX: 3, sizeY: 5, maxSizeX: 3, maxSizeY: 5, minSizeX: 3, minSizeY: 5 },
  [WidgetTypeEnum.CHAT]: { sizeX: 3, sizeY: 3, maxSizeX: 3, maxSizeY: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.INVOICES]: { sizeX: 3, sizeY: 3, maxSizeX: 3, maxSizeY: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.OPEN_POSITIONS_TREND]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
  [WidgetTypeEnum.IN_PROGRESS_POSITIONS_TREND]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
  [WidgetTypeEnum.LTA_ORDER_ENDING]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
  [WidgetTypeEnum.Candidate_Applied_In_Last_N_Days]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
  [WidgetTypeEnum.ORG]: { sizeX: 3, sizeY: 1, maxSizeX: 3, maxSizeY: 1, minSizeX: 3, minSizeY: 1 },
};
