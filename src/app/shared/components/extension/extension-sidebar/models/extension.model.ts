import { Duration } from '@shared/enums/durations';
import { BillRate } from '@shared/models';

export interface ExtensionModel {
  orderId: number;
  actualStartDate: string;
  actualEndDate: string;
  billRate: number;
  comments: string | null;
  billRates: BillRate[];
  jobId: number;
  duration: Duration;
  ignoreMissingCredentials: boolean
  linkedId: string | null;
}

export interface ExtensionFormData extends Omit<ExtensionModel, 'actualStartDate' | 'actualEndDate'> {
  startDate: Date;
  endDate: Date;
  durationPrimary: Duration;
}

export interface ExtensionGridModel extends ExtensionModel {
  id: number;
  status: string;
}
