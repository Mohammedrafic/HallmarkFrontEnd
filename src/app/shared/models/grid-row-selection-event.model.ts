export interface GridRowSelectBaseEventModel<Data> {
  data: Data;
  foreignKeyData: Record<string, string>;
  isHeaderCheckboxClicked: boolean;
  isInteracted: boolean;
  row: HTMLElement;
  rowIndex: number;
  rowIndexes: number[];
  target: HTMLElement;
}

export interface GridRowSelectEventModel<Data> extends GridRowSelectBaseEventModel<Data> {
  name: 'rowSelected';
  prevRow: HTMLElement;
  previousRowIndex: number;
}

export interface GridRowDeselectEventModel<Data> extends GridRowSelectBaseEventModel<Data> {
  name: 'rowDeselected';
}
