export interface MasterOrientationExportColumn {
    text: string;
    column: string;
  }
  export interface OrientationSelectedRowEvent {
    rowIndex: number;
    data: any;
    isInteracted?: boolean;
  }