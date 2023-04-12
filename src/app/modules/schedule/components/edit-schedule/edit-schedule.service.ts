import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { ShowToast } from 'src/app/store/app.actions';
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
    }) as CustomFormGroup<ScheduledShiftForm>;
  }

  createScheduledAvailabilityForm(): CustomFormGroup<ScheduledShiftForm> {
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
}
