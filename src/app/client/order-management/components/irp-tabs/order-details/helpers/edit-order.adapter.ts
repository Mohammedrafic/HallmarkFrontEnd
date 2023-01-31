import { Order } from '@shared/models/order-management.model';
import { DateTimeHelper } from '@core/helpers';
import {
  modifyJobDistribution,
} from '@client/order-management/components/irp-tabs/order-details/helpers/order-details.helper';

export const adaptOrder = (selectedOrder: Order): Order => {
  return {
    ...selectedOrder,
    ...modifyJobDistribution(selectedOrder),
    ...selectedOrder.irpOrderMetadata,
    jobDates: DateTimeHelper.convertDateToUtc(selectedOrder.jobStartDate.toString()),
    shiftStartTime: DateTimeHelper.convertDateToUtc(selectedOrder.shiftStartTime.toString()),
    shiftEndTime: DateTimeHelper.convertDateToUtc(selectedOrder.shiftEndTime.toString()),
  };
};
