export interface AddTimsheetForm {
  timeIn: string;
  timeOut: string;
  departmentId: number;
  billRateConfigId: number;
  amount: number;
  description: string;
  hadLunchBreak: boolean;
  day?: Date | string;
}

export interface TimsheetForm {
  searchTerm: string;
  orderIds: string[];
  statusIds: string[];
  skillIds: string[];
  departmentIds: string[];
  agencyIds: string[];
  regionsIds: string[];
  locationIds: string[];
}

