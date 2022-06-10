import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface AvailableWidgetsResponseModel {
  widgetTypes: WidgetOptionModel[];
}

export interface WidgetOptionModel {
  description: string;
  widgetType: number;
  title: WidgetTypeEnum;
}
