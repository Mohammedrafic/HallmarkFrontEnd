export interface GridActionsCellItem {
  iconName?: string;
  iconClass?: string;
  title?: string;
  titleClass?: string;
  action: (data?: unknown) => void;
  disabled?: boolean;
}

export interface GridActionsCellConfig {
  actionsConfig: GridActionsCellItem[];
}
