import { DateTime } from "@syncfusion/ej2-angular-charts";

export enum OrderType {
  'Contract to Perm' = 0,
  'Open Per Diem' = 1,
  'Perm Placement' = 2,
  'Traveler' = 3,
  'Reorder' = 10
}
export class OrderStatusSummaryReportRequest {

  Region?: string;
  Location?: string;
  Department?: string;
  Skills?: string;
  OrderType?: string;
  OrderStatus?: string;
  OrderStartDate?: DateTime;
  OrderEndDate?: DateTime;
}

export class OrderStatusSummaryReportFilters {
  region: string[];
  location: string[];
  department: string[];
  skills: string[];
  orderStatus: string[];
}

export class OrderStatusSummaryCustomReport {
  region: string;
  location: string;
  locationId: string;
  department: string;
  departmentId: number;
  skill: string;
  orderType: string;
  totalPosition: number;
  openPositions: number;
  onboard: number;
  closed: number;
  applied: number;
  shortlisted: number;
  offered: number;
  accepted: number;
  cancelled: number;
  withdrawn: number;
  rejected: number;
  inProgress: number;
  filled: number;
}
