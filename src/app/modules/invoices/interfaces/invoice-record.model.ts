import { CandidateTimesheet } from '../../timesheets/interface';


export interface InvoiceRecord {
  startDate: string;
  organization: string;
  location: string;
  department: string;
  skill: string;
  jobTitle: string;
  candidate: string;
  rate: number;
  bonus: number;
  hours: number;
  amount: number;
  timesheetId: number;
  minRate?: number;
  maxRate?: number;
  timesheets?: CandidateTimesheet[];
}
