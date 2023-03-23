import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable, of } from 'rxjs';

import { getTime } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { ScheduleItemType } from 'src/app/modules/schedule/constants';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { UserState } from 'src/app/store/user.state';
import { CreateScheduleItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import { ScheduleItemsComponent } from '../components/schedule-items/schedule-items.component';
import { EmployeeBookingDay, ScheduleBookingErrors, ScheduleTypeRadioButton } from '../interface';

@Injectable()
export class CreateScheduleService {

  private scheduleModels: ScheduleInt.ScheduleModel[] = [];

  set scheduleData(data: ScheduleInt.ScheduleModel[]) {
    this.scheduleModels = [...data];
  }

  get scheduleData(): ScheduleInt.ScheduleModel[] {
    return [...this.scheduleModels];
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
  ) {}

  createUnavailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      unavailabilityReasonId: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createAvailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createBookForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      skillId: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error) || error.error.detail));

    return EMPTY;
  }

  handleErrorMessage(error: HttpErrorResponse): Observable<ScheduleBookingErrors[]>{
    const bookErrors = error.error.errors.CreateBookingsCommand;

    if(bookErrors) {
      return of(JSON.parse(bookErrors));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      return EMPTY;
    }
  }

  createAvailabilityUnavailability(
    scheduleForm: FormGroup,
    scheduleItemsComponent: ScheduleItemsComponent,
    scheduleType: number,
    customShiftId: number
  ): ScheduleInt.Schedule {
    const { shiftId, startTime, endTime, unavailabilityReasonId = null } = scheduleForm.getRawValue();
    return  {
      employeeScheduledDays: this.getEmployeeScheduledDays(scheduleItemsComponent.scheduleItems),
      scheduleType,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
    };
  }

  createBooking(
    scheduleForm: FormGroup,
    scheduleItemsComponent: ScheduleItemsComponent,
    customShiftId: number
  ): ScheduleInt.ScheduleBook {
    const { departmentId,skillId, shiftId, startTime, endTime } = scheduleForm.getRawValue();

    return  {
      employeeBookedDays: this.getEmployeeBookedDays(scheduleItemsComponent.scheduleItems),
      departmentId: departmentId,
      skillId: skillId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
    };
  }

  getEmployeeScheduledDays(scheduleItems: CreateScheduleItem[]): ScheduleInt.EmployeeScheduledDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const dates: string[] = item.selectedDates
        .map((date: Date) => DateTimeHelper.toUtcFormat(DateTimeHelper.setInitDateHours(date)));

      return {
        employeeId: item.candidateId,
        dates,
      };
    });
  }

  getEmployeeBookedDays(scheduleItems: CreateScheduleItem[]): EmployeeBookingDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const bookedDays = item.selectedDates.map((date: Date) => {
        const initDate = new Date(date.setHours(0, 0, 0));

        return DateTimeHelper.toUtcFormat(initDate);
      });

      return {
        employeeId: item.candidateId,
        bookedDays,
      };
    });
  }

  getDaySchedules(candidateId: number, dateString: string): ScheduleInt.ScheduleItem[] {
    const dateStringLength = 10;
    const formattedDateSting = dateString.substring(0, dateStringLength);
    const candidateData: ScheduleInt.ScheduleModel = this.scheduleData
      .find((data: ScheduleInt.ScheduleModel) => data.candidate.id === candidateId) as ScheduleInt.ScheduleModel;

    if (candidateData.schedule.length) {
      const dateSchedule: ScheduleInt.ScheduleDateItem | undefined = candidateData.schedule
        .find((scheduleItem: ScheduleInt.ScheduleDateItem) =>
          scheduleItem.date.substring(0, dateStringLength) === formattedDateSting
        );

      if (dateSchedule) {
        return dateSchedule.daySchedules;
      }
    }

    return [];
  }

  // TODO: replace with helper function from schedule.helper.ts
  mapToDropdownOptions(items: { name: string; id: number }[]): DropdownOption[] {
    return items.map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
  }

  getScheduleTypesWithPermissions(
    scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>,
    userPermission: Permission
  ): ReadonlyArray<ScheduleTypeRadioButton> {
    let types = scheduleTypes.map((item: ScheduleTypeRadioButton) => {
      return {
        ...item,
        disabled: !userPermission[item.permission],
      };
    });

    if (this.store.selectSnapshot(UserState.user)?.isEmployee) {
      types = types.filter((type: ScheduleTypeRadioButton) => type.value !== ScheduleItemType.Book);
    }

    return types;
  }

  getFirstAllowedScheduleType(scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>): ScheduleItemType {
    return (scheduleTypes.find((item: ScheduleTypeRadioButton) => !item.disabled) as ScheduleTypeRadioButton)?.value;
  }
}
