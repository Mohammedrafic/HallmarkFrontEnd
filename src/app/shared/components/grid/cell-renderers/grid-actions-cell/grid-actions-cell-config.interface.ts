export interface GridActionsCellItem<T = unknown> {
  iconName?: string;
  iconClass?: string;
  title?: string;
  titleClass?: string;
  action: (data: T) => void;
  disabled?: boolean;
}

export interface GridActionsCellConfig<T = unknown> {
  actionsConfig: GridActionsCellItem<T>[];
}
