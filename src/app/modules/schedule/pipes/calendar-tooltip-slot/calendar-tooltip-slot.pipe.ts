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
    } else if(value.departmentStartDate && value.departmentEndDate) {
      return `Candidate is assigned to Department from ${getCandidateDate(value.departmentStartDate)} to ${getCandidateDate(value.departmentEndDate)}`;
    } else {
      return `Candidate is assigned to Department from ${getCandidateDate(value.departmentStartDate)}`;
    }
  }
}
