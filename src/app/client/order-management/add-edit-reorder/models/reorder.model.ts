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
  reOrderId: number;
  reOrderFromId: number;
  candidateProfileIds: number[];
  agencyIds: number[];
  reorderDate: Date;
  shiftStartTime: Date;
  shiftEndTime: Date;
  billRate: number;
  openPositions: number;
}
