import { ScheduleType } from 'src/app/modules/schedule/enums';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';

export interface DateItem {
  date: Date | string;
  dateValue: string;
  id: number | null;
  orderType?: IrpOrderType | null;
  scheduleType?: ScheduleType;
  tooltipContent?: string;
}

export interface CreateScheduleItem {
  candidateName: string;
  candidateId: number;
  dateItems: DateItem[];
  selectedDates: Date[];
  tooltipContent?: string;
  hasError?: boolean;
}
