import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

export interface GridActionsCellItem<T = unknown> {
  iconName?: string;
  iconClass?: string;
  title?: string;
  titleClass?: string;
  action: (data: T) => void;
  disabled?: boolean;
  isCustomIcon?: boolean;
  buttonClass?: string;
  useBadge?: boolean;
  menuItems?: ItemModel[];
}

export interface GridActionsCellConfig<T = unknown> {
  actionsConfig: GridActionsCellItem<T>[];
}
