import type { PanelModel } from '@syncfusion/ej2-angular-layouts';
import type { WidgetOptionModel } from './widget-option.model';

export interface DashboardDataModel {
  panels: PanelModel[];
  widgets: WidgetOptionModel[];
}
