import { TabItemModel } from '@syncfusion/ej2-navigations/src/tab/tab-model';

export interface CustomTabItemModel extends TabItemModel {
  amount?: number;
  title?: string;
  hidden?: boolean;
}
