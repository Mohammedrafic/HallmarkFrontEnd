import { Attachment } from '@shared/components/attachments';
import { TimesheetStatus } from '../../timesheets/enums/timesheet-status.enum';

// TODO: Create basic interface for invoices
export interface ManualInvoice {
  type: 'Manual';
  status: TimesheetStatus;
  statusText: string;
  unitName: string;
  candidateFirstName: string;
  candidateLastName: string;
  orderId: number;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  rejectReason: string | null;
  attachments: Attachment[];
  amount: number;
}
