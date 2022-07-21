export interface EditTimsheetForm {
  day: Date;
  timeIn: Date;
  timeOut: Date;
  costCenter: string;
  category: string;
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

