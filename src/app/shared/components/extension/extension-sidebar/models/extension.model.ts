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
}

export interface ExtensionGridModel extends ExtensionModel {
  id: number;
  status: string;
}
