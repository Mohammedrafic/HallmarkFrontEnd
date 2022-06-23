import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface AvailableWidgetsResponseModel {
  widgetTypes: WidgetOptionModel[];
}

export interface WidgetOptionModel {
  id: WidgetTypeEnum;
  description: string;
  widgetType: number;
  title: string;
}
