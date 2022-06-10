import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';

export const widgetTypeToConfigurationMapper: Record<WidgetTypeEnum, PanelModel> = {
  [WidgetTypeEnum.CANDIDATES]: { sizeX: 3, sizeY: 3, maxSizeY: 3, maxSizeX: 3, minSizeX: 3, minSizeY: 3 },
  [WidgetTypeEnum.APPLICANTS_BY_REGION]: { sizeX: 3, sizeY: 3, maxSizeY: 3, maxSizeX: 3, minSizeX: 3, minSizeY: 3 },
};
