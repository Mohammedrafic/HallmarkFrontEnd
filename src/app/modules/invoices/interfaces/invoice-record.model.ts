import { RecordValue } from '../../timesheets/interface';
import { BillRateType } from '@shared/models';


export interface InvoiceRecord {
  type: 'Timesheet' | 'Manual';
  // unitName?
  agency: string;

  candidateFirstName: string;
  candidateLastName: string;
  orderId: number;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  rate: number;
  bonus: number;
  expenses: number;
  hours: number;
  miles: number;
  amount: number;
  timesheetId?: number;
  timesheetRecords: InvoiceRecordTimesheetEntry[];
}

export interface InvoiceRecordTimesheetEntry {
  date: string;
  billRateType: BillRateType;
  timeIn: string;
  timeOut: string;
  rate: number;
  value: number;
  total: number;
  comment: string;
}
