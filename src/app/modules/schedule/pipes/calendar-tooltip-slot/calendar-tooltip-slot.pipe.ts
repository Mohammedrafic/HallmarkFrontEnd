import { Pipe, PipeTransform } from '@angular/core';

import { ScheduleDateItem } from '../../interface';
import { EmployeeStatus } from '@shared/enums/status';
import { getCandidateDate } from '@shared/helpers';

@Pipe({
  name: 'calendarTooltipSlot',
})
export class CalendarTooltipSlotPipe implements PipeTransform {
  transform(value: ScheduleDateItem): string {
    if (value.employeeStatus) {
      return `Candidate status is ${EmployeeStatus[value.employeeStatus]}`;
    } else {
      return `Candidate is assigned to Department between ${getCandidateDate(value.departmentStartDate)} - ${getCandidateDate(value.departmentEndDate) ?? '...'}`;
    }
  }
}
