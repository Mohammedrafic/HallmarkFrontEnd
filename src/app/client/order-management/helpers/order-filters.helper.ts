import { OrderFilter, OrderFilterDateList } from '@shared/models/order-management.model';
import { DateTimeHelper } from '@core/helpers';

export const PrepareOrderFilterDates = (
  filters: OrderFilter,
  filterControls: string[],
): OrderFilter => {
  filterControls.forEach((control: string) => {
    const filterControl = filters[control as keyof OrderFilter];

    filters[control as keyof OrderFilter] = filterControl ? DateTimeHelper.setUtcTimeZone(filterControl) : null;
  });

  return filters;
};

export const GetOrderFilterDatesInUts = (
  filters: OrderFilter,
  filterControls: string[],
): OrderFilterDateList => {
  return filterControls.reduce((acc: OrderFilterDateList, current: string) => {
    const filterValue = filters[current as keyof OrderFilter];
    acc[current as keyof OrderFilterDateList] = filterValue ?
      DateTimeHelper.setUtcTimeZone(filterValue.toString()) : null;

    return acc;
  }, {
    jobStartDate: null,
    jobEndDate: null,
    creationDateFrom: null,
    creationDateTo: null,
    distributedOnFrom: null,
    distributedOnTo: null,
  });
};
