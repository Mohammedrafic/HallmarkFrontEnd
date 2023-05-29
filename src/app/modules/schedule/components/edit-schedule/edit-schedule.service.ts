import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable } from 'rxjs';

import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { ScheduledItem, ScheduleItem } from 'src/app/modules/schedule/interface';
import { ShowToast } from 'src/app/store/app.actions';

import { ScheduleItemType } from '../../constants';
import { ScheduleType } from '../../enums';
import { ScheduledShiftForm } from './edit-schedule.interface';

@Injectable()
export class EditScheduleService {

  constructor(private fb: FormBuilder, private store: Store) {}

  createScheduledShiftForm(): CustomFormGroup<ScheduledShiftForm> {
    return this.fb.group({
      date: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      skillId: [null],
      orientated: [false],
      critical: [false],
      oncall: [false],
      charge: [false],
      preceptor: [false],
      meal: [true],
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  createNewShiftForm(): CustomFormGroup<ScheduledShiftForm> {
    return this.fb.group({
      date: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      orientated: [false],
      critical: [false],
      oncall: [false],
      charge: [false],
      preceptor: [false],
      meal: [true],
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  createScheduledAvailabilityForm(): CustomFormGroup<ScheduledShiftForm> {
    return this.fb.group({
      date: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      skillId: [null],
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  createNewAvailabilityForm(): CustomFormGroup<ScheduledShiftForm> {
    return this.fb.group({
      date: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  createScheduledUnavailabilityForm(): CustomFormGroup<ScheduledShiftForm> {
    return this.fb.group({
      date: [null, Validators.required],
      unavailabilityReasonId: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error) || error.error.detail));

    return EMPTY;
  }

  getDepartmentId(departments: DropdownOption[], id: number): number | null {
    const departmentId = departments.find((item: DropdownOption) => item.value === id) ? id : null;

    return departmentId;
  }

  getSkillId(
    selectedDaySchedule: ScheduleItem,
    availabilityOpenPositionSkillId: number | null,
    skillOption: DropdownOption[],
    isCreateMode: boolean
  ): number {
    if (availabilityOpenPositionSkillId) {
      return availabilityOpenPositionSkillId;
    }

    const skillId = selectedDaySchedule?.orderMetadata?.primarySkillId && !isCreateMode
      ? selectedDaySchedule?.orderMetadata?.primarySkillId
      : skillOption[0]?.value;

    return skillId as number;
  }

  getLocationId(locations: DropdownOption[], id: number): number | null {
    const locationId = locations.find((item: DropdownOption) => item.value === id) ? id : null;

    return locationId;
  }

  getFormClass(
    selectedType: ScheduleItemType | ScheduleType,
    type: typeof ScheduleItemType | typeof ScheduleType,
    isCustomShift: boolean,
    isCreateMode: boolean,
    isEmployee: boolean,
  ): string {
    let formClass = '';

    if (selectedType === type.Book && !isCreateMode) {
      formClass = isCustomShift
        ? 'scheduled-shift-form custom-scheduled-shift-form'
        : 'scheduled-shift-form';
    } else if (selectedType === type.Book && isCreateMode) {
      formClass = isCustomShift
        ? 'new-shift-form custom-new-shift-form'
        : 'new-shift-form';
    } else if (selectedType === type.Unavailability) {
      formClass = isCustomShift
        ? 'scheduled-unavailability-form custom-scheduled-unavailability-form'
        : 'scheduled-unavailability-form';
    } else if (selectedType === type.Availability && !isCreateMode && !isEmployee) {
      formClass = isCustomShift
        ? 'scheduled-availability-form custom-scheduled-availability-form'
        : 'scheduled-availability-form';
    } else if (selectedType === type.Availability && (isCreateMode || isEmployee)) {
      formClass = isCustomShift
        ? 'new-availability-form custom-new-availability-form'
        : 'scheduled-availability-form';
    }

    return formClass;
  }

  hasScheduleAvailability(scheduledItem: ScheduledItem): boolean {
    return scheduledItem.schedule.daySchedules
      .some((day: ScheduleItem) => day.scheduleType === ScheduleType.Availability);
  }
}
