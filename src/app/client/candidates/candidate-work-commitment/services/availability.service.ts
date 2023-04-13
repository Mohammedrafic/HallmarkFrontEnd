import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AvailabilityFilterColumns } from '../enums/availability-filter-columns.enum';
import { AvailabilityRestriction, AvailabilityRestrictionFormState } from '../interfaces';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';

@Injectable()
export class AvailabilityService {
  
  public createAvailabilityForm(): CustomFormGroup<AvailabilityRestrictionFormState> {
    return new FormGroup({
      [AvailabilityFilterColumns.START_DAY]: new FormControl(null, [Validators.required]),
      [AvailabilityFilterColumns.END_DAY]: new FormControl(null, [Validators.required]),
      [AvailabilityFilterColumns.START_TIME]: new FormControl(null, [Validators.required]),
      [AvailabilityFilterColumns.END_TIME]: new FormControl(null, [Validators.required]),
    }) as CustomFormGroup<AvailabilityRestrictionFormState>;
  }

  public createRestrictionPayload(
    formData: AvailabilityRestrictionFormState,
    employeeId: number,
    restrictionId: number | null,
  ): AvailabilityRestriction {
    return {
      ...formData,
      id: restrictionId,
      candidateProfileId: employeeId,
      startTime: DateTimeHelper.toUtcFormat(formData.startTime),
      endTime: DateTimeHelper.toUtcFormat(formData.endTime),
    };
  }
}
