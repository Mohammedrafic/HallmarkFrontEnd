export interface ReorderModel {
  id?: number;
  candidates: number[];
  agencies: number[];
  reorderDate: Date;
  shiftStartTime: Date;
  shiftEndTime: Date;
  billRate: number;
  openPosition: number;
}

export interface ReorderRequestModel {
  reorder: ReorderModel;
  reOrderId: number;
  reOrderFromId: number;
  candidateProfileIds: number[];
  agencyIds: number[] | null;
  reorderDate: Date;
  shiftStartTime: Date;
  shiftEndTime: Date;
  billRate: number;
  openPositions: number;
}
