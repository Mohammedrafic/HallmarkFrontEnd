export interface EditTimsheetForm {
  day: string;
  timeIn: string;
  timeOut: string;
  costCenter: string;
  category: string;
  hours: number;
  rate: number;
  total: number;
}

export interface TimsheetForm {
  date: string;
  search: string;
  orderId: string;
  status: string[];
  skill: string[];
  department: string[];
  billRate: number;
  agencyName: string[];
  totalHours: number;
}

