export interface ReorderModel {
  id?: number;
  candidates: number[];
  agencies: number[];
  reorderDate: Date;
  shiftStartTime: Date | string;
  shiftEndTime: Date | string;
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

export interface ReorderResponse {
  reOrderId: number;
  reOrderFromId: number;
  commentContainerId: number;
}

export interface ReorderRequest {
  reOrderId: number | null;
  reOrderFromId: number;
  candidateProfileIds: number[];
  agencyIds: number[] | null;
  reorderDates: string[];
  shiftStartTime: Date;
  shiftEndTime: Date;
  billRate: number;
  openPositions: number;
}
