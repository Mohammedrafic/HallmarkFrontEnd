import { FormGroup } from '@angular/forms';
import { WeekDays } from '@shared/enums/week-days.enum';

import * as ScheduleInt from '../interface';
import { DropdownOption } from '@core/interface';
import { convertMsToTime, getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { ShiftTab } from '../components/edit-schedule/edit-schedule.interface';
import { ScheduleAttributeKeys, ScheduleType } from '../enums';
import {
  BookingError,
  ScheduleBookingErrors,
  ScheduleCandidate,
  ScheduleDateItem,
  ScheduledItem,
  ScheduleItem,
  ScheduleItemAttributes,
  ScheduleModel,
  ScheduleModelPage,
} from '../interface';
import { DateTimeHelper } from '@core/helpers';
import { CreateScheduleItem, DateItem } from '../components/schedule-items/schedule-items.interface';
import { RECORD_ADDED, RECORDS_ADDED } from '@shared/constants';
import { WeekList } from '../constants';

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
  const date = new Date(`${dateValue}T00:00:00`);
  return {
    dateValue: DateTimeHelper.toUtcFormat(date),
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
  && schedule.employeeScheduledDays[0].dates.length === 1
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
  if(scheduleItem.orderMetadata?.location && scheduleItem.orderMetadata?.department) {
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

export const HasNotMandatoryFilters = (filters: ScheduleInt.ScheduleFilters): boolean | undefined => {
  return (filters.departmentsIds && !filters.departmentsIds.length)
    || (filters.skillIds && !filters.skillIds.length);
};

export const HasMultipleFilters = (filters: ScheduleInt.ScheduleFilters): boolean | undefined => {
  return filters.regionIds && filters.regionIds.length > 1 ||
    filters.locationIds && filters.locationIds.length > 1 ||
    filters.departmentsIds && filters.departmentsIds.length > 1 ||
    filters.skillIds && filters.skillIds.length > 1;
};

export const GetShiftHours = (startTimeDate: Date, endTimeDate: Date): string => {
  const startTimeMs: number = startTimeDate.setMilliseconds(0);
  let endTimeMs: number = endTimeDate.setMilliseconds(0);

  if (startTimeMs > endTimeMs) {
    const dayMs = 86400000;
    endTimeMs = endTimeMs + dayMs;
  }

  return convertMsToTime(endTimeMs - startTimeMs);
};

export const MapToDropdownOptions = (items: { name: string; id: number }[]): DropdownOption[] => {
  return items.map(item => {
    return {
      text: item.name,
      value: item.id,
    };
  });
};

export const MapShiftToDropdownOptions = (items: { startTime: string; endTime: string; id: number }[]): DropdownOption[] => {
  return items.map(item => {
    return {
      text: `${FormatShiftHours(item.startTime)} - ${FormatShiftHours(item.endTime)}`,
      value: item.id,
    };
  });
};

export const FormatShiftHours = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const GetScheduleTabItems = (daySchedules: ScheduleItem[]): ShiftTab[] => {
  const scheduleTitleMapper: Record<ScheduleType, string> = {
    [ScheduleType.Book]: 'Booking',
    [ScheduleType.Unavailability]: 'Unavailable',
    [ScheduleType.Availability]: 'Available',
  };

  return daySchedules.map((schedule: ScheduleItem) => {
    return {
      title: schedule.orderMetadata?.orderPublicId
        ? schedule.orderMetadata.orderPublicId
        : scheduleTitleMapper[schedule.scheduleType],
      subTitle: GetTimeRange(schedule.startDate, schedule.endDate),
      id: schedule.id,
    };
  });
};

export const GetShiftTimeControlsValue =
  (shiftStartTime: string, shiftEndTime: string): { startTime: Date, endTime: Date } => {
    const [startH, startM, startS] = getHoursMinutesSeconds(shiftStartTime);
    const [endH, endM, endS] = getHoursMinutesSeconds(shiftEndTime);
    const startTime = new Date();
    const endTime = new Date();
    startTime.setHours(startH, startM, startS);
    endTime.setHours(endH, endM, endS);

    return { startTime, endTime };
  };

export const GetScheduleDateItem = (
  candidateId: number,
  date: string,
  scheduleData: ScheduleModelPage
): ScheduleDateItem | undefined => {
  const dateStringLength = 10;

  return (scheduleData.items.find((item: ScheduleModel) => item.candidate.id === candidateId) as ScheduleModel)
      .schedule.find((item: ScheduleDateItem) => item.date.substring(0, dateStringLength) === date);
};

export const GetMonthRange = (initDay: number): WeekDays[] => {
  const daysInWeek = WeekList;
  const startingDayIndex = initDay % 7;

  return  [
    ...daysInWeek.slice(startingDayIndex),
    ...daysInWeek.slice(0, startingDayIndex),
  ];
};

export const CreateScheduleAttributes = (attributes: ScheduleItemAttributes, isTooltip = false): string => {
  if(attributes.orientated) {
    return ScheduleAttributeKeys.ORI;
  }

  return CreateAttributesList(attributes, isTooltip);
};

export const CreateAttributesList = (attributes: ScheduleItemAttributes, isTooltip = false): string => {
  const attributesList = [];

  if(attributes.critical){
    attributesList.push(ScheduleAttributeKeys.CRT);
  }

  if(attributes.onCall) {
    attributesList.push(ScheduleAttributeKeys.OC);
  }

  if(attributes.charge) {
    attributesList.push(ScheduleAttributeKeys.CHG);
  }

  if(attributes.preceptor) {
    attributesList.push(ScheduleAttributeKeys.PRC);
  }

  if (attributesList.length > 2 && !isTooltip) {
    attributesList.splice(2);
  }

  return attributesList.length ? attributesList.join(',') : '';
};

export const GetScheduledShift = (
  scheduleData: ScheduleInt.ScheduleModelPage,
  candidateId: number,
  date: string
): ScheduledItem => {
  const scheduledShiftData = scheduleData?.items.find((item: ScheduleModel) => item.candidate.id === candidateId);

  return  {
    candidate: scheduledShiftData?.candidate as ScheduleCandidate,
    schedule: scheduledShiftData?.schedule.find((item: ScheduleDateItem) => item.date === date) as ScheduleDateItem,
  };
};
