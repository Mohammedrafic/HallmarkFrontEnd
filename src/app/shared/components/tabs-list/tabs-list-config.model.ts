import { TabItemModel } from '@syncfusion/ej2-navigations/src/tab/tab-model';

export interface TabsListConfig extends Pick<TabItemModel, 'visible'> {
  title: string;
  amount?: number;
}
