export interface EditTimsheetForm {
  day: string;
  timeIn: Date;
  timeOut: Date;
  costCenter: string;
  category: string;
  hours: number;
  rate: number;
  total: number;
}

export interface TimsheetForm {
  search: string;
  orderId: string[];
  status: string[];
  skill: string[];
  department: string[];
  agencyName: string[];
  orgName: string[];
  region: string[];
  location: string[];
}

