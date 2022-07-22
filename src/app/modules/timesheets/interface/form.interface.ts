export interface AddTimsheetForm {
  timeIn: string;
  timeOut: string;
  departmentId: number;
  billRateId: number;
  amount: number;
  description: string;
}

export interface TimsheetForm {
  search: string;
  orderIds: string[];
  statusIds: string[];
  skillIds: string[];
  departmentIds: string[];
  agencyIds: string[];
  regionsIds: string[];
  locationIds: string[];
}

