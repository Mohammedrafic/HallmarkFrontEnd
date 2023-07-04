import { Order } from '@shared/models/order-management.model';
import { DateTimeHelper } from '@core/helpers';
import {
  modifyJobDistribution,
} from '@client/order-management/components/irp-tabs/order-details/helpers/order-details.helper';

export const adaptOrder = (selectedOrder: Order): Order => {
  const startJobDate = selectedOrder.jobStartDate ? selectedOrder.jobStartDate.toString() : new Date().toString();
  const endJobDate = selectedOrder.jobEndDate ? selectedOrder.jobEndDate.toString() : new Date().toString();

  return {
    ...selectedOrder,
    ...modifyJobDistribution(selectedOrder),
    ...selectedOrder.irpOrderMetadata,
    jobDates: DateTimeHelper.setCurrentUtcDate(selectedOrder.jobStartDate.toString()),
    shiftStartTime: DateTimeHelper.setCurrentUtcDate(selectedOrder.shiftStartTime.toString()),
    shiftEndTime: DateTimeHelper.setCurrentUtcDate(selectedOrder.shiftEndTime.toString()),
    jobStartDate: DateTimeHelper.setCurrentUtcDate(startJobDate),
    jobEndDate: DateTimeHelper.setCurrentUtcDate(endJobDate),
  };
};
