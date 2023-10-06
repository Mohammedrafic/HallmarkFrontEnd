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
    jobDates: selectedOrder.jobStartDate ? DateTimeHelper.setCurrentTimeZone(selectedOrder.jobStartDate.toString()) : "",
    // shiftStartTime: DateTimeHelper.setCurrentTimeZone(selectedOrder.shiftStartTime.toString()),
    // shiftEndTime:  DateTimeHelper.setCurrentTimeZone(selectedOrder.shiftEndTime.toString()),
    jobStartDate: DateTimeHelper.setCurrentTimeZone(startJobDate),
    jobEndDate: DateTimeHelper.setCurrentTimeZone(endJobDate),
  };
};
