import { FormGroup } from '@angular/forms';

import * as ScheduleInt from '../interface';
import { BookingError, ScheduleBookingErrors, ScheduleItem } from '../interface';
import { DateTimeHelper } from '@core/helpers';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import { RECORD_ADDED, RECORDS_ADDED } from '@shared/constants';

export const GetScheduleDayWithEarliestTime = (schedules: ScheduleInt.ScheduleItem[]): ScheduleItem => {
  if(schedules.length >= 2) {
    return schedules.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    })[0];
  } else {
    return schedules[0];
  }
};

export const CreateScheduleDateItems = (dateValue: string): DateItem => {
  const date = new Date(dateValue);

  return {
    dateValue: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(date)),
    id: null,
    date,
  };
};

export const CreateBookTooltip = (schedules: ScheduleInt.ScheduleItem[]): string => {
  if (schedules.length > 0) {
    const tooltipMessages: string[] = schedules.map((schedule) => {
      const timeRange = GetTimeRange(schedule.startDate, schedule.endDate);
      const { unavailabilityReason, scheduleType } = schedule;
      const reason = unavailabilityReason ? ` ${unavailabilityReason}` : '';

      return `${timeRange}${reason} - ${scheduleType}`;
    });

    return tooltipMessages.join(', ');
  }

  return '';
};

export const CreateTooltip = (daySchedule: ScheduleInt.ScheduleItem): string => {
  const timeRange = GetTimeRange(daySchedule.startDate, daySchedule.endDate);
  const { unavailabilityReason } = daySchedule;

  if (timeRange) {
    return unavailabilityReason ? `${timeRange} ${unavailabilityReason}` : timeRange;
  }

  return '';
};

export const GetTimeRange = (startDate: string, endDate: string): string  => {
  if (startDate && endDate) {
    return `${DateTimeHelper.formatDateUTC(startDate, 'HH:mm')} - ${DateTimeHelper.formatDateUTC(endDate, 'HH:mm')}`;
  }

  return '';
};

export const DisableScheduleControls = (form: FormGroup, controls: string[]): void => {
  controls.forEach((controlName: string) => form.get(controlName)?.disable());
};

export const CreateScheduleSuccessMessage = (schedule: ScheduleInt.Schedule): string => {
  return schedule.employeeScheduledDays.length === 1
  && schedule.employeeScheduledDays[0].scheduledDays.length === 1
    ? RECORD_ADDED
    : RECORDS_ADDED;
};

export const CreateBookingSuccessMessage = (schedule: ScheduleInt.ScheduleBook): string => {
  return schedule.employeeBookedDays.length === 1
  && schedule.employeeBookedDays[0].bookedDays.length === 1
    ? RECORD_ADDED
    : RECORDS_ADDED;
};

export const GetCountErrors = (errors: ScheduleBookingErrors[]): number => {
  return errors.reduce((acc:number, current: ScheduleBookingErrors) => {
    return acc + (current.DateLevelErrors?.length || 0) + (current.EmployeeLevelErrors?.length || 0);
  }, 0);
};

export const ScheduleItemsWithErrors = (
  scheduleItems: CreateScheduleItem[],
  errors: ScheduleBookingErrors[]
): CreateScheduleItem[] => {
  return scheduleItems.map((candidate: CreateScheduleItem) => {
    const findCandidateWithError =
      errors.find((error: ScheduleBookingErrors) => error.EmployeeId === candidate.candidateId );

    if (findCandidateWithError) {
      const { EmployeeLevelErrors, DateLevelErrors } = findCandidateWithError;

      return  {
        ...candidate,
        tooltipContent: GetCandidateTooltip(EmployeeLevelErrors) ?? '',
        hasError: !!EmployeeLevelErrors?.length,
        dateItems: DataItemsWithErrors(candidate.dateItems, DateLevelErrors),
      };
    } else {
      return candidate;
    }
  });
};

export const DataItemsWithErrors = (dateItems: DateItem[], dateLevelErrors: BookingError[]): DateItem[] => {
  return dateItems.map((item: DateItem) => {
    const findItemWithError = dateLevelErrors.find((error: BookingError) => {
      return DateTimeHelper.toUtcFormat(error.Key) === item.dateValue;
    });

    if(findItemWithError) {
      return {
        ...item,
        tooltipContent: findItemWithError.Value ?? '',
        hasError: !!dateLevelErrors?.length,
      };
    } else {
      return item;
    }
  });
};

export const GetCandidateTooltip = (errors: string[]): string => {
  return errors.length === 1 ? errors[0] : errors?.map((value: string) => value).join(', ');
};

export const CardTitle = (scheduleItem: ScheduleItem): string => {
  if(scheduleItem.orderMetadata.location && scheduleItem.orderMetadata.department) {
    return `${scheduleItem?.orderMetadata.location.slice(0, 3)}-${scheduleItem?.orderMetadata.department.slice(0, 3)}`;
  } else {
    return '';
  }
};

export const GetScheduleFilterByEmployees = (filters: ScheduleInt.ScheduleFilters): ScheduleInt.EmployeesFilters => {
  const { startDate, endDate, departmentsIds } = filters;

  return {
    startDate: startDate || '',
    endDate: endDate || '',
    departmentsIds: departmentsIds ?? [],
  };
};

export const HasDepartment = (filters: ScheduleInt.ScheduleFilters): boolean | undefined => {
  return filters.departmentsIds && !filters.departmentsIds.length;
};

export const ShowButtonTooltip = (filters: ScheduleInt.ScheduleFilters): boolean | undefined => {
  return filters.regionIds && filters.regionIds.length > 1 ||
    filters.locationIds && filters.locationIds.length > 1 ||
    filters.departmentsIds && filters.departmentsIds.length > 1;
};
