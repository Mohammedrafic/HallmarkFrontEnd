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
  orderId: string[];
  statusText: string[];
  skill: string[];
  department: string[];
  agencyName: string[];
  orgName: string[];
  region: string[];
  location: string[];
}

